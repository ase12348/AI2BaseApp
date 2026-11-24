<template>
  <slider
    :block-size="16"
    :show-value="showTooltip"
    :disabled="disabled"
    :value="myValue"
    @change="handleChange"
  />
</template>

<script setup>
import { VALIDATENULL } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  modelValue: {},
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  disabled: Boolean,
  showTooltip: Boolean,
});
const emit = defineEmits(['update:modelValue']);
defineOptions({ name: 'jcode-slider' });

const myValue = computed({
  get() {
    if (VALIDATENULL(props.modelValue)) {
      return 0;
    }
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

const handleChange = function (event) {
  const value = event.detail.value;
  emit('update:modelValue', value);
};
</script>

<style lang="scss" scoped>
.jcode-slider {
  align-items: center;
}
</style>
