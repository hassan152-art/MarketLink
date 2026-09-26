import React, { useState, useRef, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { Bot, X, Send, Sparkles, User, RefreshCw, Leaf, Calendar, Wheat } from 'lucide-react';
import { scaleReveal } from '../animations';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatWindowRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Welcome! I'm **Greenie AI**, your MarketLink shopping assistant! Ask me about market hours, farmer stalls, or finding fresh organic produce!"
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scaleReveal(chatWindowRef.current);
      scrollToBottom();
    }
  }, [messages, isOpen]);


  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await fetchAPI('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg })
      });

      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I am having trouble connecting to MarketLink servers right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Trigger Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-500 text-white font-bold shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all group"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-sm">Ask Greenie AI</span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div ref={chatWindowRef} className="w-80 sm:w-96 h-[480px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-800 to-emerald-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm flex items-center gap-1.5">
                  Greenie AI Assistant <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h4>
                <p className="text-[10px] text-emerald-100">MarketLink Smart Shopping Helper</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200">
                <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
                <span>Greenie AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => setInput("What markets are open this Saturday?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-brand-500 hover:text-brand-700 transition-colors flex items-center gap-1 font-medium"
            >
              <Calendar className="w-3 h-3 text-brand-600 shrink-0" /> Saturday Markets
            </button>
            <button
              onClick={() => setInput("Where can I find fresh sourdough bread?")}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-brand-500 hover:text-brand-700 transition-colors flex items-center gap-1 font-medium"
            >
              <Wheat className="w-3 h-3 text-amber-600 shrink-0" /> Sourdough Bread
            </button>
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about markets, produce, timing..."
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-full text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-full bg-brand-600 text-white disabled:bg-slate-300 hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
