import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bookmark, Award, Sparkles, ArrowRight } from 'lucide-react';
import type { HeritageSite } from '../types';
import { VerifiedHeritageImage } from './VerifiedHeritageImage';

interface Props {
  site: HeritageSite;
  onBookmarkToggle?: () => void;
}

export const HeritageCard: React.FC<Props> = ({ site, onBookmarkToggle }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isStamped, setIsStamped] = useState(false);

  useEffect(() => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('living_heritage_saved') || '[]');
      setIsSaved(saved.includes(site.id));

      const stamps: any[] = JSON.parse(localStorage.getItem('living_heritage_stamps') || '[]');
      setIsStamped(stamps.some((s) => s.siteId === site.id));
    } catch (e) {
      console.error(e);
    }
  }, [site.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('living_heritage_saved') || '[]');
      let updated: string[];
      if (saved.includes(site.id)) {
        updated = saved.filter((id) => id !== site.id);
        setIsSaved(false);
      } else {
        updated = [...saved, site.id];
        setIsSaved(true);
      }
      localStorage.setItem('living_heritage_saved', JSON.stringify(updated));
      if (onBookmarkToggle) onBookmarkToggle();
    } catch (e) {
      console.error(e);
    }
  };

  const primaryImage = site.images && site.images.length > 0 ? site.images[0] : undefined;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
      {/* Card Header & Image */}
      <div className="relative">
        <VerifiedHeritageImage
          image={primaryImage}
          aspectRatio="aspect-[16/10]"
          allowZoom={false}
          showCreditBadge={true}
        />

        {/* Category & Badge Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-900/80 text-white backdrop-blur-md border border-white/20 shadow-md">
            {site.category}
          </span>
          {site.hiddenGem && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-stone-950" />
              Hidden Gem
            </span>
          )}
        </div>

        {/* Bookmark & Stamp Status */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {isStamped && (
            <span 
              className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-emerald-300"
              title="Passport Stamp Unlocked!"
            >
              <Award className="w-4 h-4" />
            </span>
          )}
          <button
            onClick={toggleBookmark}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
              isSaved
                ? 'bg-terracotta-500 text-white scale-110'
                : 'bg-stone-900/70 text-stone-200 hover:bg-stone-900 hover:text-white'
            }`}
            title={isSaved ? 'Remove from bookmarks' : 'Save heritage site'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-azulejo-700 font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
            <span>{site.location.taluka}, {site.district}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500">{site.era}</span>
          </div>

          <h3 className="font-serif font-bold text-stone-900 text-lg group-hover:text-terracotta-600 transition-colors leading-snug">
            {site.title}
          </h3>

          {site.altTitle && (
            <p className="text-xs text-stone-500 italic mt-0.5 font-serif">
              {site.altTitle}
            </p>
          )}

          <p className="text-stone-600 text-xs mt-2.5 line-clamp-2 leading-relaxed">
            {site.shortDescription}
          </p>
        </div>

        {/* Style & Footer details */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
            {site.architecturalStyle}
          </span>

          <Link
            to={`/site/${site.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-azulejo-600 group-hover:text-azulejo-800 hover:underline"
          >
            <span>Explore Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
