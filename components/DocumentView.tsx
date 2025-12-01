import React, { useState, useRef, useEffect } from 'react';
import { FileText, Printer, Download, User, Calendar, DollarSign, Briefcase, Upload, Edit3, RefreshCw, Save, Settings, AlertCircle, Check, FileDown, FileMinus, FilePlus } from 'lucide-react';
import { Employee, Department } from '../types';

// Declare mammoth global variable
declare var mammoth: any;

interface DocumentViewProps {
  employees: Employee[];
}

type DocumentType = 'offer_letter' | 'appointment_letter' | 'relieving_letter' | 'experience_letter';
type Mode = 'generate' | 'template';

const DEFAULT_OFFER_BODY = `Dear {name},

We are pleased to offer you the position of {role} in the {department} department at JAY HRM. We were impressed with your skills and experience and believe you will be a valuable addition to our team.

Your annual Cost to Company (CTC) will be {salary}. The detailed breakdown of your compensation and benefits will be provided in the appointment letter upon joining.

Your expected date of joining is {joiningDate}. Please sign and return a duplicate copy of this letter as a token of your acceptance.

We look forward to welcoming you to the JAY HRM family.

Sincerely,
HR Department
JAY HRM`;

const DEFAULT_APPOINTMENT_BODY = `Dear {name},

Further to your acceptance of our offer and the subsequent joining formalities, we are pleased to appoint you as {role} with effect from {joiningDate}.

1. Compensation:
Your annual compensation package is {salary} per annum. This includes all allowances and statutory benefits as per company policy.

2. Probation:
You will be on probation for a period of 6 months from the date of joining. Upon successful completion, your services will be confirmed in writing.

3. Code of Conduct:
You are expected to adhere to the company's code of conduct, non-disclosure agreement, and other policies as communicated in the employee handbook.

We welcome you aboard and wish you a successful career with us.

Sincerely,
Head of HR
JAY HRM`;

const DEFAULT_RELIEVING_BODY = `TO WHOMSOEVER IT MAY CONCERN

This is to certify that {name} was employed with JAY HRM as {role} in the {department} department from {joiningDate} to {date}.

During their tenure with us, we found them to be sincere, hardworking, and dedicated. They have successfully handed over all responsibilities and no dues are pending against them.

We accept their resignation and relieve them from their duties effective close of business hours on {date}.

We wish them all the best in their future endeavors.

Sincerely,
HR Manager
JAY HRM`;

const DEFAULT_EXPERIENCE_BODY = `TO WHOMSOEVER IT MAY CONCERN

This is to certify that {name} has worked with JAY HRM as {role} from {joiningDate} to {date}.

During their employment, they displayed professional conduct and good performance. They were responsible for duties associated with the {department} department.

Their last drawn annual salary was {salary}.

We wish {firstName} success in their future career path.

Sincerely,
Human Resources
JAY HRM`;

