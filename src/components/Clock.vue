<template>
  <div class="text-center">
    <div class="text-[112px] font-display tracking-[0.18em] clock-3d">
      {{ timeText }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  timeText: { type: String, required: true }
});
</script>
