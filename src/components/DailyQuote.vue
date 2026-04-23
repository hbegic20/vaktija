<template>
  <div class="quote-card">
    <div class="flex items-center justify-between gap-6">
      <div class="text-[24px] uppercase tracking-[0.18em] text-emerald-100">
        Ajet Dana
      </div>
      <div class="text-[22px] text-emerald-200">
        {{ quote.reference }}
      </div>
    </div>

    <div class="mt-3 text-right font-arabic text-[34px] leading-[1.7] text-white">
      {{ quote.arabic }}
    </div>

    <div class="quote-bosnian font-quote-bosnian mt-3 text-emerald-50">
      {{ quote.bosnian }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  quote: {
    type: Object,
    required: true
  }
});
</script>
