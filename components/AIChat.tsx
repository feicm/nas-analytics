import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PRD_FULL_TEXT } from '../constants';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am the NAS PRD Assistant. Ask me anything about the event schema, architecture, or sampling rules.' }
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
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY || '';
      if (!apiKey) {
        throw new Error("API Key not found in environment");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: `You are an expert technical assistant for the NAS Behavior Data Collection PRD. 
          Use the following PRD content to answer user questions accurately and concisely.
          If the answer is not in the PRD, say so.
          
          PRD CONTENT:
          ${PRD_FULL_TEXT}`,
        }
      });

      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of response) {
         const text = chunk.text;
         if (text) {
             fullResponse += text;
             setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1].text = fullResponse;
                return newArr;
             });
         }
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error connecting to the AI service. Please ensure the API Key is configured." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2">
        <Bot className="text-blue-600" size={20} />
        <h3 className="font-bold text-slate-800">PRD Assistant (Gemini 2.5)</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-blue-600" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-100 text-slate-800 rounded-tl-none'
            }`}>
              {msg.text || <Loader2 className="animate-spin w-4 h-4" />}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-slate-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about sampling rates, event schema, or timeline..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
