import type { Coordinates, Depot, Driver, Stop, Tour } from '@/types/planning';
import { bearingDegrees, distanceKm, routeDistanceKm } from '@/utils/geo';

const AVERAGE_CITY_SPEED_KMH = 22;
const DRIVER_TARGET_MINUTES = 8 * 60;
const DRIVER_MAX_STOPS = 22;
const DRIVER_MAX_PARCELS = 115;

interface AssignmentBucket {
  driver: Driver;
  stops: Stop[];
  parcelCount: number;
}

export function sequenceNearestNeighbor(stops: Stop[], depotCoordinates: Coordinates): Stop[] {
  const remaining = [...stops];
  const sequence: Stop[] = [];
  let cursor = depotCoordinates;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidateDistance = distanceKm(cursor, remaining[index].coordinates);

      if (candidateDistance < nearestDistance) {
        nearestIndex = index;
        nearestDistance = candidateDistance;
      }
    }

    const [nextStop] = remaining.splice(nearestIndex, 1);
    sequence.push(nextStop);
    cursor = nextStop.coordinates;
  }

  return sequence;
}

export function assignStopsByBearing(stops: Stop[], drivers: Driver[], depot: Depot): Stop[] {
  if (drivers.length === 0) {
    return stops.map((stop) => ({ ...stop, assignedDriverId: null }));
  }

  const totalParcels = stops.reduce((sum, stop) => sum + stop.parcelCount, 0);
  const targetParcels = Math.ceil(totalParcels / drivers.length);
  const targetStops = Math.ceil(stops.length / drivers.length);
  const buckets: AssignmentBucket[] = drivers.map((driver) => ({
    driver,
    stops: [],
    parcelCount: 0,
  }));

  const sorted = [...stops].sort((left, right) => {
    const leftBearing = bearingDegrees(depot.coordinates, left.coordinates);
    const rightBearing = bearingDegrees(depot.coordinates, right.coordinates);
    return leftBearing - rightBearing;
  });

  let bucketIndex = 0;

  /*
   * This is a deliberately explainable planning heuristic:
   * 1. Sort all stops clockwise around the depot to create geographically compact sectors.
   * 2. Fill each driver's sector until it is near the fair share of stops or parcels.
   * 3. Sequence each sector with a nearest-neighbor pass so route lines look operationally plausible.
   */
  sorted.forEach((stop) => {
    const current = buckets[bucketIndex];
    const wouldExceedStops = current.stops.length >= targetStops;
    const wouldExceedParcels = current.parcelCount + stop.parcelCount > targetParcels * 1.08;
    const canAdvance = bucketIndex < buckets.length - 1;

    if (canAdvance && current.stops.length > 0 && (wouldExceedStops || wouldExceedParcels)) {
      bucketIndex += 1;
    }

    buckets[bucketIndex].stops.push(stop);
    buckets[bucketIndex].parcelCount += stop.parcelCount;
  });

  return buckets.flatMap((bucket) =>
    sequenceNearestNeighbor(bucket.stops, depot.coordinates).map((stop) => ({
      ...stop,
      assignedDriverId: bucket.driver.id,
    })),
  );
}

export function buildTours(stops: Stop[], drivers: Driver[], depot: Depot): Tour[] {
  return drivers.map((driver) => {
    const driverStops = sequenceNearestNeighbor(
      stops.filter((stop) => stop.assignedDriverId === driver.id),
      depot.coordinates,
    );
    const routePoints = [depot.coordinates, ...driverStops.map((stop) => stop.coordinates), depot.coordinates];
    const distance = driverStops.length > 0 ? routeDistanceKm(routePoints) : 0;
    const serviceMinutes = driverStops.reduce((sum, stop) => sum + stop.serviceMinutes, 0);
    const driveMinutes = (distance / AVERAGE_CITY_SPEED_KMH) * 60;
    const parcelCount = driverStops.reduce((sum, stop) => sum + stop.parcelCount, 0);
    const workingMinutes = serviceMinutes + driveMinutes + 30;
    const stopLoad = driverStops.length / DRIVER_MAX_STOPS;
    const parcelLoad = parcelCount / DRIVER_MAX_PARCELS;
    const timeLoad = workingMinutes / DRIVER_TARGET_MINUTES;
    const loadPercent = Math.round(Math.max(stopLoad, parcelLoad, timeLoad) * 100);
    const compactnessScore = scoreCompactness(driverStops, depot.coordinates, distance);
    const warnings = buildTourWarnings(driverStops.length, parcelCount, workingMinutes);

    return {
      driver,
      stops: driverStops,
      parcelCount,
      serviceMinutes,
      distanceKm: distance,
      workingMinutes,
      loadPercent,
      compactnessScore,
      warnings,
    };
  });
}

function buildTourWarnings(stopCount: number, parcelCount: number, workingMinutes: number): string[] {
  const warnings: string[] = [];

  if (stopCount > DRIVER_MAX_STOPS) {
    warnings.push('Too many stops');
  }

  if (parcelCount > DRIVER_MAX_PARCELS) {
    warnings.push('Parcel load high');
  }

  if (workingMinutes > DRIVER_TARGET_MINUTES * 1.12) {
    warnings.push('Long day risk');
  }

  return warnings;
}

function scoreCompactness(stops: Stop[], depotCoordinates: Coordinates, routeDistance: number): number {
  if (stops.length <= 1 || routeDistance === 0) {
    return stops.length === 0 ? 0 : 100;
  }

  const radialDistance = stops.reduce((sum, stop) => sum + distanceKm(depotCoordinates, stop.coordinates), 0);
  const directness = radialDistance / routeDistance;
  return Math.round(Math.max(0, Math.min(100, directness * 120)));
}
