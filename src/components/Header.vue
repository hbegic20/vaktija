<template>
  <header class="hero-header flex items-center justify-between w-full gap-6">
    <div class="flex items-center gap-5 min-w-0">
      <div class="hero-logo-wrap">
        <img src="/vesela.jpeg" alt="Logo" class="hero-logo cover" />
      </div>
      <div class="min-w-0">
        <div class="text-[14px] uppercase tracking-[0.42em] text-emerald-900/80">Vaktija</div>
        <div class="text-[32px] text-slate-800 font-semibold leading-tight">{{ mosqueName }}</div>
      </div>
    </div>
    <div class="hero-city-chip text-[24px] text-slate-700">
      Grad: {{ cityLabel }}, Vesela
    </div>
  </header>
</template>

<script setup>
defineProps({
  mosqueName: { type: String, required: true },
  cityLabel: { type: String, required: true }
});
</script>
