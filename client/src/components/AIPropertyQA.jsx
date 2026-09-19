import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Bot, User, HelpCircle, ShieldAlert } from 'lucide-react';
import { aiService } from '../services/aiService';

const SUGGESTED_QUESTIONS = [
  'Does this property have dedicated parking?',
  'What is the total security deposit required?',
  'Is this apartment fully furnished?',
  'What amenities are included in the building?',
  'When is this property available to move in?',
];

const AIPropertyQA = ({ property }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I'm your AI Property Assistant for this listing. Ask me anything about this ${property.bedrooms} BHK ${property.propertyType} in ${property.location.area}!`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (questionText) => {
    const q = questionText || question;
    if (!q || !q.trim()) return;

    const userMessage = { sender: 'user', text: q.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const data = await aiService.askPropertyQuestion(property._id, q.trim());
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer,
          grounded: data.grounded,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text:
            err.response?.data?.message ||
            'I could not reach the AI service right now. Please check the property details above or contact the owner directly!',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden flex flex-col h-[480px]">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Ask AI About This Listing</span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                GROUNDED
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Verified answers strictly using this listing's database records
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start space-x-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : msg.isError
                  ? 'bg-rose-900/40 text-rose-200 border border-rose-800 rounded-tl-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center flex-shrink-0 text-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-2">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-400 flex items-center space-x-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Analyzing listing specifics...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="py-2 flex-shrink-0 border-t border-slate-800/80">
        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5 flex items-center space-x-1">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Quick questions:</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg whitespace-nowrap transition-colors flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2 pt-2 border-t border-slate-800 flex-shrink-0"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this property..."
          disabled={loading}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-50 shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIPropertyQA;
