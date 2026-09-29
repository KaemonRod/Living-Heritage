import React, { useState, useEffect } from 'react';
import { Navigation, AlertCircle, RefreshCw } from 'lucide-react';
import { heritageService } from '../services/heritageService';
import { HeritageCard } from '../components/HeritageCard';

export const NearMePage: React.FC = () => {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestLocation = () => {
    setLoading(true);
    setErrorMsg(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        () => {
          setErrorMsg('Location permission denied or unavailable. Showing default distance from Panaji center.');
          // Default to Panaji coordinates
          setUserCoords({ lat: 15.4989, lng: 73.8315 });
          setLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setErrorMsg('Geolocation is not supported by your browser. Defaulting to Panaji.');
      setUserCoords({ lat: 15.4989, lng: 73.8315 });
      setLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const nearbyResults = userCoords
    ? heritageService.getNearbyHeritageSites(userCoords.lat, userCoords.lng, 15)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-azulejo-50 text-azulejo-800 text-xs font-bold mb-2">
            <Navigation className="w-3.5 h-3.5" />
            <span>Haversine Proximity Engine</span>
          </div>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-stone-900">
            Heritage Near Me
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Discover monuments, forts, and temples sorted by real-time distance from your location
          </p>
        </div>

        <button
          onClick={requestLocation}
          disabled={loading}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Locating...' : 'Refresh Distance'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Distance Sorted List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {nearbyResults.map(({ site, distanceKm }) => (
          <div key={site.id} className="relative group">
            <HeritageCard site={site} />
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-stone-950/90 text-amber-300 font-serif text-xs font-bold shadow-lg border border-amber-400/40 backdrop-blur-md">
                📍 {distanceKm} km away
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
