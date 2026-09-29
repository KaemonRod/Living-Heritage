import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  Compass,
  ArrowRight,
  Route as RouteIcon,
  MapPin,
  ExternalLink,
  X,
  RotateCcw,
  Footprints,
  Car,
  Layers,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { heritageService, calculateDistanceKm } from '../services/heritageService';
import type { HeritageCategory, HeritageSite, SmartTrail } from '../types';

// Custom SVG Icons generator for Leaflet categories
function createCategoryIcon(category: HeritageCategory, isSelected: boolean = false) {
  let color = '#c85a32'; // terracotta default
  if (category === 'Church') color = '#1a5b8c'; // azulejo blue
  if (category === 'Temple') color = '#b54526'; // dark terracotta
  if (category === 'Fort') color = '#7a2e1e'; // laterite
  if (category === 'Neighborhood') color = '#2d6a4f'; // oasis green
  if (category === 'House') color = '#d97706'; // amber
  if (category === 'Mosque') color = '#059669'; // emerald
  if (category === 'Museum') color = '#8b5cf6'; // purple

  const size = isSelected ? 40 : 32;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}" stroke="#ffffff" stroke-width="${isSelected ? '2.5' : '1.5'}" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svg,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// Custom Trail Stop Badge Marker (Numbered 1, 2, 3...)
function createTrailStopIcon(index: number, isSelected: boolean = false) {
  const bg = isSelected
    ? 'linear-gradient(135deg, #b54526, #7a2e1e)'
    : 'linear-gradient(135deg, #1a5b8c, #123c60)';
  const scale = isSelected ? 'scale(1.15)' : 'scale(1)';

  return L.divIcon({
    className: 'custom-trail-marker',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: ${bg};
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 800;
        font-size: 14px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 6px 14px rgba(0,0,0,0.35);
        transform: translate(-50%, -50%) ${scale};
        transition: transform 0.2s ease;
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [0, 0],
    popupAnchor: [0, -20],
  });
}

// User Location Glowing Marker
const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: #3b82f6; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #60a5fa; opacity: 0.7;"></div>
      <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #1d4ed8; border: 2.5px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [0, 0],
  popupAnchor: [0, -18],
});

