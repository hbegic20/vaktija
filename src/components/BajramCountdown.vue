<template>
  <div class="section-card space-y-2">
    <div class="text-[28px] text-slate-700 font-semibold">Bajram</div>
    <div class="text-[20px] text-slate-500">{{ bajramDate }}</div>
    <div class="text-[28px] text-slate-700">
      {{ bajramLabel }} za:
      <span class="font-bajram-count text-[34px] font-bold text-emerald-700">
        {{ daysToEid }} dana
      </span>
    </div>
    <div v-if="showTime" class="text-[32px] text-emerald-700 font-display">
      {{ timeToEid.hours }}:{{ timeToEid.minutes }}:{{ timeToEid.seconds }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  bajramLabel: { type: String, default: "Bajram" },
  bajramDate: { type: String, default: "" },
  daysToEid: { type: Number, default: 0 },
  showTime: { type: Boolean, default: false },
  timeToEid: {
    type: Object,
    default: () => ({ hours: "00", minutes: "00", seconds: "00" })
  }
});
</script>
