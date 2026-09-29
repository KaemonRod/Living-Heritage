import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Bookmark, 
  Award, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  CheckCircle2, 
  Layers, 
  ShieldCheck,
  Navigation,
  SlidersHorizontal
} from 'lucide-react';
import { heritageService } from '../services/heritageService';
import { VerifiedHeritageImage } from '../components/VerifiedHeritageImage';
import { HeritageCard } from '../components/HeritageCard';
import type { HeritageSite } from '../types';

export const HeritageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<HeritageSite | undefined>(undefined);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  // Then vs Now Slider Position (0 to 100)
  const [sliderPos, setSliderPos] = useState(50);

  // Passport Quiz State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Saved / Bookmarked state
  const [isSaved, setIsSaved] = useState(false);
  const [isStamped, setIsStamped] = useState(false);

  useEffect(() => {
    if (id) {
      const s = heritageService.getHeritageSiteById(id);
      setSite(s);
      window.scrollTo(0, 0);

      try {
        const saved: string[] = JSON.parse(localStorage.getItem('living_heritage_saved') || '[]');
        setIsSaved(saved.includes(id));

        const stamps: any[] = JSON.parse(localStorage.getItem('living_heritage_stamps') || '[]');
        const existingStamp = stamps.find((st: any) => st.siteId === id);
        if (existingStamp) {
          setIsStamped(true);
          setQuizPassed(existingStamp.quizPassed);
          setQuizSubmitted(true);
        } else {
          setIsStamped(false);
          setQuizSubmitted(false);
          setSelectedAnswer(null);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [id]);

  if (!site) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif font-bold text-2xl text-stone-800">Site Not Found</h2>
        <p className="text-stone-500 text-xs">The requested Goan heritage site could not be located.</p>
        <Link to="/explore" className="inline-block px-5 py-2.5 bg-stone-900 text-white font-bold text-xs rounded-xl">
          Return to Explore
        </Link>
      </div>
    );
  }

  const toggleSave = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('living_heritage_saved') || '[]');
      let updated: string[];
      if (saved.includes(site.id)) {
        updated = saved.filter((sId) => sId !== site.id);
        setIsSaved(false);
      } else {
        updated = [...saved, site.id];
        setIsSaved(true);
      }
      localStorage.setItem('living_heritage_saved', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Browser Speech Synthesis for Audio Guide
  const toggleAudioGuide = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(site.audioGuide.transcript);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } else {
      setShowTranscript(true);
    }
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === site.passportQuiz.correctIndex;
    setQuizSubmitted(true);
    setQuizPassed(isCorrect);

    if (isCorrect) {
      try {
        const stamps: any[] = JSON.parse(localStorage.getItem('living_heritage_stamps') || '[]');
        if (!stamps.some((st: any) => st.siteId === site.id)) {
          const newStamp = {
            siteId: site.id,
            unlockedAt: new Date().toISOString(),
            quizPassed: true,
          };
          localStorage.setItem('living_heritage_stamps', JSON.stringify([...stamps, newStamp]));
          setIsStamped(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const nearby = heritageService.getNearbyHeritageSites(
    site.location.latitude,
    site.location.longitude,
    3,
    site.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Sites</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSave}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              isSaved
                ? 'bg-terracotta-500 border-terracotta-500 text-white shadow-md'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save Site'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="space-y-4 border-b border-stone-200 pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-900 text-white">
            {site.category}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-azulejo-100 text-azulejo-800">
            {site.location.taluka}, {site.district}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
            {site.era}
          </span>
          {isStamped && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              Passport Stamp Collected
            </span>
          )}
        </div>

        <h1 className="font-serif font-black text-3xl sm:text-5xl text-stone-900">
          {site.title}
        </h1>

        {site.altTitle && (
          <p className="font-serif text-stone-500 text-base sm:text-lg italic">
            {site.altTitle}
          </p>
        )}

        <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-3xl">
          {site.shortDescription}
        </p>
      </div>

      {/* Photo Gallery Grid */}
      <section className="space-y-4">
        <h2 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Verified Archival Photo Gallery</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {site.images.map((img, idx) => (
            <VerifiedHeritageImage
              key={idx}
              image={img}
              aspectRatio="aspect-[16/10]"
              showCreditBadge={true}
            />
          ))}
        </div>
      </section>

      {/* Grid Layout: History + Audio Guide & Visitor Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Detailed History & Architecture */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Audio Guide Box */}
          <div className="azulejo-gradient rounded-3xl p-6 text-white space-y-4 shadow-xl border border-azulejo-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Volume2 className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    {site.audioGuide.title}
                  </h3>
                  <span className="text-xs text-azulejo-200">
                    Audio Guide • {site.audioGuide.duration}
                  </span>
                </div>
              </div>

              <button
                onClick={toggleAudioGuide}
                className="px-5 py-2.5 rounded-xl bg-white text-stone-950 text-xs font-extrabold shadow-lg hover:bg-amber-300 transition-colors flex items-center gap-2"
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4 text-terracotta-600" /> : <Volume2 className="w-4 h-4 text-azulejo-700" />}
                <span>{isPlayingAudio ? 'Pause Narration' : 'Listen Now'}</span>
              </button>
            </div>

            {/* Audio Transcript Toggle */}
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs text-amber-300 hover:underline font-semibold"
              >
                {showTranscript ? 'Hide Audio Transcript' : 'Read Audio Transcript'}
              </button>

              {showTranscript && (
                <div className="mt-3 bg-stone-950/60 p-4 rounded-2xl border border-white/10 text-xs text-stone-200 leading-relaxed font-sans animate-fade-in">
                  "{site.audioGuide.transcript}"
                </div>
              )}
            </div>
          </div>

          {/* Full History & Context */}
          <div className="space-y-4 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              Historical Timeline & Context
            </h2>
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
              {site.fullHistory}
            </p>
          </div>

          {/* Architectural Highlights */}
          <div className="space-y-4 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              Architectural Highlights & Elements
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {site.architecturalHighlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                  <CheckCircle2 className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* "Then vs Now" Interactive Comparison Slider */}
          {site.thenVsNow && (
            <div className="bg-stone-900 p-8 rounded-3xl text-white space-y-6 shadow-xl border border-stone-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md">
                    Archival Time Slider
                  </span>
                  <h2 className="font-serif font-bold text-2xl text-white mt-1">
                    Then vs Now: Architectural Evolution
                  </h2>
                </div>
                <Layers className="w-6 h-6 text-amber-300" />
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {site.thenVsNow.description}
              </p>

              {/* Slider Container */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden select-none border border-white/20">
                {/* Modern Image (Base) */}
                <img
                  src={site.thenVsNow.modernImage.url}
                  alt="Modern View"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-3 right-3 z-10 px-3 py-1 rounded-full bg-stone-950/80 text-white text-[11px] font-bold backdrop-blur-md">
                  Present Day (Modern Photo)
                </span>

                {/* Historical Image (Clipped Overlay) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={site.thenVsNow.historicalImage.url}
                    alt="Historical View"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <span className="absolute bottom-3 left-3 z-10 px-3 py-1 rounded-full bg-stone-950/80 text-amber-300 text-[11px] font-bold backdrop-blur-md">
                    {site.thenVsNow.historicalYear}
                  </span>
                </div>

                {/* Vertical Divider Line & Slider Handle */}
                <div
                  className="absolute inset-y-0 w-1 bg-amber-400 cursor-ew-resize z-20 shadow-2xl"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-2xl border-2 border-white">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Slider Control Bar */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-amber-300">{site.thenVsNow.historicalYear}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <span className="text-stone-300">Modern Era</span>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Visitor Info & Passport Quiz */}
        <div className="space-y-8">
          
          {/* Visitor Info Card */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
              Visitor Information
            </h3>

            <div className="space-y-3.5 text-xs text-stone-700">
              <div>
                <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">Opening Hours</span>
                <p className="font-medium text-stone-900 mt-0.5">{site.visitorInfo.timings}</p>
              </div>

              <div>
                <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">Entry Fee</span>
                <p className="font-medium text-stone-900 mt-0.5">{site.visitorInfo.entryFee}</p>
              </div>

              {site.visitorInfo.dressCode && (
                <div>
                  <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">Dress Code</span>
                  <p className="font-medium text-stone-900 mt-0.5">{site.visitorInfo.dressCode}</p>
                </div>
              )}

              <div>
                <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">Best Time to Visit</span>
                <p className="font-medium text-stone-900 mt-0.5">{site.visitorInfo.bestTimeToVisit}</p>
              </div>

              <div>
                <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">Parking & Access</span>
                <p className="font-medium text-stone-900 mt-0.5">{site.visitorInfo.parking}</p>
              </div>

              <div>
                <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">Accessibility</span>
                <p className="font-medium text-stone-900 mt-0.5">{site.visitorInfo.accessibility}</p>
              </div>
            </div>

            {/* Live Map Link */}
            <div className="pt-3 border-t border-stone-100">
              <Link
                to={`/map?site=${site.id}`}
                className="w-full py-3 bg-azulejo-50 hover:bg-azulejo-100 text-azulejo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-azulejo-200"
              >
                <Navigation className="w-4 h-4 text-azulejo-600" />
                <span>View on Live Map ({site.location.latitude}, {site.location.longitude})</span>
              </Link>
            </div>
          </div>

          {/* Digital Passport Stamp Quiz Widget */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-terracotta-950 p-6 rounded-3xl text-white space-y-4 shadow-xl border border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white">
                  Unlock Digital Passport Stamp
                </h3>
                <p className="text-xs text-stone-400">Answer quiz correctly to collect this stamp</p>
              </div>
            </div>

            {isStamped ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-serif font-bold text-sm text-emerald-300">
                  Stamp Collected!
                </h4>
                <p className="text-xs text-stone-300">
                  This site is permanently stamped in your Heritage Passport.
                </p>
                <Link
                  to="/passport"
                  className="inline-block mt-2 px-4 py-2 bg-emerald-500 text-stone-950 text-xs font-bold rounded-xl"
                >
                  View My Passport
                </Link>
              </div>
            ) : (
              <form onSubmit={handleQuizSubmit} className="space-y-4 text-xs">
                <p className="font-serif font-semibold text-stone-200 text-xs leading-relaxed">
                  {site.passportQuiz.question}
                </p>

                <div className="space-y-2">
                  {site.passportQuiz.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedAnswer === idx
                          ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                          : 'bg-stone-900/60 border-white/10 text-stone-300 hover:bg-stone-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quiz"
                        checked={selectedAnswer === idx}
                        onChange={() => setSelectedAnswer(idx)}
                        className="accent-amber-400"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>

                {quizSubmitted && !quizPassed && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
                    Incorrect answer! Read the historical context above and try again.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={selectedAnswer === null}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-bold text-xs rounded-xl transition-colors shadow-lg"
                >
                  Claim Digital Passport Stamp
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

      {/* Nearby Heritage Recommendations */}
      {nearby.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-stone-200">
          <h2 className="font-serif font-bold text-2xl text-stone-900">
            Nearby Heritage Sites
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearby.map(({ site: nSite, distanceKm }) => (
              <div key={nSite.id} className="relative">
                <HeritageCard site={nSite} />
                <span className="absolute top-4 left-4 z-20 px-2.5 py-1 rounded-full bg-stone-950/80 text-amber-300 text-[11px] font-bold backdrop-blur-md">
                  {distanceKm} km away
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
