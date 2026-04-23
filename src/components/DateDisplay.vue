<template>
  <div class="flex items-center justify-between px-2">
    <div class="text-[38px] text-slate-700 font-semibold">{{ gregorian }}</div>
    <div class="text-[38px] text-emerald-700 font-semibold">{{ hijri }}</div>
  </div>
</template>

<script setup>
defineProps({
  gregorian: { type: String, required: true },
  hijri: { type: String, required: true }
});
</script>
