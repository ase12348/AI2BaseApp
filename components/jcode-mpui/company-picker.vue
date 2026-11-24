<template>
  <jcode-tree-picker
    :options="options"
    idKey="value"
    pIdKey="f_ParentId"
    :disabled="disabled"
    :placeholder="$t(placeholder)"
    @change="handleChange"
    v-model="myValue"
  >
  </jcode-tree-picker>
</template>

<script setup>
import { $t } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  getDataSource: Function,
  disabled: Boolean,
  placeholder: String,
  modelValue: {
    type: String,
    default: '',
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-company-picker' });

const options = computed(function () {
  if (props.getDataSource) {
    return props.getDataSource({ type: 'companySelect' });
  }
  return [];
});
const myValue = computed({
  set(val) {
    emit('update:modelValue', val);
  },
  get() {
    return props.modelValue;
  },
});

const handleChange = function (val) {
  emit('change', val);
};
</script>

<style></style>
