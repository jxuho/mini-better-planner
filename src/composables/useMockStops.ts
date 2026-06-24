import type { Stop } from '@/types/planning';
import { BERLIN_DEPOT, destinationPoint } from '@/utils/geo';

const DISTRICT_BEARINGS = [
  18, 42, 66, 88, 113, 137, 165, 194, 219, 244, 271, 296, 323, 346,
];

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateMockStops(count = 78, seed = 20260624): Stop[] {
  const random = seededRandom(seed);

  return Array.from({ length: count }, (_, index) => {
    const bearingBase = DISTRICT_BEARINGS[index % DISTRICT_BEARINGS.length];
    const bearingJitter = (random() - 0.5) * 30;
    const distanceKm = 2.2 + random() * 10.8;
    const coordinates = destinationPoint(BERLIN_DEPOT.coordinates, distanceKm, bearingBase + bearingJitter);
    const parcelCount = 1 + Math.floor(random() * 7) + (random() > 0.86 ? 5 : 0);
    const serviceMinutes = 4 + Math.floor(random() * 9) + (parcelCount > 8 ? 4 : 0);
    const priority = random() > 0.82 ? 'high' : 'normal';

    return {
      id: `ST-${(index + 1).toString().padStart(3, '0')}`,
      coordinates,
      parcelCount,
      serviceMinutes,
      priority,
      assignedDriverId: null,
    };
  });
}
