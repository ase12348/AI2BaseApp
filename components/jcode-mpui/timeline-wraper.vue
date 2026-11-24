<template>
  <view class="jcode-timeline">
    <slot></slot>
  </view>
</template>

<script setup>
const props = defineProps({
  title: {},
});
defineOptions({ name: 'jcode-timeline-wraper' });
</script>
