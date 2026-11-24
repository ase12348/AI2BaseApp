<template>
  <uni-data-checkbox
    multiple
    v-model="myValue"
    :localdata="myOptions"
  ></uni-data-checkbox>
</template>

<script setup>
import { VALIDATENULL } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  modelValue: [String],
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
defineOptions({ name: 'jcode-checkbox' });

const myValue = computed({
  get() {
    if (VALIDATENULL(props.modelValue)) {
      return [];
    }
    if (!props.modelValue.split) {
      return props.modelValue;
    }
    return props.modelValue.split(',');
  },
  set(val) {
    emit('update:modelValue', val.join(','));

    const objs = [];
    if (val.length == 0) {
      emit('change', undefined);
    } else {
      val.forEach((item) => {
        const objone = props.options.find((t) => t[props.valueKey] == item);
        objs.push(objone);
      });
      emit('change', objs);
    }
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
