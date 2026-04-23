<template>
  <div class="section-card space-y-2">
    <div class="text-[28px] text-slate-700 font-semibold">Vrijeme - {{ cityLabel }}</div>
    <div class="text-[26px] text-slate-700">Temperatura: {{ temperature }}°C</div>
    <div class="text-[26px] text-slate-700">Vrijeme: {{ description }}</div>
    <div class="text-[26px] text-slate-700">Vjetar: {{ windspeed }} km/h</div>
  </div>
</template>

<script setup>
defineProps({
  cityLabel: { type: String, required: true },
  temperature: { type: Number, default: 0 },
  description: { type: String, default: "--" },
  windspeed: { type: Number, default: 0 }
});
</script>
