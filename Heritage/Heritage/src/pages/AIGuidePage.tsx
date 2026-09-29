import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, ShieldCheck } from 'lucide-react';
import { aiGuideService } from '../services/aiGuideService';
import type { AIMessage } from '../services/aiGuideService';
import { HeritageCard } from '../components/HeritageCard';

export const AIGuidePage: React.FC = () => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Dev Boren Karum! I am your Goa Heritage Assistant. Ask me about 16th-century churches, coastal forts, 12th-century Kadamba temples, Latin quarter streets, or sunset spots across Goa.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const promptChips = [
    'Churches in Old Goa',
    'Best coastal forts for sunset',
    'Indo-Portuguese temples in Ponda',
    'Fontainhas azulejo tiles walk',
    'Hidden offbeat heritage spots',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const botResponse = await aiGuideService.askGuide(query);
      setMessages((prev) => [...prev, botResponse]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-azulejo-50 text-azulejo-800 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Goa Heritage Assist (Rule-Based NLP Engine)</span>
          </div>
          <h1 className="font-serif font-black text-3xl text-stone-900">
            AI Heritage Guide
          </h1>
          <p className="text-stone-600 text-xs mt-0.5">
            Query Goa's architectural periods, history, and monuments with instant dataset recommendations
          </p>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Local Rule Engine Active</span>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-stone-500 shrink-0">Try asking:</span>
        {promptChips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleSend(chip)}
            className="px-3 py-1.5 rounded-full bg-white border border-stone-200 hover:border-azulejo-400 text-stone-700 text-xs font-semibold shrink-0 transition-colors shadow-sm"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-stone-900 rounded-3xl p-6 min-h-[55vh] max-h-[65vh] overflow-y-auto space-y-6 shadow-xl border border-stone-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold shadow-md ${
                msg.sender === 'user' ? 'bg-terracotta-500' : 'azulejo-gradient'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-amber-300" />}
            </div>

            {/* Bubble */}
            <div className={`space-y-4 max-w-2xl ${msg.sender === 'user' ? 'text-right' : ''}`}>
              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-terracotta-600 text-white font-medium rounded-tr-none'
                    : 'bg-stone-800 text-stone-100 border border-stone-700 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] text-stone-400 block mt-1">
                  {msg.timestamp}
                </span>
              </div>

              {/* Recommended Site Cards Grid */}
              {msg.recommendedSites && msg.recommendedSites.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
                  {msg.recommendedSites.map((site) => (
                    <HeritageCard key={site.id} site={site} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-stone-400 text-xs animate-pulse">
            <Bot className="w-5 h-5 text-amber-400" />
            <span>Searching Goa heritage archives...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-white p-2 rounded-2xl border-2 border-stone-200 focus-within:border-terracotta-500 shadow-lg"
      >
        <input
          type="text"
          placeholder="Ask a question about Goa's history, forts, or architecture..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-transparent text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md"
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
