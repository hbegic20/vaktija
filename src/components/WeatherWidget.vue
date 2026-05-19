<template>
  <div class="section-card space-y-2">
    <div class="text-[36px] text-slate-700">Temperatura: <b>{{ temperature }}°C</b></div>
    <div class="text-[36px] text-slate-700">Vrijeme: <b>{{ description }}</b></div>
    <div class="text-[36px] text-slate-700">Vjetar: <b>{{ windspeed }} km/h</b></div>
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
