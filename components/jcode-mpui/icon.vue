<template>
  <view class="jcode-icon" :style="{ display: isBlock ? '' : 'flex' }">
    <image
      class="jcode-icon-image"
      :style="{ width: size + 'px', height: size + 'px' }"
      :src="svgDataurl()"
      mode="aspectFit"
    ></image>
  </view>
</template>
<script setup>
import { GET_ICON } from '@/utils/jcodePlatform';

const props = defineProps({
  type: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#333333',
  },
  size: {
    type: [Number, String],
    default: 16,
  },
  isBlock: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['click']);
defineOptions({ name: 'jcode-icon' });

const svgDataurl = function () {
  const icon = GET_ICON(props.type);
  if (icon) {
    const iconBody = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img"  viewBox="0 0 ${
      icon.width
    } ${icon.height}" >${icon.body.replace(
      /currentColor/g,
      props.color,
    )}</svg>`;
    // console.log(iconBody)
    return `data:image/svg+xml,${encodeURIComponent(iconBody)}`;
  } else {
    return '';
  }
};
const _onClick = function () {
  emit('click');
};
</script>

<style lang="scss">
.jcode-icon {
  text-align: center;
}
</style>
