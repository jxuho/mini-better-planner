import { bearing, destination, distance, point } from '@turf/turf';
import type { Coordinates } from '@/types/planning';

export const BERLIN_DEPOT = {
  id: 'depot-westhafen',
  name: 'Berlin Westhafen Depot',
  address: 'Westhafenstrasse, 13353 Berlin',
  coordinates: [13.3359, 52.5362] as Coordinates,
};

export function distanceKm(from: Coordinates, to: Coordinates): number {
  return distance(point(from), point(to), { units: 'kilometers' });
}

export function bearingDegrees(from: Coordinates, to: Coordinates): number {
  const rawBearing = bearing(point(from), point(to));
  return rawBearing < 0 ? rawBearing + 360 : rawBearing;
}

export function destinationPoint(from: Coordinates, kilometers: number, bearingValue: number): Coordinates {
  const result = destination(point(from), kilometers, bearingValue, { units: 'kilometers' });
  const [lng, lat] = result.geometry.coordinates;
  return [lng, lat];
}

export function routeDistanceKm(points: Coordinates[]): number {
  return points.reduce((total, current, index) => {
    if (index === 0) {
      return total;
    }

    return total + distanceKm(points[index - 1], current);
  }, 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatKm(value: number): string {
  return `${value.toFixed(value >= 10 ? 0 : 1)} km`;
}

export function formatMinutes(minutes: number): string {
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remaining = rounded % 60;

  if (hours === 0) {
    return `${remaining} min`;
  }

  return `${hours}h ${remaining.toString().padStart(2, '0')}m`;
}
