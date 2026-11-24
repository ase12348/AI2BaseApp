<template>
  <view>
    <tki-qrcode
      :val="modelValue"
      :size="size"
      :background="background"
      :color="color"
      :margin="margin"
      loadMake
      :onval="true"
    />
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  background: String,
  color: {
    // 条码颜色
    type: String,
    default: '#000000',
  },
  margin: {
    type: Number,
    default: 0,
  },

  size: {
    type: Number,
    default: 400,
  },
});
defineOptions({ name: 'jcode-qrcode' });

onLoad(() => {});
</script>

<style></style>
