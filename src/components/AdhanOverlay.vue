<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-emerald-900/95 text-white"
  >
    <div class="text-[48px] mb-4">Vrijeme je za namaz</div>
    <div class="text-[90px] font-display text-emerald-200">{{ prayerLabel }}</div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, required: true },
  prayerLabel: { type: String, default: "" }
});
</script>
