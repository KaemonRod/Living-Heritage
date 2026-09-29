import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Grid, 
  List, 
  Dices, 
  Bookmark, 
  Sparkles, 
  X, 
  Compass, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { heritageService } from '../services/heritageService';
import { HeritageCard } from '../components/HeritageCard';
import { VerifiedHeritageImage } from '../components/VerifiedHeritageImage';
import type { HeritageSite } from '../types';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedTaluka, setSelectedTaluka] = useState(searchParams.get('taluka') || 'All');
  const [hiddenGemOnly, setHiddenGemOnly] = useState(searchParams.get('hidden') === 'true');
  const [freeEntryOnly, setFreeEntryOnly] = useState(searchParams.get('free') === 'true');
  const [savedOnly, setSavedOnly] = useState(searchParams.get('saved') === 'true');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [surpriseSite, setSurpriseSite] = useState<HeritageSite | null>(null);

  useEffect(() => {
    if (searchParams.get('surprise') === 'true') {
      triggerSurprise();
    }
  }, [searchParams]);

  const savedIds: string[] = JSON.parse(localStorage.getItem('living_heritage_saved') || '[]');

  const filteredSites = heritageService.searchHeritageSites(query, {
    category: selectedCategory,
    taluka: selectedTaluka,
    hiddenGemOnly,
    freeEntryOnly,
    savedOnly,
    savedIds,
  });

  const categories = ['All', 'Fort', 'Church', 'Temple', 'Neighborhood', 'House', 'Mosque', 'Museum'];
  const talukas = ['All', 'Tiswadi', 'Bardez', 'Salcete', 'Ponda', 'Canacona', 'Dharbandora'];

  const triggerSurprise = () => {
    const random = heritageService.getRandomHeritageSite(surpriseSite?.id);
    setSurpriseSite(random);
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedCategory('All');
    setSelectedTaluka('All');
    setHiddenGemOnly(false);
    setFreeEntryOnly(false);
    setSavedOnly(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-azulejo-50 text-azulejo-800 text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Goa Heritage Directory</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-stone-900">
            Explore Heritage Locations
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Search verified monuments, forts, and temples with open archival credits
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Surprise Me Button */}
          <button
            onClick={triggerSurprise}
            className="px-4 py-2.5 rounded-xl bg-azulejo-600 hover:bg-azulejo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all hover:scale-105"
          >
            <Dices className="w-4 h-4 text-amber-300" />
            <span>Surprise Me</span>
          </button>

          {/* View Switcher */}
          <div className="bg-stone-200 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'list' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        {/* Search & Category Pills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by name, era, style, or tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:border-terracotta-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Taluka Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-600 shrink-0">Taluka:</span>
            <select
              value={selectedTaluka}
              onChange={(e) => setSelectedTaluka(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-terracotta-500"
            >
              {talukas.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Talukas (North & South Goa)' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Special Toggles */}
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => setHiddenGemOnly(!hiddenGemOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                hiddenGemOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Hidden Gems</span>
            </button>

            <button
              onClick={() => setFreeEntryOnly(!freeEntryOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                freeEntryOnly
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free Entry</span>
            </button>

            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                savedOnly
                  ? 'bg-terracotta-100 border-terracotta-300 text-terracotta-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Saved ({savedIds.length})</span>
            </button>
          </div>

        </div>

        {/* Category Horizontal Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-stone-100 pt-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}

          {(query || selectedCategory !== 'All' || selectedTaluka !== 'All' || hiddenGemOnly || freeEntryOnly || savedOnly) && (
            <button
              onClick={resetFilters}
              className="ml-auto px-3 py-1.5 text-xs font-bold text-terracotta-600 hover:text-terracotta-800 flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
        <span>
          Showing {filteredSites.length} of {heritageService.getAllHeritageSites().length} Goan heritage sites
        </span>
        {savedOnly && (
          <span className="text-terracotta-600">
            Filtered by your saved items
          </span>
        )}
      </div>

      {/* Results Listing View */}
      {filteredSites.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-xl text-stone-800">
            No matching heritage sites found
          </h3>
          <p className="text-stone-500 text-xs max-w-sm mx-auto">
            Try adjusting your search keywords, clearing taluka filters, or turning off the saved items filter.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSites.map((site) => (
            <HeritageCard key={site.id} site={site} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSites.map((site) => (
            <div
              key={site.id}
              className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="w-full sm:w-48 shrink-0">
                <VerifiedHeritageImage
                  image={site.images[0]}
                  aspectRatio="aspect-[16/10]"
                  allowZoom={false}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                    {site.category}
                  </span>
                  <span className="text-xs text-stone-500">
                    {site.location.taluka}, {site.district}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  {site.title}
                </h3>
                <p className="text-stone-600 text-xs line-clamp-2">
                  {site.shortDescription}
                </p>
              </div>
              <a
                href={`/site/${site.id}`}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl shrink-0 hover:bg-stone-800 transition-colors"
              >
                View Site
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Surprise Me Modal */}
      {surpriseSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative text-stone-900 space-y-4">
            <button
              onClick={() => setSurpriseSite(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-azulejo-700 text-xs font-bold uppercase tracking-wider">
              <Dices className="w-4 h-4 text-amber-500" />
              <span>Serendipity Gem Found!</span>
            </div>

            <h3 className="font-serif font-bold text-2xl text-stone-900">
              {surpriseSite.title}
            </h3>

            <VerifiedHeritageImage
              image={surpriseSite.images[0]}
              aspectRatio="aspect-video"
            />

            <p className="text-stone-600 text-xs leading-relaxed">
              {surpriseSite.shortDescription}
            </p>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={triggerSurprise}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Dices className="w-4 h-4 text-amber-600" />
                <span>Spin Another</span>
              </button>

              <a
                href={`/site/${surpriseSite.id}`}
                className="px-6 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Explore {surpriseSite.title}
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
