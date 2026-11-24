<template>
  <view class="jcode-flex-box jcode-switch">
    <switch
      :checked="checked"
      :disabled="disabled"
      @change="handleChange"
      style="transform: scale(0.8)"
    />
  </view>
</template>

<script setup>
import { computed, onBeforeMount } from 'vue';

const props = defineProps({
  modelValue: {},
  valueType: {
    type: String,
    default: 'boolean',
  },
  activeValue: {
    type: String,
    default: 'true',
  },
  inactiveValue: {
    type: String,
    default: 'false',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-switch' });

const checked = computed(function () {
  return props.modelValue == toValueType(props.valueType, props.activeValue);
});

const handleChange = function (event) {
  let value;
  switch (props.valueType) {
    case 'boolean':
      value = event.detail.value;
      break;
    case 'string':
      value = event.detail.value ? props.activeValue : props.inactiveValue;
      break;
    case 'number':
      value = event.detail.value
        ? Number(props.activeValue)
        : Number(props.inactiveValue);
      break;
  }
  emit('update:modelValue', value);
  emit('change', value);
};
const toValueType = function (type, value) {
  switch (type) {
    case 'boolean':
      return value == 'true';
    case 'string':
      return value;
    case 'number':
      return Number(value);
  }
  return value;
};

onBeforeMount(() => {
  // console.log(this.activeValue,'this.activeValue')
});
</script>

<style lang="scss" scoped>
.jcode-switch {
  align-items: center;
}
</style>
