<template>
  <div class="section-card text-center">
    <div class="text-[30px] text-slate-600 mb-1">Sljedeći namaz</div>
    <div class="text-[56px] font-display text-slate-900 mb-1">{{ nextPrayerLabel }}</div>
    <div class="text-[80px] font-display text-emerald-700">{{ countdown }}</div>
  </div>
</template>

<script setup>
defineProps({
  nextPrayerLabel: { type: String, required: true },
  countdown: { type: String, required: true }
});
</script>
