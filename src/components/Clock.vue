<template>
  <div class="text-center hero-clock">
    <div class="clock-shell">
      <div class="clock-caption">Trenutno vrijeme</div>
      <div class="clock-value" aria-label="Current time">
        <template v-for="(slot, index) in slots" :key="`${index}-${slot.type}`">
          <div v-if="slot.type === 'digit'" class="clock-digit-window">
            <div
              class="clock-digit-reel"
              :class="{ 'clock-digit-reel--animated': slot.animate }"
              :style="{ transform: `translateY(-${slot.offset}em)` }"
              @transitionend="handleTransitionEnd(index)"
            >
              <div
                v-for="(digit, digitIndex) in rollingDigits"
                :key="`${index}-${digitIndex}-${digit}`"
                class="clock-digit-cell"
              >
                {{ digit }}
              </div>
            </div>
          </div>
          <div v-else class="clock-separator" aria-hidden="true">:</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from "vue";

const props = defineProps({
  timeText: { type: String, required: true }
});

const DIGITS = Array.from({ length: 10 }, (_, index) => String(index));
const rollingDigits = [...DIGITS, ...DIGITS];
const slots = ref([]);

const createSeparatorSlot = (value) => ({
  type: "separator",
  value
});

const createDigitSlot = (digit) => ({
  type: "digit",
  digit,
  offset: Number(digit),
  animate: false
});

const normalizeDigitOffset = (slot) => {
  slot.offset = Number(slot.digit);
};

watch(
  () => props.timeText,
  (value) => {
    const nextCharacters = String(value || "").split("");
    const previousSlots = slots.value;

    slots.value = nextCharacters.map((character, index) => {
      if (character === ":") {
        return createSeparatorSlot(character);
      }

      const previousSlot = previousSlots[index];
      const nextDigit = String(character);

      if (!previousSlot || previousSlot.type !== "digit") {
        return createDigitSlot(nextDigit);
      }

      if (previousSlot.digit === nextDigit) {
        return { ...previousSlot, animate: false };
      }

      const baseOffset = Math.floor(previousSlot.offset / 10) * 10;
      const nextOffset = nextDigit > previousSlot.digit
        ? baseOffset + Number(nextDigit)
        : baseOffset + 10 + Number(nextDigit);

      return {
        ...previousSlot,
        digit: nextDigit,
        offset: nextOffset,
        animate: true
      };
    });
  },
  { immediate: true }
);

const handleTransitionEnd = (index) => {
  const slot = slots.value[index];
  if (!slot || slot.type !== "digit" || !slot.animate) return;

  slot.animate = false;
  nextTick(() => {
    normalizeDigitOffset(slot);
  });
};
</script>
