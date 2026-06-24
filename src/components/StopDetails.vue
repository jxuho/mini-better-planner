<script setup lang="ts">
import { MapPin, Package, Timer } from '@lucide/vue';
import type { Driver, StopInspection } from '@/types/planning';
import { formatKm } from '@/utils/geo';

defineProps<{
  inspection: StopInspection | null;
  drivers: Driver[];
}>();

defineEmits<{
  reassign: [stopId: string, driverId: string | null];
}>();
</script>

<template>
  <section class="border-t border-slate-200 pt-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-900">Stop Inspection</h2>
      <MapPin :size="17" class="text-slate-500" />
    </div>

    <div v-if="!inspection" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
      Select a stop on the map to inspect parcels, service time, priority, and assignment.
    </div>

    <div v-else class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div class="mb-3 flex items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-900">{{ inspection.stop.id }}</p>
          <p class="text-xs text-slate-500">{{ inspection.assignedDriverName }}</p>
        </div>
        <span
          class="rounded-md px-2 py-1 text-xs font-semibold capitalize"
          :class="inspection.stop.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'"
        >
          {{ inspection.stop.priority }}
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 text-xs text-slate-600">
        <div class="rounded-md bg-slate-50 p-2">
          <Package :size="14" class="mb-1 text-slate-500" />
          <p class="font-semibold text-slate-900">{{ inspection.stop.parcelCount }}</p>
          <p>parcels</p>
        </div>
        <div class="rounded-md bg-slate-50 p-2">
          <Timer :size="14" class="mb-1 text-slate-500" />
          <p class="font-semibold text-slate-900">{{ inspection.stop.serviceMinutes }}m</p>
          <p>service</p>
        </div>
        <div class="rounded-md bg-slate-50 p-2">
          <MapPin :size="14" class="mb-1 text-slate-500" />
          <p class="font-semibold text-slate-900">{{ formatKm(inspection.distanceFromDepotKm) }}</p>
          <p>from depot</p>
        </div>
      </div>

      <label class="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500" for="driver-select">
        Reassign stop
      </label>
      <select
        id="driver-select"
        class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
        :value="inspection.stop.assignedDriverId ?? ''"
        @change="$emit('reassign', inspection.stop.id, ($event.target as HTMLSelectElement).value || null)"
      >
        <option value="">Unassigned</option>
        <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
          {{ driver.name }}
        </option>
      </select>
    </div>
  </section>
</template>
