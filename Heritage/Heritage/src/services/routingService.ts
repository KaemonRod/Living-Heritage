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
  formattedDuration: string;
  mode: TransportMode;
}

/**
 * Format total travel time in human-friendly format (e.g. "~23 mins" or "~5 hr 9 mins")
 */
export function formatDuration(totalMins: number): string {
  if (totalMins < 60) {
    return `~${totalMins} mins`;
  }
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (mins === 0) {
    return `~${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `~${hours} hr ${mins} min${mins > 1 ? 's' : ''}`;
}

/**
 * Calculate mode-specific travel duration based on real road distance & average Goa speeds
 */
export function calculateDurationForMode(
  distanceKm: number,
  drivingDurationSec: number,
  mode: TransportMode
): number {
  if (mode === 'walking') {
    // Walking average speed in Goa: ~4.5 km/h (75 m/min)
    return Math.max(1, Math.round((distanceKm / 4.5) * 60));
  }
  if (mode === 'biking') {
    // Scooter / Two-wheeler average speed in Goa: ~32 km/h
    return Math.max(1, Math.round((distanceKm / 32) * 60));
  }
  // Car / Driving: Use OSRM driving duration if available, else ~35 km/h average
  if (drivingDurationSec > 0) {
    return Math.max(1, Math.round(drivingDurationSec / 60));
  }
  return Math.max(1, Math.round((distanceKm / 35) * 60));
}

/**
 * Fetch real turn-by-turn road routing between origin and destination using OSRM.
 */
export async function fetchRoadRoute(
  origin: [number, number], // [lat, lng]
  destination: [number, number], // [lat, lng]
  mode: TransportMode = 'driving',
  destinationName: string = 'Destination'
): Promise<RouteResult> {
  // Use OSRM driving endpoint for reliable road geometry and turn steps
  const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=true`;

  let geometry: [number, number][] = [];
  let steps: RouteStep[] = [];
  let totalDistanceKm = 0;
  let osrmDurationSec = 0;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        // Extract geometry [lng, lat] -> [lat, lng]
        geometry = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );

        totalDistanceKm = Math.round((route.distance / 1000) * 10) / 10;
        osrmDurationSec = route.duration;

        // Parse turn-by-turn steps
        if (route.legs && route.legs[0] && route.legs[0].steps) {
          const rawSteps = route.legs[0].steps;
          rawSteps.forEach((s: any, idx: number) => {
            const m = s.maneuver;
            const stepLoc: [number, number] = [m.location[1], m.location[0]];

            const instruction = formatManeuverInstruction(
              m.type,
              m.modifier,
              s.name,
              destinationName,
              idx,
              rawSteps.length
            );

            // Mode-appropriate step duration
            const stepDurationSec = calculateStepDuration(s.duration, s.distance, mode);

            steps.push({
              instruction,
              distanceMeters: Math.round(s.distance),
              durationSeconds: stepDurationSec,
              maneuverType: normalizeManeuverType(m.type),
              modifier: m.modifier,
              location: stepLoc,
            });
          });
        }
      }
    }
  } catch (error) {
    console.warn('OSRM routing fetch failed, falling back to simulated road steps:', error);
  }

  // Fallback if API is offline or restricted: Interpolate road geometry and turn steps
  if (geometry.length === 0) {
    const fallback = generateFallbackRoute(origin, destination, mode, destinationName);
    geometry = fallback.geometry;
    steps = fallback.steps;
    totalDistanceKm = fallback.totalDistanceKm;
    osrmDurationSec = fallback.totalDurationMins * 60;
  }

  const totalDurationMins = calculateDurationForMode(totalDistanceKm, osrmDurationSec, mode);

  return {
    geometry,
    steps,
    totalDistanceKm,
    totalDurationMins,
    formattedDuration: formatDuration(totalDurationMins),
    mode,
  };
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

function calculateStepDuration(stepOsrmSec: number, stepDistanceMeters: number, mode: TransportMode): number {
  if (mode === 'walking') {
    return Math.round(stepDistanceMeters / 1.25); // ~1.25 m/s walking speed
  }
  if (mode === 'biking') {
    return Math.round(stepDistanceMeters / 8.8); // ~8.8 m/s scooter speed
  }
  return Math.round(stepOsrmSec);
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
  const mins = calculateDurationForMode(roadKm, 0, mode);

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
      distanceMeters: Math.round(roadKm * 1000 * 0.25),
      durationSeconds: Math.round(mins * 60 * 0.25),
      maneuverType: 'depart',
      modifier: 'straight',
      location: origin,
    },
    {
      instruction: 'Turn slight right onto Goa State Highway',
      distanceMeters: Math.round(roadKm * 1000 * 0.35),
      durationSeconds: Math.round(mins * 60 * 0.35),
      maneuverType: 'turn',
      modifier: 'slight right',
      location: mid1,
    },
    {
      instruction: 'At the roundabout, take 2nd exit toward village heritage junction',
      distanceMeters: Math.round(roadKm * 1000 * 0.25),
      durationSeconds: Math.round(mins * 60 * 0.25),
      maneuverType: 'roundabout',
      modifier: 'straight',
      location: mid2,
    },
    {
      instruction: 'Turn left onto heritage approach road',
      distanceMeters: Math.round(roadKm * 1000 * 0.15),
      durationSeconds: Math.round(mins * 60 * 0.15),
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
    formattedDuration: formatDuration(mins),
    mode,
  };
}
