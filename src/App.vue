<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import MapView from '@/components/MapView.vue';
import PlanningPanel from '@/components/PlanningPanel.vue';
import { usePlanning } from '@/composables/usePlanning';

const {
  autoAssignStops,
  depot,
  driverCount,
  drivers,
  loadingZones,
  metrics,
  regenerateStops,
  reassignStop,
  resetPlan,
  selectDriver,
  selectStop,
  selectedDriverId,
  selectedStopId,
  selectedStopInspection,
  setDriverCount,
  stops,
  tours,
} = usePlanning();
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <AppHeader
      :assigned-stops="metrics.assignedStops"
      :balance-score="metrics.loadBalanceScore"
      :total-parcels="metrics.totalParcels"
      :total-stops="metrics.totalStops"
    />

    <main class="flex">
      <MapView
        :depot="depot"
        :selected-driver-id="selectedDriverId"
        :selected-stop-id="selectedStopId"
        :stops="stops"
        :tours="tours"
        @select-driver="selectDriver"
        @select-stop="selectStop"
      />

      <PlanningPanel
        :driver-count="driverCount"
        :drivers="drivers"
        :loading-zones="loadingZones"
        :metrics="metrics"
        :selected-driver-id="selectedDriverId"
        :selected-stop-inspection="selectedStopInspection"
        :tours="tours"
        @auto-assign="autoAssignStops"
        @regenerate="regenerateStops"
        @reassign-stop="reassignStop"
        @reset="resetPlan"
        @select-driver="selectDriver"
        @set-driver-count="setDriverCount"
      />
    </main>
  </div>
</template>
