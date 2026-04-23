<template>
  <div class="section-card space-y-3">
    <div class="text-[28px] text-slate-700 font-semibold">Ramazan</div>
    <div v-if="isRamadan" class="space-y-2">
      <div class="text-[30px] text-ramadan">Ramazan - {{ dayIndex }}. dan</div>
      <div class="text-[28px] text-slate-700">Sehur: {{ sehur }}</div>
      <div class="text-[28px] text-slate-700">Iftar: {{ iftar }}</div>
      <div>
        <div class="text-[24px] text-slate-600 mb-2">Napredak Ramazana</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="text-[24px] text-slate-600 mt-2">{{ progress }}%</div>
      </div>
    </div>
    <div v-else class="space-y-1">
      <div class="text-[28px] text-slate-700">{{ bajramLabel }} za: {{ daysToEid }} dana</div>
      <div class="text-[28px] text-emerald-700 font-display">
        {{ timeToEid.hours }}:{{ timeToEid.minutes }}:{{ timeToEid.seconds }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isRamadan: { type: Boolean, required: true },
  dayIndex: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  bajramLabel: { type: String, default: "Bajram" },
  daysToEid: { type: Number, default: 0 },
  timeToEid: {
    type: Object,
    default: () => ({ hours: "00", minutes: "00", seconds: "00" })
  },
  sehur: { type: String, default: "--:--" },
  iftar: { type: String, default: "--:--" }
});
</script>
