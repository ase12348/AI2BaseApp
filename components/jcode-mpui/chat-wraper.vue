<template>
  <view class="jcode-chat">
    <slot></slot>
    <view v-if="empty" class="padding text-gray text-center">{{
      $t(emptyTips)
    }}</view>
    <view v-if="!empty && nomore" class="padding text-gray text-center">{{
      $t(nomoreTips)
    }}</view>
  </view>
</template>

<script setup>
import { $t } from '@/utils/index';

const props = defineProps({
  empty: {},
  emptyTips: { default: '暂无消息' },
  nomore: { default: true },
  nomoreTips: { default: '没有更多消息了' },
});
defineOptions({ name: 'jcode-chat-wraper' });
</script>

<style lang="scss">
.jcode-chat {
  display: flex;
  flex-direction: column;
}
</style>
