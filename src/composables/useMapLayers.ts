import type { FeatureCollection, LineString, Point } from 'geojson';
import type { Depot, Stop, Tour } from '@/types/planning';

export interface StopFeatureProperties {
  id: string;
  stopId: string;
  driverId: string;
  driverColor: string;
  parcelCount: number;
  priority: string;
  selected: boolean;
}

export interface RouteFeatureProperties {
  id: string;
  driverId: string;
  driverName: string;
  color: string;
  selected: boolean;
  stopCount: number;
}

export function buildStopFeatureCollection(
  stops: Stop[],
  tours: Tour[],
  selectedStopId: string | null,
): FeatureCollection<Point, StopFeatureProperties> {
  const driverColorById = new Map(tours.map((tour) => [tour.driver.id, tour.driver.color]));

  return {
    type: 'FeatureCollection',
    features: stops.map((stop) => ({
      type: 'Feature',
      properties: {
        id: stop.id,
        stopId: stop.id,
        driverId: stop.assignedDriverId ?? 'unassigned',
        driverColor: stop.assignedDriverId ? (driverColorById.get(stop.assignedDriverId) ?? '#64748b') : '#94a3b8',
        parcelCount: stop.parcelCount,
        priority: stop.priority,
        selected: stop.id === selectedStopId,
      },
      geometry: {
        type: 'Point',
        coordinates: stop.coordinates,
      },
    })),
  };
}

export function buildRouteFeatureCollection(
  tours: Tour[],
  depot: Depot,
  selectedDriverId: string | null,
): FeatureCollection<LineString, RouteFeatureProperties> {
  return {
    type: 'FeatureCollection',
    features: tours
      .filter((tour) => tour.stops.length > 0)
      .map((tour) => ({
        type: 'Feature',
        properties: {
          id: tour.driver.id,
          driverId: tour.driver.id,
          driverName: tour.driver.name,
          color: tour.driver.color,
          selected: tour.driver.id === selectedDriverId,
          stopCount: tour.stops.length,
        },
        geometry: {
          type: 'LineString',
          coordinates: [depot.coordinates, ...tour.stops.map((stop) => stop.coordinates), depot.coordinates],
        },
      })),
  };
}
