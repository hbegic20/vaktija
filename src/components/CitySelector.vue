<template>
  <div class="flex items-center gap-3 text-[26px]">
    <span class="text-slate-700">Grad:</span>
    <select
      class="bg-white text-slate-800 px-3 py-2 rounded-lg border border-slate-300"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-for="city in cities" :key="city.key" :value="city.key">
        {{ city.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  cities: { type: Array, required: true }
});

defineEmits(["update:modelValue"]);
</script>
