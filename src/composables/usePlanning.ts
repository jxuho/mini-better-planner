import { computed, ref, watch } from 'vue';
import type { Driver, LoadingZone, PlanningMetrics, Stop } from '@/types/planning';
import { generateMockStops } from '@/composables/useMockStops';
import { BERLIN_DEPOT, distanceKm } from '@/utils/geo';
import { assignStopsByBearing, buildTours } from '@/utils/planningHeuristics';

const STORAGE_KEY = 'mini-better-planner-state-v1';
const DRIVER_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be123c', '#4f46e5'];
const LOADING_ZONES = [
  { id: 'zone-a', name: 'Zone A', color: '#0f766e' },
  { id: 'zone-b', name: 'Zone B', color: '#2563eb' },
  { id: 'zone-c', name: 'Zone C', color: '#9333ea' },
];

interface PersistedPlannerState {
  driverCount: number;
  seed: number;
  stops: Stop[];
  selectedDriverId: string | null;
  selectedStopId: string | null;
}

function readPersistedState(): PersistedPlannerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PersistedPlannerState) : null;
  } catch {
    return null;
  }
}

function createDrivers(count: number): Driver[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `driver-${index + 1}`,
    name: `Driver ${index + 1}`,
    color: DRIVER_COLORS[index % DRIVER_COLORS.length],
    loadingZoneId: LOADING_ZONES[index % LOADING_ZONES.length].id,
  }));
}

