<template>
  <view class="jcode-timeline__item">
    <view class="jcode-timeline__column-line">
      <view
        class="jcode-timeline__line-before"
        :style="{ 'background-color': isFirst ? 'transparent' : '' }"
      ></view>
      <view
        class="jcode-timeline__circle"
        :style="{ 'background-color': color }"
      ></view>
      <view
        class="jcode-timeline__line-after"
        :style="{ 'background-color': isLast ? 'transparent' : '' }"
      ></view>
    </view>
    <view :style="contentStyle" class="jcode-timeline__content">
      <slot name="time">
        <view v-if="time">
          <text class="jcode-timeline__content-time">{{
            TABLEITEM_DATEFORMAT(time, 'YYYY-MM-DD HH:mm:ss').toString()
          }}</text>
        </view>
      </slot>
      <slot></slot>
    </view>
  </view>
</template>

<script setup>
import { TABLEITEM_DATEFORMAT } from '@/utils/index';

const props = defineProps({
  isFirst: {
    default: false,
  },
  isLast: {
    default: false,
  },
  time: {},
  color: { default: '' },
  contentStyle: {},
});
defineOptions({ name: 'jcode-timeline-item' });
</script>
