export type Coordinates = [number, number];

export type StopPriority = 'normal' | 'high';

export interface Depot {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
}

export interface Stop {
  id: string;
  coordinates: Coordinates;
  parcelCount: number;
  serviceMinutes: number;
  priority: StopPriority;
  assignedDriverId: string | null;
}

export interface Driver {
  id: string;
  name: string;
  color: string;
  loadingZoneId: string;
}

export interface Tour {
  driver: Driver;
  stops: Stop[];
  parcelCount: number;
  serviceMinutes: number;
  distanceKm: number;
  workingMinutes: number;
  loadPercent: number;
  compactnessScore: number;
  warnings: string[];
}

export interface LoadingZone {
  id: string;
  name: string;
  color: string;
  driverIds: string[];
  parcelCount: number;
  capacityParcels: number;
  warnings: string[];
}

export interface PlanningMetrics {
  totalStops: number;
  assignedStops: number;
  driverCount: number;
  totalParcels: number;
  averageStopsPerDriver: number;
  estimatedTotalDistanceKm: number;
  loadBalanceScore: number;
  compactnessScore: number;
  warnings: string[];
}

export interface StopInspection {
  stop: Stop;
  distanceFromDepotKm: number;
  assignedDriverName: string;
}
