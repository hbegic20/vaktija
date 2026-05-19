<template>
  <div class="date-display">
    <div class="date-chip">
      <div class="date-chip-label">Kalendar</div>
      <div class="date-chip-value text-[38px] text-slate-700 font-semibold">{{ gregorian }}</div>
    </div>
    <div class="date-chip date-chip-hijri">
      <div class="date-chip-label">Hidžretski kalendar</div>
      <div class="date-chip-value text-[38px] text-emerald-700 font-semibold">{{ hijri }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  gregorian: { type: String, required: true },
  hijri: { type: String, required: true }
});
</script>
