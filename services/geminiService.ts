import { GoogleGenAI } from "@google/genai";
import { AttendanceRecord, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateProfessionalReason = async (rawInput: string, leaveType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Rewrite the following leave reason to be professional and concise for a corporate HR system. 
      Leave Type: ${leaveType}
      Raw Reason: "${rawInput}"
      
      Return only the rewritten text, nothing else.`,
    });
    return response.text || rawInput;
  } catch (error) {
    console.error("Error generating reason:", error);
    return rawInput;
  }
};

export const analyzeAttendance = async (records: AttendanceRecord[]): Promise<string> => {
  try {
    const dataString = JSON.stringify(records);
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze the following attendance records and provide a brief, 2-sentence summary of trends (e.g., punctuality, absenteeism).
      Data: ${dataString}`,
    });
    return response.text || "Unable to analyze attendance at this time.";
  } catch (error) {
    console.error("Error analyzing attendance:", error);
    return "Analysis currently unavailable.";
  }
};

export const chatWithAI = async (message: string, history: ChatMessage[]): Promise<string> => {
  try {
    // Convert history to format expected by Gemini if needed, or just send context in prompt for simple single-turn simulation
    // For better chat experience, we use chat sessions.
    
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are JAY, a helpful HR Assistant for JAY HRM software. You help with employee queries, policy info, and system navigation. Be professional, concise, and friendly.",
      }
    });

    // Replay history to establish context (simplified approach for this demo)
    // In a production app, we would maintain the chat session object persistence.
    for (const msg of history) {
      if (msg.sender === 'user') {
        await chat.sendMessage({ message: msg.text });
      }
      // We don't manually add model responses to history in this SDK flow usually, 
      // but strictly speaking we just need to send the new message here since we are re-instantiating.
      // Optimization: For this demo, we will just send the current message with a system prompt context instructions.
    }

    const result = await chat.sendMessage({ message });
    return result.text || "I'm not sure how to respond to that.";
  } catch (error) {
    console.error("Chat error:", error);
    return "I am currently experiencing connection issues. Please try again later.";
  }
};