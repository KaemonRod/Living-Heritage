import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Compass, 
  Sparkles, 
  Award, 
  Palette, 
  ArrowRight, 
  ShieldCheck, 
  Dices, 
  Map as MapIcon,
  ChevronRight,
  Landmark
} from 'lucide-react';
import { heritageService } from '../services/heritageService';
import { HeritageCard } from '../components/HeritageCard';
import { VerifiedHeritageImage } from '../components/VerifiedHeritageImage';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const allSites = heritageService.getAllHeritageSites();
  const trails = heritageService.getAllSmartTrails();
  const featuredSites = allSites.slice(0, 6);
  const surpriseSite = heritageService.getRandomHeritageSite();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { label: 'All Heritage', icon: Landmark, count: allSites.length, filter: 'All' },
    { label: 'Coastal Forts', icon: Compass, count: allSites.filter(s=>s.category==='Fort').length, filter: 'Fort' },
    { label: 'Churches & Basilicas', icon: Sparkles, count: allSites.filter(s=>s.category==='Church').length, filter: 'Church' },
    { label: 'Indo-Portuguese Temples', icon: Landmark, count: allSites.filter(s=>s.category==='Temple').length, filter: 'Temple' },
    { label: 'Latin Quarters', icon: Palette, count: allSites.filter(s=>s.category==='Neighborhood').length, filter: 'Neighborhood' },
    { label: 'Aristocratic Manors', icon: Award, count: allSites.filter(s=>s.category==='House').length, filter: 'House' },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-stone-950 text-white overflow-hidden pt-12 pb-24">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://s7ap1.scene7.com/is/image/incredibleindia/basilica-of-bom-jesus-goa-2-musthead-hero?qlt=82&ts=1742156651015"
            alt="Living Heritage Goa"
            className="w-full h-full object-cover opacity-35 scale-105 filter saturate-120 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/40" />
          <div className="absolute inset-0 azulejo-bg opacity-15" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center space-y-8">
          {/* Badge Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900/90 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Sourced Wikimedia Commons Credits & Verifiable History</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white leading-none drop-shadow-2xl">
              Living Heritage of <span className="text-transparent bg-clip-text terracotta-gradient">Goa</span>
            </h1>
            <p className="text-stone-300 text-base sm:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
              Explore 16th-century basilicas, coastal red laterite forts, 12th-century stone sanctuaries, living crafts, and oral storytellers.
            </p>
          </div>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
            <div className="relative flex items-center bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border-2 border-stone-200 focus-within:border-terracotta-500 transition-all">
              <Search className="w-6 h-6 text-stone-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search forts, churches, temples, talukas, or azulejos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-stone-900 placeholder-stone-400 text-sm font-medium focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Stats Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="font-serif font-extrabold text-2xl text-amber-400 block">15+</span>
              <span className="text-xs text-stone-400">Verified Heritage Sites</span>
            </div>
            <div className="bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="font-serif font-extrabold text-2xl text-azulejo-300 block">4</span>
              <span className="text-xs text-stone-400">Curated Smart Trails</span>
            </div>
            <div className="bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="font-serif font-extrabold text-2xl text-emerald-400 block">100%</span>
              <span className="text-xs text-stone-400">Attributed Photos</span>
            </div>
            <div className="bg-stone-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center">
              <span className="font-serif font-extrabold text-2xl text-amber-300 block">PWA</span>
              <span className="text-xs text-stone-400">Offline Pack Supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Quick Filter Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
              Browse Heritage Categories
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Filter Goa's rich architectural periods and monuments
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-azulejo-600 hover:text-azulejo-800 flex items-center gap-1 hover:underline"
          >
            <span>View All Sites</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.label}
                to={cat.filter === 'All' ? '/explore' : `/explore?category=${cat.filter}`}
                className="group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-azulejo-300 transition-all text-center flex flex-col items-center justify-center space-y-2 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-2xl bg-azulejo-50 text-azulejo-700 group-hover:bg-azulejo-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-serif font-semibold text-xs text-stone-800 group-hover:text-azulejo-700">
                  {cat.label}
                </span>
                <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                  {cat.count} sites
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Heritage Sites */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
              Featured Monuments & Landmarks
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Curated locations with complete historical research, audio guides, and quizzes
            </p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:flex text-xs font-bold text-azulejo-600 hover:text-azulejo-800 items-center gap-1 hover:underline"
          >
            <span>Explore All {allSites.length} Sites</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredSites.map((site) => (
            <HeritageCard key={site.id} site={site} />
          ))}
        </div>
      </section>

      {/* Serendipity & Random Explorer Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-azulejo-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-stone-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 azulejo-bg opacity-20 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-extrabold uppercase tracking-wider">
                <Dices className="w-3.5 h-3.5" />
                Serendipitous Gem of the Day
              </span>

              <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white leading-tight">
                {surpriseSite.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                <MapPin className="w-4 h-4" />
                <span>{surpriseSite.location.taluka}, {surpriseSite.district}</span>
                <span>•</span>
                <span>{surpriseSite.era}</span>
              </div>

              <p className="text-stone-300 text-sm leading-relaxed max-w-lg">
                {surpriseSite.shortDescription}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to={`/site/${surpriseSite.id}`}
                  className="px-6 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                >
                  <span>Explore {surpriseSite.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/explore?surprise=true"
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 text-stone-200 font-semibold text-xs rounded-xl transition-colors flex items-center gap-2"
                >
                  <Dices className="w-4 h-4 text-amber-400" />
                  <span>Spin Another Gem</span>
                </Link>
              </div>
            </div>

            <div className="lg:pl-8">
              <VerifiedHeritageImage
                image={surpriseSite.images[0]}
                aspectRatio="aspect-[4/3]"
                className="shadow-2xl rounded-2xl border border-white/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Smart Trails Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900">
              Curated Smart Heritage Trails
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Step-by-step guided itineraries with interactive route maps and duration estimates
            </p>
          </div>
          <Link
            to="/trails"
            className="text-xs font-bold text-azulejo-600 hover:text-azulejo-800 flex items-center gap-1 hover:underline"
          >
            <span>All Trails ({trails.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trails.slice(0, 2).map((trail) => (
            <div key={trail.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-lg hover:shadow-2xl transition-all flex flex-col sm:flex-row group">
              <div className="sm:w-1/2">
                <VerifiedHeritageImage
                  image={trail.coverImage}
                  aspectRatio="aspect-square sm:aspect-full"
                  className="h-full"
                  allowZoom={false}
                />
              </div>
              <div className="sm:w-1/2 p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-azulejo-600 bg-azulejo-50 px-2.5 py-1 rounded-md">
                    {trail.category}
                  </span>

                  <h3 className="font-serif font-bold text-stone-900 text-xl mt-3 group-hover:text-azulejo-700 transition-colors">
                    {trail.title}
                  </h3>

                  <p className="text-xs text-stone-500 italic mt-1">
                    {trail.subtitle}
                  </p>

                  <p className="text-stone-600 text-xs mt-3 leading-relaxed">
                    {trail.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-700">
                    ⏱️ {trail.durationMinutes} mins • 📍 {trail.distanceKm} km
                  </span>
                  <Link
                    to={`/trails/${trail.id}`}
                    className="font-bold text-terracotta-600 hover:text-terracotta-800 flex items-center gap-1"
                  >
                    <span>Start Trail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Map Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="terracotta-gradient rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif font-bold text-2xl sm:text-3xl">
              Explore Monuments Near You on Live Map
            </h3>
            <p className="text-terracotta-100 text-xs sm:text-sm max-w-xl">
              Use your device geolocation to locate nearby 16th-century forts, hidden temples, and colonial streets within driving distance.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/map"
              className="px-6 py-3.5 bg-white text-stone-950 font-bold text-xs rounded-xl shadow-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
            >
              <MapIcon className="w-4 h-4 text-terracotta-600" />
              <span>Open Interactive Map</span>
            </Link>
            <Link
              to="/near-me"
              className="px-5 py-3.5 bg-terracotta-700/80 text-white font-semibold text-xs rounded-xl border border-terracotta-400/40 hover:bg-terracotta-800 transition-colors"
            >
              Near Me
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