// Map View Controller to handle smooth flyTo, bounds fitting, and resize invalidation
function MapViewController({
  flyToTarget,
  fitBoundsTarget,
}: {
  flyToTarget?: { coords: [number, number]; zoom: number; key: number } | null;
  fitBoundsTarget?: { bounds: [number, number][]; key: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  useEffect(() => {
    if (flyToTarget) {
      map.flyTo(flyToTarget.coords, flyToTarget.zoom, { duration: 1.4 });
    }
  }, [flyToTarget, map]);

  useEffect(() => {
    if (fitBoundsTarget && fitBoundsTarget.bounds.length > 0) {
      const latLngBounds = L.latLngBounds(fitBoundsTarget.bounds);
      map.fitBounds(latLngBounds, { padding: [60, 60], maxZoom: 15, duration: 1.2 });
    }
  }, [fitBoundsTarget, map]);

  return null;
}

// Preset starting locations in Goa for instant testing/simulation
const GOA_LOCATION_PRESETS = [
  { name: 'Panaji Church', label: 'Panaji Center', coords: [15.4989, 73.8315] as [number, number] },
  { name: 'Basilica of Bom Jesus', label: 'Old Goa Precinct', coords: [15.5009, 73.9116] as [number, number] },
  { name: 'Fort Aguada', label: 'Candolim Coast', coords: [15.4925, 73.7736] as [number, number] },
  { name: 'Safa Masjid', label: 'Ponda Heritage', coords: [15.4022, 74.0156] as [number, number] },
];

export const LiveMapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSiteId = searchParams.get('site');
  const selectedTrailId = searchParams.get('trail');

  const [activeTab, setActiveTab] = useState<'all' | 'trails'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTrail, setActiveTrail] = useState<SmartTrail | null>(null);
  const [selectedStopIndex, setSelectedStopIndex] = useState<number | null>(null);

  // User location states
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [userLocationSource, setUserLocationSource] = useState<string | null>(null);
  const [accuracyRadius, setAccuracyRadius] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<{
    type: 'success' | 'outside-goa' | 'error' | 'preset';
    message: string;
    details?: string;
  } | null>(null);

  // Directions state (Point-to-point from User Position to site)
  const [activeDirections, setActiveDirections] = useState<{
    site: HeritageSite;
    distanceKm: number;
    walkMinutes: number;
    driveMinutes: number;
  } | null>(null);

  // Viewport animation controllers
  const [flyToTarget, setFlyToTarget] = useState<{ coords: [number, number]; zoom: number; key: number } | null>(null);
  const [fitBoundsTarget, setFitBoundsTarget] = useState<{ bounds: [number, number][]; key: number } | null>(null);

  const allSites = useMemo(() => heritageService.getAllHeritageSites(), []);
  const allTrails = useMemo(() => heritageService.getAllSmartTrails(), []);

  // Handle URL parameters on initial load or change
  useEffect(() => {
    if (selectedTrailId) {
      const trail = heritageService.getSmartTrailById(selectedTrailId);
      if (trail) {
        setActiveTab('trails');
        setActiveTrail(trail);
        setFitBoundsTarget({ bounds: trail.coordinates, key: Date.now() });
      }
    } else if (selectedSiteId) {
      const site = allSites.find((s) => s.id === selectedSiteId);
      if (site) {
        setFlyToTarget({ coords: [site.location.latitude, site.location.longitude], zoom: 14, key: Date.now() });
      }
    }
  }, [selectedTrailId, selectedSiteId, allSites]);

  // Sites to display based on category filter
  const filteredSites = useMemo(() => {
    if (selectedCategory === 'All') return allSites;
    return allSites.filter((s) => s.category === selectedCategory);
  }, [allSites, selectedCategory]);

  // Default Center: Goa Center (Panaji / Old Goa region)
  const defaultCenter: [number, number] = [15.4989, 73.8315];

  // Geolocation Handler
  const handleLocateMe = useCallback(() => {
    setIsLocating(true);
    setLocationNotice(null);

    if (!('geolocation' in navigator)) {
      setIsLocating(false);
      setLocationNotice({
        type: 'error',
        message: 'Geolocation is not supported by your browser.',
        details: 'You can pick a preset Goa starting location below to explore trails and directions.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;

        setUserPos([lat, lng]);
        setUserLocationSource('Real Device GPS');
        setAccuracyRadius(accuracy);
        setIsLocating(false);

        // Fly directly to user position!
        setFlyToTarget({ coords: [lat, lng], zoom: 14, key: Date.now() });

        // Calculate distance from Goa center (Panaji 15.4989, 73.8315)
        const distToGoa = calculateDistanceKm(lat, lng, 15.4989, 73.8315);
        if (distToGoa > 80) {
          setLocationNotice({
            type: 'outside-goa',
            message: `Located via GPS! You are ~${Math.round(distToGoa)} km from Goa.`,
            details: 'Since you are outside Goa, you can switch to a local Goa preset (e.g. Panaji or Old Goa) to test local walking trails and directions.',
          });
        } else {
          setLocationNotice({
            type: 'success',
            message: `GPS Signal Locked! Found your location with ~${Math.round(accuracy)}m accuracy.`,
            details: 'Nearby heritage monuments and walking trails are now calibrated to your real position.',
          });
        }
      },
      (err) => {
        setIsLocating(false);
        const isDenied = err.code === 1;
        setLocationNotice({
          type: 'error',
          message: isDenied
            ? 'Browser location permission was not granted.'
            : 'GPS location request timed out or device sensors are disabled.',
          details: 'No worries! Click any of the Goa quick-starting points below to simulate your position and test directions.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 10000,
      }
    );
  }, []);

  // Set Simulated Location Preset
  const handleSetPresetLocation = (preset: typeof GOA_LOCATION_PRESETS[0]) => {
    setUserPos(preset.coords);
    setUserLocationSource(preset.name);
    setAccuracyRadius(120);
    setFlyToTarget({ coords: preset.coords, zoom: 14, key: Date.now() });
    setLocationNotice({
      type: 'preset',
      message: `Simulating location from ${preset.name} (${preset.label}).`,
      details: 'You can now calculate live walking & driving directions from here to any monument or trail!',
    });

    // If directions are active, recalculate
    if (activeDirections) {
      calculateDirectionsTo(activeDirections.site, preset.coords);
    }
  };

  // Select Trail
  const handleSelectTrail = (trail: SmartTrail) => {
    setActiveTrail(trail);
    setSelectedStopIndex(null);
    setActiveDirections(null);
    setSearchParams({ trail: trail.id });
    setFitBoundsTarget({ bounds: trail.coordinates, key: Date.now() });
  };

  // Clear Trail
  const handleClearTrail = () => {
    setActiveTrail(null);
    setSelectedStopIndex(null);
    setSearchParams({});
    setFlyToTarget({ coords: defaultCenter, zoom: 11, key: Date.now() });
  };

  // Calculate Directions from userPos to a Site
  const calculateDirectionsTo = (site: HeritageSite, customOrigin?: [number, number]) => {
    const origin = customOrigin || userPos;
    if (!origin) {
      // Prompt user to locate first or pick a preset
      handleLocateMe();
      setLocationNotice({
        type: 'preset',
        message: 'Please enable location or pick a starting point to get directions to ' + site.title,
      });
      return;
    }

    const dist = calculateDistanceKm(origin[0], origin[1], site.location.latitude, site.location.longitude);
    const walkMin = Math.round((dist / 4.5) * 60); // approx 4.5 km/h walking speed
    const driveMin = Math.max(2, Math.round((dist / 35) * 60)); // approx 35 km/h driving speed in Goa

    setActiveDirections({
      site,
      distanceKm: dist,
      walkMinutes: walkMin,
      driveMinutes: driveMin,
    });

    // Fit bounds to include both user and site
    setFitBoundsTarget({
      bounds: [origin, [site.location.latitude, site.location.longitude]],
      key: Date.now(),
    });
  };

  // Google Maps Directions Multi-stop URL for Active Trail
  const trailGoogleMapsUrl = useMemo(() => {
    if (!activeTrail) return '';
    const sites = activeTrail.stopIds
      .map((id) => allSites.find((s) => s.id === id))
      .filter((s): s is HeritageSite => s !== undefined);

    if (sites.length < 2) return '';
    const origin = `${sites[0].location.latitude},${sites[0].location.longitude}`;
    const destination = `${sites[sites.length - 1].location.latitude},${sites[sites.length - 1].location.longitude}`;
    const waypoints = sites
      .slice(1, -1)
      .map((s) => `${s.location.latitude},${s.location.longitude}`)
      .join('|');

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`;
  }, [activeTrail, allSites]);

  // Trail Stop Sites for Active Trail
  const activeTrailSites = useMemo(() => {
    if (!activeTrail) return [];
    return activeTrail.stopIds
      .map((id) => allSites.find((s) => s.id === id))
      .filter((s): s is HeritageSite => s !== undefined);
  }, [activeTrail, allSites]);

  const categories = ['All', 'Fort', 'Church', 'Temple', 'Neighborhood', 'House', 'Mosque', 'Museum'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Header & Location Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-azulejo-50 text-azulejo-800 text-xs font-bold mb-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Interactive Goa Heritage & Smart Trails Map</span>
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Goa Heritage Map & GPS Directions
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
            Explore 15 monuments, trace step-by-step smart walking trails, and get real-time directions from your location.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all ${
              isLocating
                ? 'bg-amber-500 text-white animate-pulse'
                : userPos
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-terracotta-500 hover:bg-terracotta-600 text-white'
            }`}
            title="Detect your device GPS location"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating ? 'Detecting GPS...' : userPos ? 'Relocate My Position' : 'Locate My Position'}
            </span>
          </button>

          {userPos && (
            <button
              onClick={() => {
                setUserPos(null);
                setAccuracyRadius(null);
                setActiveDirections(null);
                setLocationNotice(null);
              }}
              className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Reset location pin"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Location Status / Helper Notice Banner */}
      {locationNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in ${
            locationNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : locationNotice.type === 'outside-goa'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {locationNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : locationNotice.type === 'outside-goa' ? (
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{locationNotice.message}</p>
              {locationNotice.details && (
                <p className="text-[11px] opacity-90 mt-0.5">{locationNotice.details}</p>
              )}
            </div>
          </div>

          {/* Quick Goa Teleport Presets */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Goa Presets:
            </span>
            {GOA_LOCATION_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSetPresetLocation(p)}
                className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-azulejo-400 hover:bg-azulejo-50 text-stone-800 text-[11px] font-semibold transition-all shadow-2xs"
              >
                📍 {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main View Mode Selector (Explore Sites vs Smart Trails) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Toggle Mode */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-2xl w-fit">
          <button
            onClick={() => {
              setActiveTab('all');
              handleClearTrail();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'all' && !activeTrail
                ? 'bg-stone-900 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Heritage Sites ({allSites.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('trails');
              if (!activeTrail) handleSelectTrail(allTrails[0]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'trails' || activeTrail
                ? 'bg-terracotta-500 text-white shadow-md'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <RouteIcon className="w-4 h-4" />
            <span>Smart Trails & Routes ({allTrails.length})</span>
          </button>
        </div>

        {/* Trail Picker Pills (When Trails Mode is active) */}
        {(activeTab === 'trails' || activeTrail) ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-stone-500 shrink-0">Select Trail:</span>
            {allTrails.map((trail) => (
              <button
                key={trail.id}
                onClick={() => handleSelectTrail(trail)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  activeTrail?.id === trail.id
                    ? 'bg-terracotta-500 text-white shadow-md'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <span>{trail.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  activeTrail?.id === trail.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                }`}>
                  {trail.stopIds.length} stops
                </span>
              </button>
            ))}
          </div>
        ) : (
          /* Category Filter Pills (When All Sites is active) */
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {cat} ({cat === 'All' ? allSites.length : allSites.filter((s) => s.category === cat).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Trail Banner or Directions Banner */}
      {activeTrail && (
        <div className="bg-stone-900 text-white p-5 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-terracotta-500 text-white font-bold text-[10px] uppercase tracking-wider">
                {activeTrail.category}
              </span>
              <span className="text-stone-400 text-xs">
                ⏱️ {activeTrail.durationMinutes} mins • 📏 {activeTrail.distanceKm} km • {activeTrail.difficulty}
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-white">
              {activeTrail.title}
            </h3>
            <p className="text-stone-300 text-xs line-clamp-1">
              {activeTrail.subtitle} — Follow the numbered pins (1 ➔ {activeTrail.stopIds.length}) on the map.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={trailGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-azulejo-500 hover:bg-azulejo-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Turn-by-Turn in Google Maps</span>
            </a>

            <button
              onClick={handleClearTrail}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Trail</span>
            </button>
          </div>
        </div>
      )}

      {/* Point-to-Point Directions Floating Banner */}
      {activeDirections && (
        <div className="bg-azulejo-900 text-white p-5 rounded-3xl border border-azulejo-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-azulejo-300 text-xs font-bold uppercase tracking-wider">
              <RouteIcon className="w-4 h-4 text-emerald-400" />
              <span>Live Directions from {userLocationSource || 'Your Position'}</span>
            </div>
            <h3 className="font-serif font-bold text-lg text-white">
              Route to {activeDirections.site.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-200 pt-1">
              <span className="flex items-center gap-1 font-bold text-amber-300">
                📏 {activeDirections.distanceKm} km
              </span>
              <span className="flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-blue-300" />
                ~{activeDirections.walkMinutes} min walk
              </span>
              <span className="flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-emerald-300" />
                ~{activeDirections.driveMinutes} min drive
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${userPos ? `${userPos[0]},${userPos[1]}` : ''}&destination=${activeDirections.site.location.latitude},${activeDirections.site.location.longitude}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Start Turn-by-Turn GPS</span>
            </a>

            <button
              onClick={() => setActiveDirections(null)}
              className="p-2 bg-azulejo-800 hover:bg-azulejo-700 text-stone-300 rounded-xl"
              title="Close Directions"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Map Canvas (Spans 3 or 4 columns) */}
        <div className={`relative h-[65vh] sm:h-[72vh] rounded-3xl overflow-hidden border-2 border-stone-200 shadow-xl ${
          activeTrail ? 'lg:col-span-3' : 'lg:col-span-4'
        }`}>
          <MapContainer
            center={defaultCenter}
            zoom={11}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Controller for programmatically flying or fitting bounds */}
            <MapViewController
              flyToTarget={flyToTarget}
              fitBoundsTarget={fitBoundsTarget}
            />

            {/* User Position Beacon & Radius */}
            {userPos && (
              <>
                <Circle
                  center={userPos}
                  radius={Math.min(accuracyRadius || 150, 500)}
                  pathOptions={{
                    color: '#2563eb',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.18,
                    weight: 1.5,
                  }}
                />
                <Marker position={userPos} icon={userLocationIcon}>
                  <Popup>
                    <div className="p-3 text-center space-y-2 max-w-xs">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs">
                          {userLocationSource || 'Your Geolocation'}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          {userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}
                        </p>
                      </div>
                      <p className="text-[10px] text-stone-600">
                        Accuracy: ~{Math.round(accuracyRadius || 50)} meters
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Directions Polyline from User Location to Destination Site */}
            {activeDirections && userPos && (
              <Polyline
                positions={[
                  userPos,
                  [activeDirections.site.location.latitude, activeDirections.site.location.longitude],
                ]}
                pathOptions={{
                  color: '#2563eb',
                  weight: 4,
                  dashArray: '8, 8',
                  opacity: 0.85,
                }}
              />
            )}

            {/* SMART TRAIL: Route Polyline & Sequence Stop Markers */}
            {activeTrail ? (
              <>
                {/* Glowing Outer Polyline for Trail Route */}
                <Polyline
                  positions={activeTrail.coordinates}
                  pathOptions={{
                    color: '#f6e6dc',
                    weight: 10,
                    opacity: 0.7,
                  }}
                />
                {/* Vibrant Inner Route Line */}
                <Polyline
                  positions={activeTrail.coordinates}
                  pathOptions={{
                    color: '#c85a32',
                    weight: 5,
                    dashArray: '10, 8',
                    opacity: 0.95,
                  }}
                />

                {/* Trail Stops with Numbered 1, 2, 3... Badges */}
                {activeTrailSites.map((site, index) => (
                  <Marker
                    key={`trail-stop-${site.id}`}
                    position={[site.location.latitude, site.location.longitude]}
                    icon={createTrailStopIcon(index, selectedStopIndex === index)}
                    eventHandlers={{
                      click: () => setSelectedStopIndex(index),
                    }}
                  >
                    <Popup>
                      <div className="max-w-xs p-1 space-y-2">
                        {site.images[0] && (
                          <img
                            src={site.images[0].url}
                            alt={site.title}
                            className="w-full h-28 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <span className="text-[10px] font-bold text-terracotta-600 uppercase tracking-wide">
                            Stop {index + 1} of {activeTrailSites.length} • {site.category}
                          </span>
                          <h4 className="font-serif font-bold text-stone-900 text-sm">
                            {site.title}
                          </h4>
                          <p className="text-stone-600 text-[11px] line-clamp-2 mt-0.5">
                            {site.shortDescription}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            onClick={() => calculateDirectionsTo(site)}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
                          >
                            <Navigation className="w-3 h-3" />
                            <span>Directions</span>
                          </button>
                          <Link
                            to={`/site/${site.id}`}
                            className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </>
            ) : (
              /* EXPLORE ALL SITES: Category Markers */
              filteredSites.map((site) => (
                <Marker
                  key={site.id}
                  position={[site.location.latitude, site.location.longitude]}
                  icon={createCategoryIcon(site.category, site.id === selectedSiteId)}
                >
                  <Popup>
                    <div className="max-w-xs p-1 space-y-2">
                      {site.images[0] && (
                        <img
                          src={site.images[0].url}
                          alt={site.title}
                          className="w-full h-28 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <span className="text-[10px] font-bold text-azulejo-700 uppercase">
                          {site.category} • {site.location.taluka}
                        </span>
                        <h4 className="font-serif font-bold text-stone-900 text-sm">
                          {site.title}
                        </h4>
                        <p className="text-stone-600 text-[11px] line-clamp-2 mt-0.5">
                          {site.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => calculateDirectionsTo(site)}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Get Directions</span>
                        </button>
                        <Link
                          to={`/site/${site.id}`}
                          className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Site Info</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))
            )}
          </MapContainer>
        </div>

        {/* Trail Itinerary Step-by-Step Panel (When a Trail is Active) */}
        {activeTrail && (
          <div className="lg:col-span-1 bg-white rounded-3xl p-5 border border-stone-200 shadow-md space-y-4 max-h-[72vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-terracotta-600">
                  Trail Sequence
                </span>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  {activeTrailSites.length} Guided Stops
                </h4>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {activeTrail.distanceKm} km
              </span>
            </div>

            <div className="space-y-3 relative">
              {activeTrailSites.map((site, idx) => (
                <div
                  key={site.id}
                  onClick={() => {
                    setSelectedStopIndex(idx);
                    setFlyToTarget({
                      coords: [site.location.latitude, site.location.longitude],
                      zoom: 15,
                      key: Date.now(),
                    });
                  }}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all space-y-2 ${
                    selectedStopIndex === idx
                      ? 'bg-terracotta-50 border-terracotta-400 ring-2 ring-terracotta-200'
                      : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-azulejo-700 uppercase">
                        {site.category}
                      </span>
                      <h5 className="font-serif font-bold text-xs text-stone-900 truncate">
                        {site.title}
                      </h5>
                    </div>
                  </div>

                  {/* Leg distance info */}
                  {idx < activeTrailSites.length - 1 && (
                    <div className="pl-8 text-[10px] text-stone-500 flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-stone-400" />
                      <span>
                        ~{calculateDistanceKm(
                          site.location.latitude,
                          site.location.longitude,
                          activeTrailSites[idx + 1].location.latitude,
                          activeTrailSites[idx + 1].location.longitude
                        )}{' '}
                        km to Stop {idx + 2}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <a
              href={trailGoogleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Route in Google Maps</span>
            </a>
          </div>
        )}

      </div>

      {/* Helpful Instructions Footer */}
      <div className="p-4 rounded-2xl bg-stone-100/80 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Pro Tip:</strong> Click any site pin or trail stop to get instant driving or walking directions and start turn-by-turn navigation in Google Maps.
          </span>
        </div>

        <Link
          to="/trails"
          className="font-bold text-azulejo-700 hover:text-azulejo-900 flex items-center gap-1 shrink-0"
        >
          <span>View Detailed Trail Curations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
};

export default LiveMapPage;