const DocumentView: React.FC<DocumentViewProps> = ({ employees }) => {
  const [activeTab, setActiveTab] = useState<Mode>('generate');
  const [docType, setDocType] = useState<DocumentType>('offer_letter');
  
  // Template States
  const [offerTemplate, setOfferTemplate] = useState(DEFAULT_OFFER_BODY);
  const [appointmentTemplate, setAppointmentTemplate] = useState(DEFAULT_APPOINTMENT_BODY);
  const [relievingTemplate, setRelievingTemplate] = useState(DEFAULT_RELIEVING_BODY);
  const [experienceTemplate, setExperienceTemplate] = useState(DEFAULT_EXPERIENCE_BODY);
  
  const [tempTemplate, setTempTemplate] = useState(''); // For editing in template tab
  const [saveMessage, setSaveMessage] = useState('');

  // Generation States
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [generatedContent, setGeneratedContent] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize temp template when switching doc type in template mode
  useEffect(() => {
    if (activeTab === 'template') {
      switch (docType) {
        case 'offer_letter': setTempTemplate(offerTemplate); break;
        case 'appointment_letter': setTempTemplate(appointmentTemplate); break;
        case 'relieving_letter': setTempTemplate(relievingTemplate); break;
        case 'experience_letter': setTempTemplate(experienceTemplate); break;
      }
      setSaveMessage('');
    }
  }, [docType, activeTab, offerTemplate, appointmentTemplate, relievingTemplate, experienceTemplate]);

  // Update generated content when inputs change
  useEffect(() => {
    if (activeTab === 'generate') {
      if (selectedEmployeeId) {
        const employee = employees.find(e => e.id === selectedEmployeeId);
        if (employee) {
          let template = '';
          switch (docType) {
            case 'offer_letter': template = offerTemplate; break;
            case 'appointment_letter': template = appointmentTemplate; break;
            case 'relieving_letter': template = relievingTemplate; break;
            case 'experience_letter': template = experienceTemplate; break;
          }
          setGeneratedContent(processTemplate(template, employee, customDate));
        }
      } else {
        setGeneratedContent('');
      }
    }
  }, [selectedEmployeeId, docType, customDate, offerTemplate, appointmentTemplate, relievingTemplate, experienceTemplate, activeTab, employees]);

  const processTemplate = (template: string, emp: Employee, date: string) => {
    return template
      .replace(/{name}/g, `${emp.firstName} ${emp.lastName}`)
      .replace(/{firstName}/g, emp.firstName)
      .replace(/{lastName}/g, emp.lastName)
      .replace(/{role}/g, emp.role)
      .replace(/{department}/g, emp.department)
      .replace(/{salary}/g, `$${emp.salary.toLocaleString()}`)
      .replace(/{joiningDate}/g, emp.joinDate)
      .replace(/{date}/g, date) // Current date or Relieving date
      .replace(/{email}/g, emp.email)
      .replace(/{mobile}/g, emp.mobileNumber);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      
      if (file.name.endsWith('.docx')) {
        // Handle Word Document
        reader.onload = (event) => {
          const arrayBuffer = event.target?.result;
          if (typeof mammoth !== 'undefined') {
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
              .then((result: any) => {
                setTempTemplate(result.value);
                setSaveMessage('Word document imported!');
                setTimeout(() => setSaveMessage(''), 3000);
              })
              .catch((err: any) => {
                console.error("Mammoth error:", err);
                setSaveMessage('Error parsing Word file.');
              });
          } else {
             setSaveMessage('Word processor not loaded. Refresh page.');
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // Handle Text File
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setTempTemplate(text);
          setSaveMessage('Text file imported!');
          setTimeout(() => setSaveMessage(''), 3000);
        };
        reader.readAsText(file);
      }
    }
  };

  const saveTemplate = () => {
    switch (docType) {
      case 'offer_letter': setOfferTemplate(tempTemplate); break;
      case 'appointment_letter': setAppointmentTemplate(tempTemplate); break;
      case 'relieving_letter': setRelievingTemplate(tempTemplate); break;
      case 'experience_letter': setExperienceTemplate(tempTemplate); break;
    }
    setSaveMessage('Template saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePrintPDF = () => {
    const printContent = document.getElementById('print-area-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Document</title>');
      printWindow.document.write('<style>body{font-family: "Times New Roman", serif; padding: 40px; line-height: 1.6; color: #000;} .header{text-align:center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px;} .logo{font-size: 24px; font-weight: bold;} .content{white-space: pre-wrap;}</style>');
      printWindow.document.write('</head><body>');
      // Add simplified header for print
      printWindow.document.write('<div class="header"><div class="logo">JAY HRM</div><div>Human Resource Management System</div></div>');
      printWindow.document.write(`<div class="content">${printContent.innerText}</div>`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadWord = () => {
    const content = document.getElementById('print-area-content');
    if (!content) return;
    
    const employee = employees.find(e => e.id === selectedEmployeeId);
    const docTitle = docType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    const fileName = employee ? `${employee.firstName}_${employee.lastName}_${docType}.doc` : 'document.doc';

    // We use innerText to get newlines as actual characters
    const textContent = content.innerText;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <style>
          body { font-family: "Times New Roman", serif; font-size: 12pt; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
          .logo { font-size: 20pt; font-weight: bold; }
          .content { white-space: pre-wrap; font-family: "Times New Roman", serif; }
        </style>
      </head>
      <body>
        <div class="header">
           <div class="logo">JAY HRM</div>
           <div>Human Resource Management System</div>
        </div>
        <div class="content">${textContent}</div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDocTypeName = (type: DocumentType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b border-gray-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Documents</h2>
          <p className="text-gray-500 text-sm mt-1">Generate and manage official HR letters.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-sm">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 text-sm font-bold rounded-sm transition-all flex items-center ${
              activeTab === 'generate' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Printer className="w-4 h-4 mr-2" />
            Generate
          </button>
          <button 
            onClick={() => setActiveTab('template')}
            className={`px-4 py-2 text-sm font-bold rounded-sm transition-all flex items-center ${
              activeTab === 'template' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Template Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-sm">
             <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Document Type</label>
                <div className="grid grid-cols-1 gap-2">
                   {(['offer_letter', 'appointment_letter', 'relieving_letter', 'experience_letter'] as DocumentType[]).map((type) => (
                      <button
                        key={type}
                        onClick={() => setDocType(type)}
                        className={`text-left px-4 py-3 border rounded-sm text-sm font-bold transition-all flex items-center ${
                          docType === type 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50'
                        }`}
                      >
                        {type === 'offer_letter' && <FilePlus className="w-4 h-4 mr-3" />}
                        {type === 'appointment_letter' && <Briefcase className="w-4 h-4 mr-3" />}
                        {type === 'relieving_letter' && <FileMinus className="w-4 h-4 mr-3" />}
                        {type === 'experience_letter' && <Check className="w-4 h-4 mr-3" />}
                        {getDocTypeName(type)}
                      </button>
                   ))}
                </div>
             </div>

             {activeTab === 'generate' ? (
               <>
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Employee</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <select 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-blue-600"
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      >
                        <option value="">-- Select Employee --</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                       {docType === 'relieving_letter' || docType === 'experience_letter' ? 'Relieving Date' : 'Document Date'}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input 
                        type="date"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-sm text-sm focus:ring-1 focus:ring-blue-600"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
                   <button 
                    disabled={!selectedEmployeeId}
                    onClick={handleDownloadWord}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-bold rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs uppercase tracking-wider"
                   >
                     <FileText className="w-4 h-4 mr-2" />
                     Word
                   </button>
                   <button 
                    disabled={!selectedEmployeeId}
                    onClick={handlePrintPDF}
                    className="flex items-center justify-center px-4 py-3 bg-black text-white font-bold rounded-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs uppercase tracking-wider"
                   >
                     <Download className="w-4 h-4 mr-2" />
                     PDF
                   </button>
                </div>
               </>
             ) : (
               <>
                 <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="bg-blue-50 p-4 rounded-sm border border-blue-100">
                      <h4 className="font-bold text-blue-800 text-xs uppercase tracking-wider mb-2">Instructions</h4>
                      <p className="text-xs text-blue-700 leading-relaxed mb-2">
                        Upload a <strong>.docx (Word)</strong> or <strong>.txt</strong> file to update the format.
                      </p>
                      <p className="text-xs text-blue-600">
                        Use placeholders: <code className="bg-white px-1 rounded border border-blue-200">{`{name}`}</code>, <code className="bg-white px-1 rounded border border-blue-200">{`{salary}`}</code>, <code className="bg-white px-1 rounded border border-blue-200">{`{role}`}</code>, <code className="bg-white px-1 rounded border border-blue-200">{`{joiningDate}`}</code>.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Upload Format File</label>
                      <div className="relative group">
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-sm cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">.docx or .txt files</p>
                                </div>
                                <input 
                                  ref={fileInputRef}
                                  type="file" 
                                  className="hidden" 
                                  accept=".txt,.docx"
                                  onChange={handleFileUpload}
                                />
                            </label>
                        </div> 
                      </div>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Edit Template Text</label>
                       <textarea
                         value={tempTemplate}
                         onChange={(e) => setTempTemplate(e.target.value)}
                         rows={10}
                         className="w-full border-gray-300 border p-3 text-xs font-mono rounded-sm focus:ring-1 focus:ring-blue-600 bg-gray-50"
                         placeholder="Paste your template here..."
                       />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                       <button 
                        onClick={saveTemplate}
                        className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white font-bold rounded-sm hover:bg-green-700 transition-colors text-xs uppercase tracking-wider shadow-sm"
                       >
                         <Save className="w-4 h-4 mr-2" />
                         Save Template
                       </button>
                       {saveMessage && (
                         <p className="text-center text-xs font-bold text-green-600 mt-2 animate-fade-in">{saveMessage}</p>
                       )}
                    </div>
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="lg:col-span-2">
           <div className="bg-white border border-gray-200 shadow-sm rounded-sm h-full flex flex-col min-h-[600px]">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                 <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                   {activeTab === 'generate' ? 'Document Preview' : 'Template Editor Preview'}
                 </h3>
                 <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                 </div>
              </div>
              
              <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-gray-50/50">
                 <div className="bg-white shadow-xl min-h-[800px] w-full max-w-3xl mx-auto p-12 relative" id="print-area">
                    {/* Watermark / Header */}
                    <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-end">
                       <div>
                          <h1 className="text-3xl font-bold text-black tracking-tight">JAY HRM</h1>
                          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Human Resource Management</p>
                       </div>
                       <div className="text-right text-xs text-gray-400 font-mono">
                          <p>www.jayhrm.com</p>
                          <p>+91 9778391171</p>
                       </div>
                    </div>

                    {/* Content */}
                    <div className="prose max-w-none text-gray-800 font-serif whitespace-pre-wrap leading-relaxed" id="print-area-content">
                       {activeTab === 'generate' ? (
                          selectedEmployeeId ? (
                            generatedContent
                          ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                               <FileText className="w-12 h-12 mb-4 opacity-20" />
                               <p>Select an employee to generate preview</p>
                            </div>
                          )
                       ) : (
                          tempTemplate || <span className="text-gray-400 italic">Template is empty...</span>
                       )}
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-end">
                       <div className="text-[10px] text-gray-400">
                          <p>Generated by JAY HRM System</p>
                          <p>{new Date().toLocaleDateString()}</p>
                       </div>
                       <div className="h-12 w-32 border-b border-gray-300 mb-4"></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;