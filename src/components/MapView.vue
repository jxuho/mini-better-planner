<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import mapboxgl, { type GeoJSONSource, type Map, type MapLayerMouseEvent } from 'mapbox-gl';
import type { Depot, Stop, Tour } from '@/types/planning';
import { buildRouteFeatureCollection, buildStopFeatureCollection } from '@/composables/useMapLayers';

const props = defineProps<{
  depot: Depot;
  selectedDriverId: string | null;
  selectedStopId: string | null;
  stops: Stop[];
  tours: Tour[];
}>();

const emit = defineEmits<{
  selectDriver: [driverId: string | null];
  selectStop: [stopId: string | null];
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
const isReady = ref(false);
const mapError = ref<string | null>(null);
const routeFeatures = computed(() => buildRouteFeatureCollection(props.tours, props.depot, props.selectedDriverId));
const stopFeatures = computed(() => buildStopFeatureCollection(props.stops, props.tours, props.selectedStopId));
let map: Map | null = null;
let depotMarker: mapboxgl.Marker | null = null;
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

onMounted(() => {
  if (!mapContainer.value) {
    return;
  }

  if (!mapboxToken) {
    mapError.value = 'Mapbox light-v11 requires VITE_MAPBOX_TOKEN.';
    return;
  }

  mapboxgl.accessToken = mapboxToken;
  map = new mapboxgl.Map({
    container: mapContainer.value,
    center: props.depot.coordinates,
    zoom: 10.8,
    minZoom: 9,
    maxZoom: 15,
    style: 'mapbox://styles/mapbox/light-v11',
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');

  map.on('error', (event) => {
    if (event.error) {
      mapError.value = event.error.message;
    }
  });

  map.on('load', () => {
    addPlanningLayers();
    addDepotMarker();
    isReady.value = true;
  });
});

onBeforeUnmount(() => {
  depotMarker?.remove();
  map?.remove();
});

watch([routeFeatures, stopFeatures], () => {
  if (!map || !isReady.value) {
    return;
  }

  updateGeoJsonSource('routes-source', routeFeatures.value);
  updateGeoJsonSource('stops-source', stopFeatures.value);
});

watch(
  () => props.selectedDriverId,
  () => {
    if (!map || !isReady.value) {
      return;
    }

    updateGeoJsonSource('routes-source', routeFeatures.value);
  },
);

watch(
  () => props.selectedStopId,
  () => {
    if (!map || !isReady.value) {
      return;
    }

    updateGeoJsonSource('stops-source', stopFeatures.value);
  },
);

function addPlanningLayers() {
  if (!map) {
    return;
  }

  map.addSource('routes-source', {
    type: 'geojson',
    data: routeFeatures.value,
  });
  map.addSource('stops-source', {
    type: 'geojson',
    data: stopFeatures.value,
  });

  map.addLayer({
    id: 'route-casing',
    type: 'line',
    source: 'routes-source',
    paint: {
      'line-color': '#0f172a',
      'line-opacity': ['case', ['boolean', ['get', 'selected'], false], 0.22, 0.08],
      'line-width': ['case', ['boolean', ['get', 'selected'], false], 8, 5],
    },
  });

  map.addLayer({
    id: 'route-lines',
    type: 'line',
    source: 'routes-source',
    paint: {
      'line-color': ['get', 'color'],
      'line-opacity': ['case', ['boolean', ['get', 'selected'], false], 0.95, 0.44],
      'line-width': ['case', ['boolean', ['get', 'selected'], false], 4.5, 2.3],
    },
  });

  map.addLayer({
    id: 'priority-halos',
    type: 'circle',
    source: 'stops-source',
    filter: ['==', ['get', 'priority'], 'high'],
    paint: {
      'circle-color': '#f59e0b',
      'circle-opacity': 0.28,
      'circle-radius': ['case', ['boolean', ['get', 'selected'], false], 14, 10],
    },
  });

  map.addLayer({
    id: 'stop-points',
    type: 'circle',
    source: 'stops-source',
    paint: {
      'circle-color': ['get', 'driverColor'],
      'circle-radius': ['case', ['boolean', ['get', 'selected'], false], 9, ['==', ['get', 'priority'], 'high'], 6.5, 5.5],
      'circle-stroke-color': [
        'case',
        ['boolean', ['get', 'selected'], false],
        '#0f172a',
        ['==', ['get', 'priority'], 'high'],
        '#f59e0b',
        '#ffffff',
      ],
      'circle-stroke-width': ['case', ['boolean', ['get', 'selected'], false], 3, 1.5],
      'circle-opacity': ['case', ['==', ['get', 'driverId'], 'unassigned'], 0.65, 0.95],
    },
  });

  map.on('click', 'stop-points', handleStopClick);
  map.on('click', 'route-lines', handleRouteClick);
  map.on('mouseenter', 'stop-points', setPointer);
  map.on('mouseleave', 'stop-points', clearPointer);
  map.on('mouseenter', 'route-lines', setPointer);
  map.on('mouseleave', 'route-lines', clearPointer);
}

function addDepotMarker() {
  if (!map) {
    return;
  }

  const element = document.createElement('div');
  element.className = 'depot-marker';
  element.title = props.depot.name;
  depotMarker = new mapboxgl.Marker({ element }).setLngLat(props.depot.coordinates).addTo(map);
}

function updateGeoJsonSource(sourceId: string, data: Parameters<GeoJSONSource['setData']>[0]) {
  const source = map?.getSource(sourceId) as GeoJSONSource | undefined;
  source?.setData(data);
}

function handleStopClick(event: MapLayerMouseEvent) {
  const stopId = event.features?.[0]?.properties?.stopId as string | undefined;

  if (stopId) {
    emit('selectStop', stopId);
  }
}

function handleRouteClick(event: MapLayerMouseEvent) {
  const driverId = event.features?.[0]?.properties?.driverId as string | undefined;

  if (driverId) {
    emit('selectDriver', driverId);
  }
}

function setPointer() {
  if (map) {
    map.getCanvas().style.cursor = 'pointer';
  }
}

function clearPointer() {
  if (map) {
    map.getCanvas().style.cursor = '';
  }
}
</script>

<template>
  <section class="relative h-[calc(100vh-4rem)] flex-1 overflow-hidden bg-slate-200">
    <div ref="mapContainer" class="h-full w-full" />

    <div v-if="mapError" class="absolute inset-0 grid place-items-center bg-slate-100/90">
      <div class="max-w-sm rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-panel">
        <p class="font-semibold text-slate-900">Map style unavailable</p>
        <p class="mt-1 text-slate-600">{{ mapError }}</p>
        <p class="mt-2 text-xs text-slate-500">Set VITE_MAPBOX_TOKEN in a local .env file and restart Vite.</p>
      </div>
    </div>

    <div v-else-if="!isReady" class="absolute inset-0 grid place-items-center bg-slate-100/80">
      <div class="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-panel">
        Loading Berlin map...
      </div>
    </div>

    <div class="absolute left-4 top-4 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-panel backdrop-blur">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Legend</p>
      <div class="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
        <span class="flex items-center gap-2"><i class="h-3 w-3 rounded-full bg-teal-700" />Depot</span>
        <span class="flex items-center gap-2"><i class="h-3 w-3 rounded-full bg-slate-400" />Unassigned</span>
        <span class="flex items-center gap-2"><i class="h-3 w-3 rounded-full bg-blue-600" />Driver stop</span>
        <span class="flex items-center gap-2"><i class="h-3 w-3 rounded-full border-2 border-amber-500 bg-white" />High priority</span>
      </div>
    </div>
  </section>
</template>
