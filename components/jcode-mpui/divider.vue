<template>
  <view class="jcode-divider">
    <view class="jcode-divider__line"> </view>
    <text class="jcode-divider__text">{{ $t(text) }}</text>
    <view class="jcode-divider__line"> </view>
  </view>
</template>

<script setup>
import { $t } from '@/utils/index';

const props = defineProps({
  text: { default: '' },
});
defineOptions({ name: 'jcode-divider' });
</script>

<style lang="scss" scoped>
.jcode-divider {
  display: flex;
  flex-direction: row;
  align-items: center;

  &__text {
    font-size: 12px;
    margin: 0 16px;
    color: $uni-extra-color;
  }

  &__line {
    margin: 0px;
    border-bottom: 1px solid $uni-border-1;
    width: 100%;
    transform: scaleY(0.5);
    border-top-color: $uni-border-1;
    border-right-color: $uni-border-1;
    border-left-color: $uni-border-1;
    flex: 1 1 0%;
  }
  margin: 8px 0;
}
</style>
