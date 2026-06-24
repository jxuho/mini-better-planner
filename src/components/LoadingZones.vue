<script setup lang="ts">
import { AlertTriangle, Boxes } from '@lucide/vue';
import type { LoadingZone } from '@/types/planning';

defineProps<{
  zones: LoadingZone[];
}>();
</script>

<template>
  <section class="border-t border-slate-200 pt-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-900">Loading Zones</h2>
      <Boxes :size="17" class="text-slate-500" />
    </div>

    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="zone in zones"
        :key="zone.id"
        class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-700">{{ zone.name }}</span>
          <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: zone.color }" />
        </div>
        <p class="text-lg font-semibold text-slate-900">{{ zone.parcelCount }}</p>
        <p class="text-xs text-slate-500">of {{ zone.capacityParcels }} parcels</p>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            class="h-full rounded-full"
            :class="zone.parcelCount > zone.capacityParcels ? 'bg-red-600' : 'bg-teal-600'"
            :style="{ width: `${Math.min((zone.parcelCount / zone.capacityParcels) * 100, 120)}%` }"
          />
        </div>
        <p v-if="zone.warnings.length" class="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-700">
          <AlertTriangle :size="12" />
          Overloaded
        </p>
      </div>
    </div>
  </section>
</template>
