<script setup lang="ts">
import { AlertTriangle, RefreshCw, RotateCcw, SlidersHorizontal, WandSparkles } from '@lucide/vue';
import type { Driver, LoadingZone, PlanningMetrics, StopInspection, Tour } from '@/types/planning';
import DriverCard from '@/components/DriverCard.vue';
import LoadingZones from '@/components/LoadingZones.vue';
import StopDetails from '@/components/StopDetails.vue';
import { formatKm } from '@/utils/geo';

defineProps<{
  driverCount: number;
  drivers: Driver[];
  loadingZones: LoadingZone[];
  metrics: PlanningMetrics;
  selectedDriverId: string | null;
  selectedStopInspection: StopInspection | null;
  tours: Tour[];
}>();

defineEmits<{
  autoAssign: [];
  regenerate: [];
  reassignStop: [stopId: string, driverId: string | null];
  reset: [];
  selectDriver: [driverId: string | null];
  setDriverCount: [count: number];
}>();
</script>

<template>
  <aside class="flex h-[calc(100vh-4rem)] w-[420px] shrink-0 flex-col border-l border-slate-200 bg-white">
    <div class="border-b border-slate-200 p-4">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Morning Plan</h2>
          <p class="text-xs text-slate-500">Transparent sector assignment for Berlin stops</p>
        </div>
        <SlidersHorizontal :size="19" class="text-slate-500" />
      </div>

      <label class="block text-xs font-semibold uppercase tracking-wide text-slate-500" for="driver-count">
        Drivers
      </label>
      <div class="mt-2 flex items-center gap-3">
        <select
          id="driver-count"
          class="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          :value="driverCount"
          @change="$emit('setDriverCount', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="count in [3, 4, 5, 6, 7, 8]" :key="count" :value="count">{{ count }}</option>
        </select>
        <button
          class="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          type="button"
          @click="$emit('autoAssign')"
        >
          <WandSparkles :size="16" />
          Auto assign stops
        </button>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-2">
        <button
          class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          type="button"
          @click="$emit('regenerate')"
        >
          <RefreshCw :size="15" />
          Regenerate
        </button>
        <button
          class="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          type="button"
          @click="$emit('reset')"
        >
          <RotateCcw :size="15" />
          Reset plan
        </button>
      </div>
    </div>

    <div class="flex-1 space-y-5 overflow-y-auto p-4">
      <section>
        <div class="grid grid-cols-2 gap-2">
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs text-slate-500">Total stops</p>
            <p class="text-xl font-semibold text-slate-900">{{ metrics.totalStops }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs text-slate-500">Total parcels</p>
            <p class="text-xl font-semibold text-slate-900">{{ metrics.totalParcels }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs text-slate-500">Avg stops/driver</p>
            <p class="text-xl font-semibold text-slate-900">{{ metrics.averageStopsPerDriver.toFixed(1) }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs text-slate-500">Total distance</p>
            <p class="text-xl font-semibold text-slate-900">{{ formatKm(metrics.estimatedTotalDistanceKm) }}</p>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div class="mb-1 flex justify-between text-xs">
              <span class="text-slate-500">Load balance</span>
              <span class="font-semibold text-slate-900">{{ metrics.loadBalanceScore }}</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-teal-600" :style="{ width: `${metrics.loadBalanceScore}%` }" />
            </div>
          </div>
          <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <div class="mb-1 flex justify-between text-xs">
              <span class="text-slate-500">Compactness</span>
              <span class="font-semibold text-slate-900">{{ metrics.compactnessScore }}</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-blue-600" :style="{ width: `${metrics.compactnessScore}%` }" />
            </div>
          </div>
        </div>
      </section>

      <section v-if="metrics.warnings.length" class="rounded-lg border border-amber-200 bg-amber-50 p-3">
        <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
          <AlertTriangle :size="16" />
          Planning warnings
        </div>
        <ul class="space-y-1 text-xs text-amber-800">
          <li v-for="warning in metrics.warnings.slice(0, 4)" :key="warning">{{ warning }}</li>
        </ul>
      </section>

      <section>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900">Driver Tours</h2>
          <button
            class="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            type="button"
            @click="$emit('selectDriver', null)"
          >
            Clear highlight
          </button>
        </div>
        <div class="space-y-2">
          <DriverCard
            v-for="tour in tours"
            :key="tour.driver.id"
            :selected="tour.driver.id === selectedDriverId"
            :tour="tour"
            @select="$emit('selectDriver', $event)"
          />
        </div>
      </section>

      <StopDetails
        :drivers="drivers"
        :inspection="selectedStopInspection"
        @reassign="(stopId, driverId) => $emit('reassignStop', stopId, driverId)"
      />

      <LoadingZones :zones="loadingZones" />
    </div>
  </aside>
</template>
