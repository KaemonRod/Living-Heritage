import type { HeritageSite } from '../types';
import { heritageService } from './heritageService';

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  recommendedSites?: HeritageSite[];
  timestamp: string;
}

export const aiGuideService = {
  async askGuide(userQuery: string): Promise<AIMessage> {
    const queryLower = userQuery.toLowerCase().trim();
    const allSites = heritageService.getAllHeritageSites();

    // Check optional serverless API URL
    const apiUrl = import.meta.env.VITE_AI_API_URL;

    if (apiUrl) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userQuery }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            id: Date.now().toString(),
            sender: 'assistant',
            text: data.reply || data.text,
            recommendedSites: data.siteIds
              ? allSites.filter((s) => data.siteIds.includes(s.id))
              : [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
      } catch (e) {
        console.warn('API call failed, falling back to rule-based guide engine:', e);
      }
    }

    // Rule-Based Local NLP Engine Fallback
    return this.generateRuleBasedResponse(queryLower, allSites);
  },

  generateRuleBasedResponse(query: string, sites: HeritageSite[]): AIMessage {
    let matchedSites: HeritageSite[] = [];
    let responseText = '';

    // Forts match
    if (query.includes('fort') || query.includes('castle') || query.includes('rampart') || query.includes('battlements')) {
      matchedSites = sites.filter((s) => s.category === 'Fort');
      responseText = `Goa's coastal and hill fortresses protected trade routes across the Arabian Sea for centuries. Here are the iconic military fortifications in our verified dataset:`;
    }
    // Church / Basilica match
    else if (query.includes('church') || query.includes('basilica') || query.includes('cathedral') || query.includes('christian') || query.includes('baroque')) {
      matchedSites = sites.filter((s) => s.category === 'Church');
      responseText = `Goa is renowned for its UNESCO-listed Renaissance and Baroque churches with gilded retables and soaring bell spires:`;
    }
    // Temple / Hindu match
    else if (query.includes('temple') || query.includes('shiva') || query.includes('durga') || query.includes('deepastambha') || query.includes('hindu')) {
      matchedSites = sites.filter((s) => s.category === 'Temple');
      responseText = `Goan Hindu temple architecture features a unique Indo-Portuguese fusion, highlighted by multi-tiered octagonal Deepastambha lamp towers and serene water tanks:`;
    }
    // Old Goa match
    else if (query.includes('old goa') || query.includes('velha goa') || query.includes('unesco')) {
      matchedSites = sites.filter((s) => s.location.taluka === 'Tiswadi' && (s.category === 'Church' || s.category === 'Museum'));
      responseText = `Old Goa (Velha Goa) was once called the 'Rome of the East'. Here are the monumental heritage landmarks within Old Goa:`;
    }
    // Sunset / View match
    else if (query.includes('sunset') || query.includes('view') || query.includes('ocean') || query.includes('sea')) {
      matchedSites = sites.filter((s) => s.tags.includes('Sunset') || s.tags.includes('Sea View') || s.tags.includes('Cliff'));
      responseText = `For breathtaking sunset vistas where heritage meets the ocean winds, we highly recommend these cliffside and coastal fortifications:`;
    }
    // Latin Quarter / Panaji match
    else if (query.includes('fontainhas') || query.includes('panaji') || query.includes('tile') || query.includes('azulejo') || query.includes('street')) {
      matchedSites = sites.filter((s) => s.id === 'fontainhas-latin-quarter' || s.id === 'immaculate-conception-church');
      responseText = `Panaji's historic Latin Quarter (Fontainhas) offers colorful pastel villas, azulejo ceramic plaques, and oystershell windows:`;
    }
    // Hidden Gem match
    else if (query.includes('hidden') || query.includes('secret') || query.includes('quiet') || query.includes('peaceful') || query.includes('offbeat')) {
      matchedSites = sites.filter((s) => s.hiddenGem);
      responseText = `Looking for tranquil off-the-beaten-path heritage gems? Here are peaceful sanctuaries nestled in jungles, hills, and quiet villages:`;
    }
    // Specific site title match
    else {
      const siteMatch = sites.filter((s) =>
        s.title.toLowerCase().includes(query) ||
        (s.altTitle && s.altTitle.toLowerCase().includes(query)) ||
        s.tags.some((t) => t.toLowerCase().includes(query))
      );

      if (siteMatch.length > 0) {
        matchedSites = siteMatch;
        responseText = `Here are the matching heritage locations based on your query:`;
      } else {
        // Fallback curated mix
        matchedSites = [sites[0], sites[2], sites[5], sites[6]];
        responseText = `Dev Boren Karum! I am your Goa Heritage Assistant. While I explore more archives for your specific query, here are four essential Goan heritage locations you should not miss:`;
      }
    }

    return {
      id: Date.now().toString(),
      sender: 'assistant',
      text: responseText,
      recommendedSites: matchedSites.slice(0, 4),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
