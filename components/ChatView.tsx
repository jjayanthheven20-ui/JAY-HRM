import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithAI } from '../services/geminiService';

const ChatView: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I am JAY, your HR Assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await chatWithAI(input, messages);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'ai',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-130px)] md:h-[calc(100vh-8rem)] flex flex-col bg-white border border-gray-200 shadow-sm rounded-sm animate-fade-in overflow-hidden relative">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3 shrink-0">
        <div className="bg-blue-600 p-2 rounded-full shadow-sm">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-black text-sm md:text-base">AI Assistant</h3>
          <p className="text-[10px] md:text-xs text-gray-500">Powered by Gemini 2.5</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-white">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start space-x-2 md:space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.sender === 'user' ? 'bg-black' : 'bg-blue-600'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5 text-white" /> : <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />}
            </div>
            
            <div className={`max-w-[80%] md:max-w-[70%] p-3 md:p-4 rounded-lg shadow-sm text-sm md:text-base ${
              msg.sender === 'user' 
                ? 'bg-black text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <span className={`text-[9px] md:text-[10px] mt-1 md:mt-2 block opacity-70 ${msg.sender === 'user' ? 'text-gray-400' : 'text-gray-500'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
               <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="bg-gray-100 p-3 md:p-4 rounded-lg rounded-tl-none border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-white border-t border-gray-200 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-full md:rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-full md:rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;