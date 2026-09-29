import type { HeritageSite, SmartTrail, LivingCraft, CommunityVoice, Taluka, HeritageCategory } from '../types';
import heritageData from '../data/heritage.json';
import trailsData from '../data/trails.json';
import craftsData from '../data/crafts.json';
import voicesData from '../data/voices.json';

// Haversine formula to compute distance between two lat/lng coordinates in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface FilterOptions {
  category?: string;
  taluka?: string;
  district?: string;
  era?: string;
  hiddenGemOnly?: boolean;
  freeEntryOnly?: boolean;
  savedOnly?: boolean;
  savedIds?: string[];
}

export const heritageService = {
  getAllHeritageSites(): HeritageSite[] {
    return heritageData as HeritageSite[];
  },

  getHeritageSiteById(id: string): HeritageSite | undefined {
    return (heritageData as HeritageSite[]).find((s) => s.id === id);
  },

  getHeritageSitesByCategory(category: HeritageCategory): HeritageSite[] {
    return (heritageData as HeritageSite[]).filter((s) => s.category === category);
  },

  getHeritageSitesByTaluka(taluka: Taluka): HeritageSite[] {
    return (heritageData as HeritageSite[]).filter((s) => s.location.taluka === taluka);
  },

  searchHeritageSites(query: string, filters: FilterOptions = {}): HeritageSite[] {
    let sites = heritageData as HeritageSite[];

    // Keyword Search
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      sites = sites.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.altTitle && s.altTitle.toLowerCase().includes(q)) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.architecturalStyle.toLowerCase().includes(q) ||
          s.location.address.toLowerCase().includes(q) ||
          s.location.taluka.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category Filter
    if (filters.category && filters.category !== 'All') {
      sites = sites.filter((s) => s.category === filters.category);
    }

    // Taluka Filter
    if (filters.taluka && filters.taluka !== 'All') {
      sites = sites.filter((s) => s.location.taluka === filters.taluka);
    }

    // District Filter
    if (filters.district && filters.district !== 'All') {
      sites = sites.filter((s) => s.district === filters.district);
    }

    // Hidden Gem Filter
    if (filters.hiddenGemOnly) {
      sites = sites.filter((s) => s.hiddenGem);
    }

    // Free Entry Filter
    if (filters.freeEntryOnly) {
      sites = sites.filter(
        (s) =>
          s.visitorInfo.entryFee.toLowerCase().includes('free') ||
          s.visitorInfo.entryFee.toLowerCase().includes('donation')
      );
    }

    // Saved Items Filter
    if (filters.savedOnly && filters.savedIds) {
      sites = sites.filter((s) => filters.savedIds?.includes(s.id));
    }

    return sites;
  },

  getRandomHeritageSite(excludeId?: string): HeritageSite {
    const all = heritageData as HeritageSite[];
    const candidates = excludeId ? all.filter((s) => s.id !== excludeId) : all;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex] || all[0];
  },

  getNearbyHeritageSites(
    latitude: number,
    longitude: number,
    limit: number = 5,
    excludeId?: string
  ): { site: HeritageSite; distanceKm: number }[] {
    const all = heritageData as HeritageSite[];
    const candidates = excludeId ? all.filter((s) => s.id !== excludeId) : all;

    const withDistances = candidates.map((site) => ({
      site,
      distanceKm: calculateDistanceKm(
        latitude,
        longitude,
        site.location.latitude,
        site.location.longitude
      ),
    }));

    withDistances.sort((a, b) => a.distanceKm - b.distanceKm);
    return withDistances.slice(0, limit);
  },

  getAllSmartTrails(): SmartTrail[] {
    return trailsData as SmartTrail[];
  },

  getSmartTrailById(id: string): SmartTrail | undefined {
    return (trailsData as SmartTrail[]).find((t) => t.id === id);
  },

  getAllLivingCrafts(): LivingCraft[] {
    return craftsData as LivingCraft[];
  },

  getAllCommunityVoices(): CommunityVoice[] {
    return voicesData as CommunityVoice[];
  },
};
