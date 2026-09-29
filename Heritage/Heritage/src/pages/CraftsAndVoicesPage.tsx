import React, { useState } from 'react';
import { Palette, Volume2, VolumeX, User } from 'lucide-react';
import { heritageService } from '../services/heritageService';
import { VerifiedHeritageImage } from '../components/VerifiedHeritageImage';

export const CraftsAndVoicesPage: React.FC = () => {
  const crafts = heritageService.getAllLivingCrafts();
  const voices = heritageService.getAllCommunityVoices();

  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const toggleVoiceAudio = (id: string, transcript: string) => {
    if ('speechSynthesis' in window) {
      if (playingVoiceId === id) {
        window.speechSynthesis.cancel();
        setPlayingVoiceId(null);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(transcript);
        utterance.rate = 0.95;
        utterance.onend = () => setPlayingVoiceId(null);
        window.speechSynthesis.speak(utterance);
        setPlayingVoiceId(id);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-50 text-terracotta-800 text-xs font-bold">
          <Palette className="w-3.5 h-3.5 text-terracotta-600" />
          <span>Intangible Heritage & Oral Histories</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-stone-900">
          Living Crafts & Community Voices
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm">
          Honoring Goan tile painters, weavers, coppersmiths, and village elders who preserve unbroken oral traditions
        </p>
      </div>

      {/* Section 1: Living Crafts of Goa */}
      <section className="space-y-8">
        <div>
          <h2 className="font-serif font-bold text-2xl text-stone-900">
            Traditional Crafts & Master Artisans
          </h2>
          <p className="text-stone-600 text-xs mt-1">
            Centuries of specialized material techniques handed down across Goan families
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {crafts.map((craft) => (
            <div key={craft.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-lg flex flex-col space-y-4 p-6">
              <VerifiedHeritageImage
                image={craft.image}
                aspectRatio="aspect-[16/10]"
                allowZoom={false}
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-azulejo-700 bg-azulejo-50 px-3 py-1 rounded-full">
                    📍 {craft.region}
                  </span>
                  {craft.konkaniName && (
                    <span className="text-xs font-serif italic text-stone-500">
                      Konkani: {craft.konkaniName}
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-xl text-stone-900">
                  {craft.title}
                </h3>

                <p className="text-stone-600 text-xs leading-relaxed">
                  {craft.description}
                </p>

                {/* Artisan Spotlight Card */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{craft.craftspersonSpotlight.name}</span>
                    <span className="text-[11px] font-semibold text-terracotta-600">
                      {craft.craftspersonSpotlight.experienceYears} Years Experience
                    </span>
                  </div>
                  <p className="font-serif italic text-stone-700 text-xs">
                    "{craft.craftspersonSpotlight.quote}"
                  </p>
                </div>

                {/* Materials Tags */}
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {craft.materials.map((m, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-md">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Community Voices & Oral Histories */}
      <section className="space-y-8 pt-8 border-t border-stone-200">
        <div>
          <h2 className="font-serif font-bold text-2xl text-stone-900">
            Community Voices & Storytellers
          </h2>
          <p className="text-stone-600 text-xs mt-1">
            First-person recollections, village histories, and heritage preservation memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {voices.map((voice) => (
            <div key={voice.id} className="bg-stone-900 rounded-3xl p-6 text-white space-y-4 shadow-xl border border-stone-800 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl terracotta-gradient flex items-center justify-center font-bold">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-white">
                      {voice.speakerName}
                    </h3>
                    <p className="text-[11px] text-amber-300">
                      {voice.role} • {voice.location}
                    </p>
                  </div>
                </div>

                <h4 className="font-serif font-semibold text-base text-amber-100">
                  "{voice.title}"
                </h4>

                <p className="text-stone-300 text-xs leading-relaxed font-sans">
                  {voice.story}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => toggleVoiceAudio(voice.id, voice.audioTranscript)}
                  className="px-4 py-2 bg-white text-stone-950 font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-amber-300 transition-colors shadow-md"
                >
                  {playingVoiceId === voice.id ? <VolumeX className="w-4 h-4 text-terracotta-600" /> : <Volume2 className="w-4 h-4 text-azulejo-700" />}
                  <span>{playingVoiceId === voice.id ? 'Pause Voice' : 'Listen to Voice'}</span>
                </button>

                <span className="text-[10px] text-stone-500 font-mono">{voice.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