export function usePlanning() {
  const persisted = readPersistedState();
  const seed = ref(persisted?.seed ?? 20260624);
  const driverCount = ref(persisted?.driverCount ?? 5);
  const stops = ref<Stop[]>(persisted?.stops ?? generateMockStops(78, seed.value));
  const selectedDriverId = ref<string | null>(persisted?.selectedDriverId ?? null);
  const selectedStopId = ref<string | null>(persisted?.selectedStopId ?? null);

  const drivers = computed(() => createDrivers(driverCount.value));
  const tours = computed(() => buildTours(stops.value, drivers.value, BERLIN_DEPOT));
  const selectedStop = computed(() => stops.value.find((stop) => stop.id === selectedStopId.value) ?? null);
  const selectedTour = computed(() => tours.value.find((tour) => tour.driver.id === selectedDriverId.value) ?? null);
  const unassignedStops = computed(() => stops.value.filter((stop) => !stop.assignedDriverId));

  const metrics = computed<PlanningMetrics>(() => {
    const totalStops = stops.value.length;
    const assignedStops = totalStops - unassignedStops.value.length;
    const totalParcels = stops.value.reduce((sum, stop) => sum + stop.parcelCount, 0);
    const estimatedTotalDistanceKm = tours.value.reduce((sum, tour) => sum + tour.distanceKm, 0);
    const averageStopsPerDriver = driverCount.value === 0 ? 0 : assignedStops / driverCount.value;
    const stopCounts = tours.value.map((tour) => tour.stops.length);
    const maxStops = stopCounts.length > 0 ? Math.max(...stopCounts) : 0;
    const minStops = stopCounts.length > 0 ? Math.min(...stopCounts) : 0;
    const loadBalanceScore = assignedStops === 0 ? 0 : Math.max(0, Math.round(100 - (maxStops - minStops) * 8));
    const compactnessScore =
      tours.value.length === 0
        ? 0
        : Math.round(tours.value.reduce((sum, tour) => sum + tour.compactnessScore, 0) / tours.value.length);
    const warnings = buildPlanningWarnings();

    return {
      totalStops,
      assignedStops,
      driverCount: driverCount.value,
      totalParcels,
      averageStopsPerDriver,
      estimatedTotalDistanceKm,
      loadBalanceScore,
      compactnessScore,
      warnings,
    };
  });

  const loadingZones = computed<LoadingZone[]>(() =>
    LOADING_ZONES.map((zone) => {
      const zoneDrivers = drivers.value.filter((driver) => driver.loadingZoneId === zone.id);
      const parcelCount = zoneDrivers.reduce((sum, driver) => {
        const tour = tours.value.find((candidate) => candidate.driver.id === driver.id);
        return sum + (tour?.parcelCount ?? 0);
      }, 0);
      const capacityParcels = 150;

      return {
        ...zone,
        driverIds: zoneDrivers.map((driver) => driver.id),
        parcelCount,
        capacityParcels,
        warnings: parcelCount > capacityParcels ? ['Zone parcel staging overloaded'] : [],
      };
    }),
  );

  const selectedStopInspection = computed(() => {
    if (!selectedStop.value) {
      return null;
    }

    const assignedDriverName =
      drivers.value.find((driver) => driver.id === selectedStop.value?.assignedDriverId)?.name ?? 'Unassigned';

    return {
      stop: selectedStop.value,
      distanceFromDepotKm: distanceKm(BERLIN_DEPOT.coordinates, selectedStop.value.coordinates),
      assignedDriverName,
    };
  });

  function autoAssignStops() {
    stops.value = assignStopsByBearing(stops.value, drivers.value, BERLIN_DEPOT);
    selectedDriverId.value = drivers.value[0]?.id ?? null;
  }

  function resetPlan() {
    stops.value = stops.value.map((stop) => ({ ...stop, assignedDriverId: null }));
    selectedDriverId.value = null;
    selectedStopId.value = null;
  }

  function regenerateStops() {
    seed.value += 101;
    stops.value = generateMockStops(78, seed.value);
    selectedDriverId.value = null;
    selectedStopId.value = null;
  }

  function reassignStop(stopId: string, driverId: string | null) {
    stops.value = stops.value.map((stop) => (stop.id === stopId ? { ...stop, assignedDriverId: driverId } : stop));

    if (driverId) {
      selectedDriverId.value = driverId;
    }
  }

  function selectDriver(driverId: string | null) {
    selectedDriverId.value = driverId;
  }

  function selectStop(stopId: string | null) {
    selectedStopId.value = stopId;
    const stop = stops.value.find((candidate) => candidate.id === stopId);

    if (stop?.assignedDriverId) {
      selectedDriverId.value = stop.assignedDriverId;
    }
  }

  function setDriverCount(count: number) {
    driverCount.value = count;
    const validDriverIds = new Set(createDrivers(count).map((driver) => driver.id));
    stops.value = stops.value.map((stop) =>
      stop.assignedDriverId && !validDriverIds.has(stop.assignedDriverId) ? { ...stop, assignedDriverId: null } : stop,
    );

    if (selectedDriverId.value && !validDriverIds.has(selectedDriverId.value)) {
      selectedDriverId.value = null;
    }
  }

  function buildPlanningWarnings(): string[] {
    const warnings = tours.value.flatMap((tour) => tour.warnings.map((warning) => `${tour.driver.name}: ${warning}`));

    if (unassignedStops.value.length > 0) {
      warnings.unshift(`${unassignedStops.value.length} stops are not assigned yet`);
    }

    const averageMinutes =
      tours.value.length === 0
        ? 0
        : tours.value.reduce((sum, tour) => sum + tour.workingMinutes, 0) / tours.value.length;
    const outlier = tours.value.find((tour) => averageMinutes > 0 && tour.workingMinutes > averageMinutes * 1.25);

    if (outlier) {
      warnings.push(`${outlier.driver.name} is much longer than the average tour`);
    }

    return warnings;
  }

  watch(
    [driverCount, stops, selectedDriverId, selectedStopId, seed],
    () => {
      const payload: PersistedPlannerState = {
        driverCount: driverCount.value,
        seed: seed.value,
        stops: stops.value,
        selectedDriverId: selectedDriverId.value,
        selectedStopId: selectedStopId.value,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    },
    { deep: true },
  );

  return {
    depot: BERLIN_DEPOT,
    driverCount,
    drivers,
    loadingZones,
    metrics,
    selectedDriverId,
    selectedStopId,
    selectedStopInspection,
    selectedTour,
    stops,
    tours,
    unassignedStops,
    autoAssignStops,
    regenerateStops,
    reassignStop,
    resetPlan,
    selectDriver,
    selectStop,
    setDriverCount,
  };
}
