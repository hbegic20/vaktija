<template>
  <div class="quote-card">
    <div class="flex items-center justify-between gap-6">
      <div class="text-[20px] uppercase tracking-[0.18em] text-emerald-100">
        Ajet Dana
      </div>
      <div class="text-[18px] text-emerald-200">
        {{ quote.reference }}
      </div>
    </div>

    <div class="mt-3 text-right font-arabic text-[28px] leading-[1.6] text-white">
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
