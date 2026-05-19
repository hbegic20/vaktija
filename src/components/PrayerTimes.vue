<template>
  <div class="table-card">
    <div class="table-header flex items-center justify-between">
      <div class="text-[36px] uppercase tracking-[0.2em]">Vrijeme namaza</div>
      <div class="text-[36px] uppercase tracking-[0.2em]">اوقات الصلاة</div>
    </div>

    <div>
      <div
        v-for="prayer in prayers"
        :key="prayer.key"
        class="table-row grid grid-cols-[240px_240px_240px] items-center text-[58px]"
        :class="{
          'table-row-next': prayer.isNext,
          'table-row-current': prayer.isCurrent
        }"
      >
        <div class="text-slate-800">{{ prayer.labelBs }}</div>
        <div class="text-center font-display text-slate-900">{{ prayer.time }}</div>
        <div class="text-right font-arabic text-slate-800">{{ prayer.labelAr }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  prayers: { type: Array, required: true }
});
</script>
