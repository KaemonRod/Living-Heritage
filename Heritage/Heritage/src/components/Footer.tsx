import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-stone-300 pt-16 pb-12 border-t border-stone-800 relative overflow-hidden">
      <div className="absolute inset-0 azulejo-bg opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl terracotta-gradient flex items-center justify-center shadow-lg border border-amber-300/30">
                <span className="font-serif font-black text-white text-xl">H</span>
              </div>
              <div>
                <span className="font-serif font-bold text-xl text-white block">
                  Living Heritage
                </span>
                <span className="text-[10px] tracking-widest uppercase text-amber-400 font-medium block -mt-1">
                  Authentic Goa Discovery Platform
                </span>
              </div>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              Discover centuries of Goan architecture, Indo-Portuguese churches, ancient Kadamba temples, majestic coastal forts, living crafts, and community stories.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 p-2.5 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Wikimedia Commons Verified Media Credits & Open Standards</span>
            </div>
          </div>

          {/* Heritage Regions / Talukas */}
          <div>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wide uppercase mb-4 text-amber-400/90">
              Heritage Regions
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/explore?taluka=Tiswadi" className="hover:text-amber-300 transition-colors">Tiswadi (Old Goa & Panaji)</Link></li>
              <li><Link to="/explore?taluka=Bardez" className="hover:text-amber-300 transition-colors">Bardez (Aguada & Reis Magos)</Link></li>
              <li><Link to="/explore?taluka=Salcete" className="hover:text-amber-300 transition-colors">Salcete (Margao & Heritage Houses)</Link></li>
              <li><Link to="/explore?taluka=Ponda" className="hover:text-amber-300 transition-colors">Ponda (Safa Masjid & Temples)</Link></li>
              <li><Link to="/explore?taluka=Canacona" className="hover:text-amber-300 transition-colors">Canacona (Cabo de Rama)</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wide uppercase mb-4 text-amber-400/90">
              Explore & Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/map" className="hover:text-amber-300 transition-colors flex items-center gap-1">Live Interactive Map <ArrowUpRight className="w-3 h-3"/></Link></li>
              <li><Link to="/trails" className="hover:text-amber-300 transition-colors">Curated Smart Trails</Link></li>
              <li><Link to="/ai-guide" className="hover:text-amber-300 transition-colors">Goa AI Heritage Assistant</Link></li>
              <li><Link to="/passport" className="hover:text-amber-300 transition-colors">Digital Heritage Passport</Link></li>
              <li><Link to="/crafts-voices" className="hover:text-amber-300 transition-colors">Living Crafts & Storytellers</Link></li>
            </ul>
          </div>

          {/* Community & Integrity */}
          <div>
            <h4 className="font-serif font-semibold text-white text-sm tracking-wide uppercase mb-4 text-amber-400/90">
              Community & Integrity
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li><Link to="/contribute" className="hover:text-amber-300 transition-colors">Submit Oral History / Photo</Link></li>
              <li><Link to="/about" className="hover:text-amber-300 transition-colors">Attribution Policy</Link></li>
              <li><span className="text-stone-500">Offline PWA Supported</span></li>
              <li><span className="text-stone-500">OpenStreetMap & Leaflet</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Living Heritage Goa. Preserving culture through verified technology.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-terracotta-500 fill-terracotta-500 inline" />
            <span>for Goan Culture & History</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
