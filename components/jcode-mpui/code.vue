<template>
  <uni-easyinput :value="value2" disabled :clearable="false" />
</template>

<script setup>
import { $t, GUID, VALIDATENULL } from '@/utils/index';
import { computed, watch } from 'vue';

const props = defineProps({
  modelValue: [String],
  code: String,
});
const emit = defineEmits(['update:modelValue']);
defineOptions({ name: 'jcode-code' });

const value2 = computed({
  get() {
    if (
      VALIDATENULL(props.modelValue) ||
      props.modelValue.indexOf('jcode_code_') != -1
    ) {
      return $t('保存时生成');
    }
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
  },
});

watch(
  () => props.modelValue,
  function (newVal) {
    if (VALIDATENULL(newVal)) {
      value2.value = `jcode_code_${props.code}|${GUID()}`;
    }
  },
  { immediate: true },
);
</script>

<style></style>
