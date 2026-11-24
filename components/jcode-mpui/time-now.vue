<template>
  <text>{{ time }}</text>
</template>

<script setup>
import { DATENOW } from '@/utils/index';
import { ref, onBeforeMount } from 'vue';

const props = defineProps({
  modelValue: String,
  format: {
    type: String,
    default: 'HH:mm:ss',
  },
});
const emit = defineEmits(['update:modelValue']);
defineOptions({ name: 'jcode-time-now' });

const time = ref('');

const refreshTime = function () {
  time.value = DATENOW(props.format);
  emit('update:modelValue', time.value);
  setTimeout(() => {
    refreshTime();
  }, 1000);
};

onBeforeMount(() => {
  refreshTime();
});
</script>
