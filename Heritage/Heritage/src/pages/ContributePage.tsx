import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Send, CheckCircle2 } from 'lucide-react';
import type { UserContribution } from '../types';

export const ContributePage: React.FC = () => {
  const [contributions, setContributions] = useState<UserContribution[]>([]);
  const [siteName, setSiteName] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [type, setType] = useState<'Folklore' | 'Photo' | 'Correction' | 'Personal Memory'>('Folklore');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('living_heritage_contributions') || '[]');
      setContributions(stored);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName || !contributorName || !content) return;

    const newContrib: UserContribution = {
      id: Date.now().toString(),
      siteName,
      contributorName,
      type,
      content,
      timestamp: new Date().toLocaleDateString(),
      approved: true, // stored locally
    };

    const updated = [newContrib, ...contributions];
    setContributions(updated);
    localStorage.setItem('living_heritage_contributions', JSON.stringify(updated));

    setSiteName('');
    setContributorName('');
    setContent('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-azulejo-50 text-azulejo-800 text-xs font-bold">
          <MessageSquareQuote className="w-3.5 h-3.5 text-azulejo-600" />
          <span>Community Repository</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-stone-900">
          Contribute Folklore & Memories
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm">
          Submit village lore, archival corrections, or personal family stories to enrich the Living Heritage archives
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Form Column */}
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-lg space-y-6">
          <h2 className="font-serif font-bold text-xl text-stone-900">
            Submit a Community Heritage Record
          </h2>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your story has been recorded and saved locally.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Heritage Site / Village Name</label>
              <input
                type="text"
                placeholder="e.g. Reis Magos Fort, Fontainhas, Chandor"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Your Name / Contributor Name</label>
              <input
                type="text"
                placeholder="e.g. Maria Fernandes"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Contribution Type</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-terracotta-500 font-semibold"
              >
                <option value="Folklore">Folklore & Legend</option>
                <option value="Personal Memory">Personal Family Memory</option>
                <option value="Correction">Factual Correction / Citation</option>
                <option value="Photo">Photo Link & Credit</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Story / Lore / Information</label>
              <textarea
                rows={5}
                placeholder="Share the oral history, legend, or factual context..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Contribution</span>
            </button>
          </form>
        </div>

        {/* Existing Community Submissions Column */}
        <div className="space-y-4">
          <h2 className="font-serif font-bold text-xl text-stone-900">
            Recent Community Submissions ({contributions.length})
          </h2>

          {contributions.length === 0 ? (
            <div className="bg-stone-50 p-8 rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
              No user contributions submitted yet. Be the first to record local folklore!
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {contributions.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-azulejo-700 bg-azulejo-50 px-2.5 py-0.5 rounded-md">
                      {c.type} • {c.siteName}
                    </span>
                    <span className="text-[10px] text-stone-400">{c.timestamp}</span>
                  </div>
                  <p className="text-stone-800 font-sans leading-relaxed">
                    "{c.content}"
                  </p>
                  <span className="text-[10px] text-stone-500 block font-semibold">
                    Submitted by {c.contributorName}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
