<template>
  <uni-data-checkbox
    v-model="myValue"
    :localdata="myOptions"
  ></uni-data-checkbox>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    default: null,
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  options: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-radio' });

const myValue = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);

    const obj = myOptions.value.find((t) => t.value == val);
    emit('change', obj);
  },
});
const myOptions = computed(function () {
  return props.options.map((t) => ({
    value: t[props.valueKey],
    text: t[props.labelKey],
    disable: props.disabled,
  }));
});
</script>
