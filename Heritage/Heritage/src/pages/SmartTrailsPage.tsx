import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Route as RouteIcon, CheckCircle2, Navigation, ExternalLink, ArrowRight, Footprints, Compass } from 'lucide-react';
import { heritageService, calculateDistanceKm } from '../services/heritageService';
import { VerifiedHeritageImage } from '../components/VerifiedHeritageImage';
import type { HeritageSite } from '../types';

// Custom Trail Stop Badge Marker (Numbered 1, 2, 3...)
function createNumberedBadgeIcon(index: number) {
  return L.divIcon({
    className: 'custom-trail-badge',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #c85a32, #7a2e1e);
        color: #ffffff;
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-weight: 800;
        font-size: 13px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        transform: translate(-50%, -50%);
      ">
        ${index + 1}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [0, 0],
    popupAnchor: [0, -18],
  });
}

export const SmartTrailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const trails = heritageService.getAllSmartTrails();

  const selectedTrail = id ? heritageService.getSmartTrailById(id) : trails[0];

  if (!selectedTrail) return null;

  const trailSites = selectedTrail.stopIds
    .map((sId) => heritageService.getHeritageSiteById(sId))
    .filter((s): s is HeritageSite => s !== undefined);

  // Center coordinate of trail
  const centerCoord = selectedTrail.coordinates[0] || [15.4989, 73.8315];

  // Google Maps Multi-stop URL
  const googleMapsRouteUrl = (() => {
    if (trailSites.length < 2) return '';
    const origin = `${trailSites[0].location.latitude},${trailSites[0].location.longitude}`;
    const destination = `${trailSites[trailSites.length - 1].location.latitude},${trailSites[trailSites.length - 1].location.longitude}`;
    const waypoints = trailSites
      .slice(1, -1)
      .map((s) => `${s.location.latitude},${s.location.longitude}`)
      .join('|');

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=walking`;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-stone-200 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-azulejo-50 text-azulejo-800 text-xs font-bold">
          <RouteIcon className="w-3.5 h-3.5" />
          <span>Curated Itineraries & GPS Navigation</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-stone-900">
          Smart Heritage Trails
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm">
          Step-by-step guided routes connecting Goan monuments, forts, and cultural quarters with live map directions.
        </p>
      </div>

      {/* Trail Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trails.map((t) => (
          <Link
            key={t.id}
            to={`/trails/${t.id}`}
            className={`p-4 rounded-2xl border transition-all text-left space-y-2 ${
              selectedTrail.id === t.id
                ? 'bg-stone-900 text-white border-stone-900 shadow-xl'
                : 'bg-white border-stone-200 text-stone-800 hover:border-azulejo-300 hover:shadow-md'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
              selectedTrail.id === t.id ? 'bg-terracotta-500 text-white' : 'bg-stone-100 text-stone-600'
            }`}>
              {t.category}
            </span>
            <h3 className="font-serif font-bold text-sm line-clamp-1">
              {t.title}
            </h3>
            <p className={`text-[11px] ${selectedTrail.id === t.id ? 'text-stone-300' : 'text-stone-500'}`}>
              ⏱️ {t.durationMinutes} mins • {t.stopIds.length} Stops • {t.distanceKm} km
            </p>
          </Link>
        ))}
      </div>

      {/* Selected Trail Overview Banner */}
      <div className="bg-stone-900 rounded-3xl p-8 sm:p-10 text-white space-y-6 shadow-2xl border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-azulejo-600 text-white text-xs font-bold">
              {selectedTrail.category} • {selectedTrail.difficulty} Difficulty
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-white">
              {selectedTrail.title}
            </h2>
            <p className="font-serif text-amber-300 text-sm italic">
              {selectedTrail.subtitle}
            </p>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {selectedTrail.description}
            </p>
          </div>

          <div className="bg-stone-950/80 p-5 rounded-2xl border border-white/10 shrink-0 space-y-3 text-xs w-full md:w-64">
            <div className="flex items-center justify-between gap-6">
              <span className="text-stone-400">Total Distance:</span>
              <span className="font-bold text-amber-300">{selectedTrail.distanceKm} km</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-stone-400">Est. Duration:</span>
              <span className="font-bold text-amber-300">{selectedTrail.durationMinutes} mins</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-stone-400">Heritage Stops:</span>
              <span className="font-bold text-amber-300">{trailSites.length} Monuments</span>
            </div>

            <Link
              to={`/map?trail=${selectedTrail.id}`}
              className="w-full py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Launch Live Trail Map</span>
            </Link>

            {googleMapsRouteUrl && (
              <a
                href={googleMapsRouteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <ExternalLink className="w-3 h-3 text-amber-400" />
                <span>Turn-by-Turn in Google Maps</span>
              </a>
            )}
          </div>
        </div>

        {/* Trail Highlights */}
        <div className="pt-4 border-t border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-3">
            Trail Highlights & Experiences
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {selectedTrail.highlights.map((hl, idx) => (
              <div key={idx} className="bg-stone-950/50 p-3 rounded-xl border border-white/5 text-xs text-stone-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{hl}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Trail Interactive Route Map Preview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-azulejo-700 text-xs font-bold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Route Preview</span>
            </div>
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              Trail Path & Stop Sequence
            </h2>
          </div>

          <Link
            to={`/map?trail=${selectedTrail.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta-600 hover:text-terracotta-700"
          >
            <span>Open in Fullscreen Live Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-[45vh] rounded-3xl overflow-hidden border-2 border-stone-200 shadow-lg relative">
          <MapContainer
            center={centerCoord}
            zoom={13}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Glowing route outline */}
            <Polyline
              positions={selectedTrail.coordinates}
              pathOptions={{
                color: '#f6e6dc',
                weight: 8,
                opacity: 0.7,
              }}
            />

            {/* Main Trail Route Polyline */}
            <Polyline
              positions={selectedTrail.coordinates}
              pathOptions={{
                color: '#c85a32',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.95,
              }}
            />

            {/* Numbered Trail Stop Badges */}
            {trailSites.map((site, index) => (
              <Marker
                key={`embed-stop-${site.id}`}
                position={[site.location.latitude, site.location.longitude]}
                icon={createNumberedBadgeIcon(index)}
              >
                <Popup>
                  <div className="p-2 space-y-1 max-w-[200px]">
                    <span className="text-[10px] font-bold text-terracotta-600 uppercase">
                      Stop {index + 1}
                    </span>
                    <h5 className="font-serif font-bold text-xs text-stone-900">
                      {site.title}
                    </h5>
                    <p className="text-[11px] text-stone-500 line-clamp-2">
                      {site.shortDescription}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      {/* Step by Step Stop Sequence */}
      <section className="space-y-6">
        <h2 className="font-serif font-bold text-2xl text-stone-900">
          Trail Itinerary Stops ({trailSites.length} Locations)
        </h2>

        <div className="space-y-8 relative">
          <div className="hidden md:block absolute left-8 top-12 bottom-12 w-0.5 bg-stone-300 z-0" />

          {trailSites.map((site, index) => {
            const nextSite = trailSites[index + 1];
            const legDist = nextSite
              ? calculateDistanceKm(
                  site.location.latitude,
                  site.location.longitude,
                  nextSite.location.latitude,
                  nextSite.location.longitude
                )
              : null;

            return (
              <div key={site.id} className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                
                {/* Step Badge */}
                <div className="w-16 h-16 rounded-full bg-terracotta-500 text-white font-serif font-black text-xl flex items-center justify-center shadow-lg border-4 border-stone-50 shrink-0">
                  {index + 1}
                </div>

                {/* Stop Site Card */}
                <div className="flex-1 w-full bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-azulejo-700 uppercase">
                        Stop {index + 1} • {site.category}
                      </span>
                      <h3 className="font-serif font-bold text-xl text-stone-900">
                        {site.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/map?site=${site.id}`}
                        className="px-3.5 py-2 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl hover:bg-blue-100 flex items-center gap-1"
                      >
                        <Navigation className="w-3 h-3 text-blue-600" />
                        <span>Directions</span>
                      </Link>

                      <Link
                        to={`/site/${site.id}`}
                        className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <VerifiedHeritageImage
                        image={site.images[0]}
                        aspectRatio="aspect-[16/10]"
                        allowZoom={false}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-3 text-xs text-stone-600">
                      <p className="leading-relaxed">{site.shortDescription}</p>
                      <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                        <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md font-medium">
                          📍 {site.location.address}
                        </span>
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-900 rounded-md font-medium">
                          🏛️ {site.architecturalStyle}
                        </span>
                      </div>

                      {/* Distance to next stop */}
                      {legDist !== null && (
                        <div className="p-2.5 rounded-xl bg-azulejo-50 text-azulejo-900 text-xs font-semibold flex items-center gap-2 border border-azulejo-200">
                          <Footprints className="w-4 h-4 text-azulejo-600 shrink-0" />
                          <span>
                            Next Leg: Walk ~{legDist} km (~{Math.round((legDist / 4.5) * 60)} mins) to Stop {index + 2}: {nextSite.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

export default SmartTrailsPage;
