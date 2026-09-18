import os,uuid,sqlite3
from datetime import datetime,timezone
from fastapi import FastAPI,UploadFile,File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
DB=os.getenv("DB_PATH","./job_agent.db")
app=FastAPI(title="JAY Job AI API",version="1.0.0")
app.add_middleware(CORSMiddleware,allow_origins=os.getenv("CORS_ORIGINS","*").split(","),allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
def db():
 c=sqlite3.connect(DB);c.row_factory=sqlite3.Row;c.execute("CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,title TEXT,company TEXT,location TEXT,url TEXT,source TEXT,description TEXT,score INTEGER,reasons TEXT,posted_at TEXT)");c.execute("CREATE TABLE IF NOT EXISTS applications(id TEXT PRIMARY KEY,job_id TEXT,title TEXT,company TEXT,status TEXT,score INTEGER,url TEXT,cover_letter TEXT,created_at TEXT)");c.commit();return c
class Scan(BaseModel): profile:dict;resume_text:str=""
class Prepare(BaseModel): job:dict;profile:dict;resume_text:str=""
class Track(BaseModel): job:dict;status:str="Ready for review"
async def greenhouse(client,token):
 r=await client.get(f"https://boards-api.greenhouse.io/v1/boards/{token}/jobs?content=true",timeout=20);r.raise_for_status();out=[]
 for j in r.json().get("jobs",[]):out.append({"id":f"gh-{token}-{j['id']}","title":j.get("title",""),"company":token,"location":(j.get("location")or{}).get("name",""),"url":j.get("absolute_url",""),"source":"Greenhouse","description":BeautifulSoup(j.get("content",""),"html.parser").get_text(" ",strip=True),"posted_at":j.get("updated_at","")})
 return out
async def lever(client,site):
 r=await client.get(f"https://api.lever.co/v0/postings/{site}?mode=json",timeout=20);r.raise_for_status();out=[]
 for j in r.json():out.append({"id":f"lv-{site}-{j.get('id')}","title":j.get("text",""),"company":site,"location":(j.get("categories")or{}).get("location",""),"url":j.get("hostedUrl",""),"source":"Lever","description":j.get("descriptionPlain",""),"posted_at":""})
 return out
def score(j,p,resume):
 t=(j.get("title","")+" "+j.get("description","")).lower();s=45;r=[]
 if any(x.lower() in t for x in p.get("roles",[])):s+=25;r.append("HR/People role match")
 if any(x.lower() in (j.get("location","")+" "+j.get("description","")).lower() for x in p.get("locations",[])):s+=12;r.append("Location preference match")
 if any(x in t for x in ["hr operations","recruitment","talent acquisition","onboarding","hrms","employee relations"]):s+=10;r.append("Core HR skills match")
 if any(x in t for x in ["ai","saas","automation","technology","software"]):s+=5;r.append("Technology/AI environment")
 return min(100,s),r[:4]
@app.get("/health")
def health():return {"ok":True}
@app.get("/api/jobs")
def jobs():
 rows=db().execute("SELECT * FROM jobs ORDER BY score DESC,posted_at DESC").fetchall();return {"jobs":[dict(r,reasons=(r["reasons"]or"").split("||")) for r in rows]}
@app.post("/api/jobs/scan")
async def scan(p:Scan):
 found=[]
 async with httpx.AsyncClient(headers={"User-Agent":"JAY-Job-AI/1.0"}) as c:
  for x in [z.strip() for z in os.getenv("GREENHOUSE_BOARDS","").split(",") if z.strip()]:
   try:found+=await greenhouse(c,x)
   except:pass
  for x in [z.strip() for z in os.getenv("LEVER_SITES","").split(",") if z.strip()]:
   try:found+=await lever(c,x)
   except:pass
 if not found:found=[{"id":"demo-1","title":"HR Operations Executive","company":"Demo Feed","location":"Bengaluru","url":"https://example.com/careers","source":"Demo","description":"Demo listing. Configure public job feeds to replace this record.","posted_at":datetime.now(timezone.utc).isoformat()}]
 c=db();out=[]
 for j in found:
  s,r=score(j,p.profile,p.resume_text);j["score"]=s;j["reasons"]=r;c.execute("INSERT OR REPLACE INTO jobs VALUES(?,?,?,?,?,?,?,?,?,?)",(j["id"],j["title"],j["company"],j["location"],j["url"],j["source"],j["description"],s,"||".join(r),j.get("posted_at","")));out.append(j)
 c.commit();return {"jobs":sorted(out,key=lambda x:x["score"],reverse=True),"count":len(out)}
@app.post("/api/profile/resume")
async def resume(file:UploadFile=File(...)):
 data=await file.read();text=""
 try:
  if (file.filename or "").lower().endswith(".pdf"):
   from pypdf import PdfReader
   import io;text="\n".join((p.extract_text()or"")for p in PdfReader(io.BytesIO(data)).pages)
  elif (file.filename or "").lower().endswith(".docx"):
   from docx import Document
   import io;text="\n".join(p.text for p in Document(io.BytesIO(data)).paragraphs)
 except:pass
 return {"filename":file.filename,"text":text[:100000]}
@app.post("/api/applications/prepare")
async def prepare(p:Prepare):
 j=p.job;pr=p.profile
 if os.getenv("OPENAI_API_KEY"):
  try:
   from agents import Agent,Runner
   a=Agent(name="Job Application Writer",instructions="Write truthful concise job application drafts. Never invent experience, credentials or metrics.")
   r=await Runner.run(a,f"Candidate:{pr}\nResume:{p.resume_text[:12000]}\nJob:{j}");return {"cover_letter":r.final_output}
  except:pass
 return {"cover_letter":f"Dear Hiring Team,\n\nI am writing to apply for the {j.get('title')} position at {j.get('company')}. My experience in HR operations, recruitment coordination, onboarding, HRMS, documentation and reporting aligns with this opportunity. I would welcome the chance to discuss my fit.\n\nRegards,\n{pr.get('name','Candidate')}"}
@app.get("/api/applications")
def applications():return {"applications":[dict(x) for x in db().execute("SELECT * FROM applications ORDER BY created_at DESC").fetchall()]}
@app.post("/api/applications")
def application(p:Track):
 j=p.job;now=datetime.now(timezone.utc).isoformat();i=str(uuid.uuid4());db().execute("INSERT INTO applications VALUES(?,?,?,?,?,?,?,?,?)",(i,j.get("id"),j.get("title"),j.get("company"),p.status,int(j.get("score",0)),j.get("url"),"",now));c=db();c.commit();return {"application":{"id":i,"title":j.get("title"),"company":j.get("company"),"status":p.status,"score":j.get("score",0),"url":j.get("url")}}
