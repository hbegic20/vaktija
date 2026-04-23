<template>
  <header class="flex items-center justify-between w-full">
    <div class="flex items-center justify-between gap-4 w-full">
      <!-- <img src="/logo.png" alt="Logo" class="h-16 w-16 object-contain" /> -->
      <div>
        <div class="text-[30px] text-slate-800 font-semibold">{{ mosqueName }}</div>
      </div>
      <div class="text-[26px] text-slate-600">Grad: {{ cityLabel }}, Vesela</div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  mosqueName: { type: String, required: true },
  cityLabel: { type: String, required: true }
});
</script>
