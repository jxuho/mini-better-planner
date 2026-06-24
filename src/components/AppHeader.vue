<script setup lang="ts">
import { Gauge, MapPinned, PackageCheck } from '@lucide/vue';

defineProps<{
  assignedStops: number;
  totalStops: number;
  totalParcels: number;
  balanceScore: number;
}>();
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
    <div class="flex items-center gap-4">
      <div class="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white">
        <MapPinned :size="21" />
      </div>
      <div>
        <h1 class="text-lg font-semibold tracking-normal text-ink">Mini Better Planner</h1>
        <p class="text-xs font-medium text-slate-500">Berlin depot morning dispatch</p>
      </div>
    </div>

    <div class="flex items-center gap-3 text-sm">
      <div class="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <PackageCheck :size="17" class="text-teal-700" />
        <span class="font-semibold text-slate-800">{{ assignedStops }}/{{ totalStops }}</span>
        <span class="text-slate-500">stops assigned</span>
      </div>
      <div class="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <Gauge :size="17" class="text-blue-700" />
        <span class="font-semibold text-slate-800">{{ totalParcels }}</span>
        <span class="text-slate-500">parcels</span>
      </div>
      <div class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <span class="font-semibold text-slate-800">{{ balanceScore }}</span>
        <span class="ml-1 text-slate-500">balance</span>
      </div>
    </div>
  </header>
</template>
