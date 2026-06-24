<script setup lang="ts">
import { AlertTriangle, Clock, Route, Truck } from '@lucide/vue';
import type { Tour } from '@/types/planning';
import { formatKm, formatMinutes } from '@/utils/geo';

defineProps<{
  tour: Tour;
  selected: boolean;
}>();

defineEmits<{
  select: [driverId: string];
}>();
</script>

<template>
  <button
    class="w-full rounded-lg border bg-white p-3 text-left shadow-sm transition hover:border-slate-400 hover:shadow"
    :class="selected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'"
    type="button"
    @click="$emit('select', tour.driver.id)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-center gap-2">
        <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: tour.driver.color }" />
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-900">{{ tour.driver.name }}</p>
          <p class="text-xs text-slate-500">{{ tour.driver.loadingZoneId.replace('zone-', 'Zone ').toUpperCase() }}</p>
        </div>
      </div>
      <span
        v-if="tour.warnings.length"
        class="inline-flex shrink-0 items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800"
      >
        <AlertTriangle :size="13" />
        Risk
      </span>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
      <div class="flex items-center gap-1.5">
        <Truck :size="14" />
        <span>{{ tour.stops.length }} stops</span>
      </div>
      <div class="text-right font-semibold text-slate-800">{{ tour.parcelCount }} parcels</div>
      <div class="flex items-center gap-1.5">
        <Route :size="14" />
        <span>{{ formatKm(tour.distanceKm) }}</span>
      </div>
      <div class="flex items-center justify-end gap-1.5">
        <Clock :size="14" />
        <span>{{ formatMinutes(tour.workingMinutes) }}</span>
      </div>
    </div>

    <div class="mt-3">
      <div class="mb-1 flex justify-between text-xs">
        <span class="text-slate-500">Load</span>
        <span class="font-semibold" :class="tour.loadPercent > 100 ? 'text-danger' : 'text-slate-800'">
          {{ tour.loadPercent }}%
        </span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          class="h-full rounded-full"
          :class="tour.loadPercent > 100 ? 'bg-red-600' : tour.loadPercent > 88 ? 'bg-amber-500' : 'bg-teal-600'"
          :style="{ width: `${Math.min(tour.loadPercent, 130)}%` }"
        />
      </div>
    </div>
  </button>
</template>
