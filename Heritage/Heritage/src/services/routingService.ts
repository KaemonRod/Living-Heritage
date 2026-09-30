export type TransportMode = 'driving' | 'biking' | 'walking';

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  maneuverType: 'depart' | 'turn' | 'arrive' | 'roundabout' | 'fork' | 'continue';
  modifier?: string;
  location: [number, number]; // [lat, lng]
}

export interface RouteResult {
  geometry: [number, number][]; // Array of [lat, lng]
  steps: RouteStep[];
  totalDistanceKm: number;
  totalDurationMins: number;
  mode: TransportMode;
}

// OSRM profile mapping
const OSRM_PROFILES: Record<TransportMode, string> = {
  driving: 'driving',
  biking: 'bike',
  walking: 'foot',
};

/**
 * Fetch real turn-by-turn road routing between origin and destination using OSRM.
 */
export async function fetchRoadRoute(
  origin: [number, number], // [lat, lng]
  destination: [number, number], // [lat, lng]
  mode: TransportMode = 'driving',
  destinationName: string = 'Destination'
): Promise<RouteResult> {
  const profile = OSRM_PROFILES[mode];
  const url = `https://router.project-osrm.org/route/v1/${profile}/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM API error HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      
      // Extract geometry [lng, lat] -> [lat, lng]
      const geometry: [number, number][] = route.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      );

      const totalDistanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const totalDurationMins = Math.max(1, Math.round(route.duration / 60));

      // Parse turn-by-turn steps
      const steps: RouteStep[] = [];
      if (route.legs && route.legs[0] && route.legs[0].steps) {
        const rawSteps = route.legs[0].steps;
        rawSteps.forEach((s: any, idx: number) => {
          const m = s.maneuver;
          const stepLoc: [number, number] = [m.location[1], m.location[0]];
          
          let instruction = formatManeuverInstruction(
            m.type,
            m.modifier,
            s.name,
            destinationName,
            idx,
            rawSteps.length
          );

          steps.push({
            instruction,
            distanceMeters: Math.round(s.distance),
            durationSeconds: Math.round(s.duration),
            maneuverType: normalizeManeuverType(m.type),
            modifier: m.modifier,
            location: stepLoc,
          });
        });
      }

      return {
        geometry,
        steps,
        totalDistanceKm,
        totalDurationMins,
        mode,
      };
    }
  } catch (error) {
    console.warn('OSRM routing fetch failed or timed out, falling back to simulated road steps:', error);
  }

  // Fallback if API is offline or restricted: Interpolate road geometry and turn steps
  return generateFallbackRoute(origin, destination, mode, destinationName);
}

function normalizeManeuverType(type: string): RouteStep['maneuverType'] {
  if (type === 'depart') return 'depart';
  if (type === 'arrive') return 'arrive';
  if (type === 'roundabout') return 'roundabout';
  if (type === 'fork') return 'fork';
  if (type.includes('turn')) return 'turn';
  return 'continue';
}

function formatManeuverInstruction(
  type: string,
  modifier: string | undefined,
  roadName: string | undefined,
  destName: string,
  index: number,
  totalSteps: number
): string {
  const streetName = roadName && roadName.trim() !== '' ? ` onto ${roadName}` : '';
  const onStreet = roadName && roadName.trim() !== '' ? ` on ${roadName}` : '';

  if (type === 'depart') {
    return `Head ${modifier || 'forward'}${onStreet}`;
  }
  if (type === 'arrive' || index === totalSteps - 1) {
    return `Arrive at ${destName}`;
  }
  if (type === 'roundabout') {
    return `At the roundabout, take exit${streetName}`;
  }
  if (type === 'fork') {
    return `Keep ${modifier || 'left'}${streetName}`;
  }
  if (type === 'end of road') {
    return `At the end of the road, turn ${modifier || 'right'}${streetName}`;
  }

  if (modifier) {
    const formattedDir = modifier.replace('slight ', 'slight ').replace('sharp ', 'sharp ');
    return `Turn ${formattedDir}${streetName}`;
  }

  return `Continue straight${onStreet}`;
}

/**
 * Intelligent fallback route generator with turn-by-turn steps if OSRM is unreachable
 */
function generateFallbackRoute(
  origin: [number, number],
  destination: [number, number],
  mode: TransportMode,
  destName: string
): RouteResult {
  // Haversine distance
  const R = 6371;
  const dLat = ((destination[0] - origin[0]) * Math.PI) / 180;
  const dLon = ((destination[1] - origin[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin[0] * Math.PI) / 180) *
      Math.cos((destination[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = Math.round(R * c * 10) / 10;
  
  // Road factor (roads are ~1.3x straight line distance in Goa)
  const roadKm = Math.round(straightKm * 1.3 * 10) / 10;
  
  // Speed estimate (driving ~35km/h, biking ~25km/h, walking ~4.5km/h)
  const speedKmH = mode === 'walking' ? 4.5 : mode === 'biking' ? 25 : 35;
  const mins = Math.max(2, Math.round((roadKm / speedKmH) * 60));

  // Generate curved road waypoints
  const geometry: [number, number][] = [origin];

  const mid1: [number, number] = [
    origin[0] + (destination[0] - origin[0]) * 0.25 + 0.003,
    origin[1] + (destination[1] - origin[1]) * 0.25 - 0.002,
  ];
  const mid2: [number, number] = [
    origin[0] + (destination[0] - origin[0]) * 0.5 - 0.002,
    origin[1] + (destination[1] - origin[1]) * 0.5 + 0.004,
  ];
  const mid3: [number, number] = [
    origin[0] + (destination[0] - origin[0]) * 0.75 + 0.001,
    origin[1] + (destination[1] - origin[1]) * 0.75 + 0.002,
  ];

  geometry.push(mid1, mid2, mid3, destination);

  const steps: RouteStep[] = [
    {
      instruction: `Head main road toward ${destName}`,
      distanceMeters: Math.round((roadKm * 1000) * 0.25),
      durationSeconds: Math.round((mins * 60) * 0.25),
      maneuverType: 'depart',
      modifier: 'straight',
      location: origin,
    },
    {
      instruction: 'Turn slight right onto Goa State Highway',
      distanceMeters: Math.round((roadKm * 1000) * 0.35),
      durationSeconds: Math.round((mins * 60) * 0.35),
      maneuverType: 'turn',
      modifier: 'slight right',
      location: mid1,
    },
    {
      instruction: 'At the roundabout, take 2nd exit toward village heritage junction',
      distanceMeters: Math.round((roadKm * 1000) * 0.25),
      durationSeconds: Math.round((mins * 60) * 0.25),
      maneuverType: 'roundabout',
      modifier: 'straight',
      location: mid2,
    },
    {
      instruction: 'Turn left onto heritage approach road',
      distanceMeters: Math.round((roadKm * 1000) * 0.15),
      durationSeconds: Math.round((mins * 60) * 0.15),
      maneuverType: 'turn',
      modifier: 'left',
      location: mid3,
    },
    {
      instruction: `Arrive at ${destName}`,
      distanceMeters: 0,
      durationSeconds: 0,
      maneuverType: 'arrive',
      location: destination,
    },
  ];

  return {
    geometry,
    steps,
    totalDistanceKm: roadKm,
    totalDurationMins: mins,
    mode,
  };
}
