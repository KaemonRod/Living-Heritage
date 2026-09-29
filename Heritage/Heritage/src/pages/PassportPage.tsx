import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Printer, Lock } from 'lucide-react';
import { heritageService } from '../services/heritageService';

export const PassportPage: React.FC = () => {
  const [unlockedStamps, setUnlockedStamps] = useState<any[]>([]);
  const allSites = heritageService.getAllHeritageSites();

  useEffect(() => {
    try {
      const stamps = JSON.parse(localStorage.getItem('living_heritage_stamps') || '[]');
      setUnlockedStamps(stamps);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const progressPercent = Math.round((unlockedStamps.length / allSites.length) * 100);

  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Digital Explorer Passport</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-stone-900">
            Goa Heritage Passport
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Collect verified stamps by completing quizzes and visiting authentic locations
          </p>
        </div>

        {unlockedStamps.length > 0 && (
          <button
            onClick={handlePrintBadge}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print Explorer Certificate</span>
          </button>
        )}
      </div>

      {/* Progress Ring Banner */}
      <div className="azulejo-gradient rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-azulejo-700">
        <div className="space-y-3 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            Collection Status • Level {unlockedStamps.length > 5 ? 'Master Explorer' : 'Novice Adventurer'}
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl">
            {unlockedStamps.length} of {allSites.length} Stamps Unlocked
          </h2>
          <p className="text-azulejo-100 text-xs sm:text-sm max-w-xl">
            Visit site detail pages and test your knowledge of Goan architecture to earn permanent passport badges stored in your browser.
          </p>
        </div>

        {/* Progress Circular Badge */}
        <div className="w-32 h-32 rounded-full bg-stone-950/60 border-4 border-amber-400 flex flex-col items-center justify-center shrink-0 shadow-2xl">
          <span className="font-serif font-black text-3xl text-amber-300">
            {progressPercent}%
          </span>
          <span className="text-[10px] uppercase font-bold text-stone-300 tracking-wider">
            Completed
          </span>
        </div>
      </div>

      {/* Stamp Grid */}
      <section className="space-y-6">
        <h2 className="font-serif font-bold text-2xl text-stone-900">
          Your Heritage Stamp Book ({allSites.length} Monuments)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSites.map((site) => {
            const stamp = unlockedStamps.find((st) => st.siteId === site.id);
            const isUnlocked = !!stamp;

            return (
              <div
                key={site.id}
                className={`rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                  isUnlocked
                    ? 'bg-white border-amber-300 shadow-xl ring-2 ring-amber-400/30'
                    : 'bg-stone-100 border-stone-200 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-200 px-2.5 py-1 rounded-md">
                    {site.category} • {site.location.taluka}
                  </span>

                  {isUnlocked ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-300 text-stone-600 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Stamp Emblem Icon */}
                <div className="text-center py-2">
                  <div
                    className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border-4 shadow-inner transition-transform ${
                      isUnlocked
                        ? 'terracotta-gradient border-amber-300 text-white scale-105'
                        : 'bg-stone-200 border-stone-300 text-stone-400'
                    }`}
                  >
                    <Award className="w-10 h-10" />
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    {site.title}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isUnlocked ? `Unlocked on ${new Date(stamp.unlockedAt).toLocaleDateString()}` : 'Quiz Pending'}
                  </p>
                </div>

                <Link
                  to={`/site/${site.id}`}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs text-center transition-colors ${
                    isUnlocked
                      ? 'bg-stone-900 text-white hover:bg-stone-800'
                      : 'bg-terracotta-500 text-white hover:bg-terracotta-600'
                  }`}
                >
                  {isUnlocked ? 'View Site' : 'Take Quiz to Unlock'}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
