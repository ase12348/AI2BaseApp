<template>
  <view
    class="jcode-input jcode-input-border"
    @click.stop="handleClick"
    :class="{ 'jcode-input-placeholder': VALIDATENULL(modelValue) }"
  >
    <view class="jcode-input__content"
      ><text>{{ $t(text) }}</text></view
    >
    <view class="jcode-input-icon-right">
      <uni-icons
        v-if="VALIDATENULL(modelValue)"
        type="bottom"
        size="14"
        color="#c0c4cc"
      ></uni-icons>
      <view v-else-if="!disabled" @tap.stop="handleClear">
        <uni-icons type="clear" size="14" color="#c0c4cc"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { $t, NAV_TO_LAYER, ONCE, VALIDATENULL } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  modelValue: { default: null },
  placeholder: {
    type: String,
    default: '请选择',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-icon-picker' });

const text = computed(function () {
  if (VALIDATENULL(props.modelValue)) {
    return props.placeholder || '';
  }
  return props.modelValue;
});

const handleClick = function () {
  if (props.disabled) {
    return;
  }

  ONCE('select-jcode-icon', (data) => {
    emit('update:modelValue', data);
    emit('change', data);
  });

  NAV_TO_LAYER('/pages/common/jcode-icon-picker');
};
const handleClear = function () {
  if (props.disabled) {
    return;
  }

  emit('update:modelValue', '');
  emit('change', undefined);
};
</script>
