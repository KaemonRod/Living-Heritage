import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, 
  Map, 
  Sparkles, 
  Bookmark, 
  Award, 
  Palette, 
  Menu, 
  X, 
  Dices,
  Home,
  MessageSquareQuote
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [passportCount, setPassportCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const updateCounts = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('living_heritage_saved') || '[]');
        const stamps = JSON.parse(localStorage.getItem('living_heritage_stamps') || '[]');
        setSavedCount(saved.length);
        setPassportCount(stamps.length);
      } catch (e) {
        console.error(e);
      }
    };

    updateCounts();
    const interval = setInterval(updateCounts, 2000);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore Sites', icon: Compass },
    { path: '/map', label: 'Live Map', icon: Map },
    { path: '/trails', label: 'Smart Trails', icon: RouteIcon },
    { path: '/ai-guide', label: 'AI Heritage Guide', icon: Sparkles },
    { path: '/crafts-voices', label: 'Crafts & Voices', icon: Palette },
    { path: '/passport', label: 'Heritage Passport', icon: Award, badge: passportCount },
  ];

  function RouteIcon(props: any) {
    return (
      <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    );
  }

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-stone-900/90 backdrop-blur-md shadow-xl border-b border-stone-800 text-white py-3' 
          : 'bg-gradient-to-b from-stone-950/90 via-stone-900/70 to-transparent text-white py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl terracotta-gradient flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-amber-300/30">
            <span className="font-serif font-black text-white text-xl tracking-wider">H</span>
          </div>
          <div>
            <span className="font-serif font-bold text-xl tracking-tight text-white block group-hover:text-amber-300 transition-colors">
              Living Heritage
            </span>
            <span className="text-[10px] tracking-widest uppercase text-amber-400/90 font-medium block -mt-1">
              Goa Discovery Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-900/60 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  active
                    ? 'bg-terracotta-500 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-amber-200' : 'text-stone-400'}`} />
                <span>{link.label}</span>
                {typeof link.badge === 'number' && link.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-400 text-stone-950">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Surprise Me Quick Launcher */}
          <Link
            to="/explore?surprise=true"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-azulejo-600 hover:bg-azulejo-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-105 border border-azulejo-400/30"
            title="Discover a random Goa heritage gem"
          >
            <Dices className="w-3.5 h-3.5 text-azulejo-200 animate-spin-slow" />
            <span>Surprise Me</span>
          </Link>

          {/* Saved Items Counter Link */}
          <Link
            to="/explore?saved=true"
            className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors relative"
            title="Saved Heritage Sites"
          >
            <Bookmark className="w-5 h-5" />
            {savedCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-terracotta-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {savedCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/10 text-stone-200 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-stone-950/95 border-b border-stone-800 backdrop-blur-xl p-4 shadow-2xl animate-fade-in">
          <div className="space-y-1 max-w-md mx-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-terracotta-600 text-white'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-amber-300" />
                    <span>{link.label}</span>
                  </div>
                  {typeof link.badge === 'number' && link.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-stone-950">
                      {link.badge} Stamps
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-3 border-t border-stone-800 flex gap-2">
              <Link
                to="/explore?surprise=true"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-3 bg-azulejo-600 hover:bg-azulejo-500 text-white rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-lg"
              >
                <Dices className="w-4 h-4" />
                Surprise Me
              </Link>
              <Link
                to="/contribute"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5"
              >
                <MessageSquareQuote className="w-4 h-4 text-amber-400" />
                Contribute
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
