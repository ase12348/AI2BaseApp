<template>
  <view>
    <view class="barcode">
      <view class="barnum" :style="styleName" v-if="textPosition == 'top'">{{
        value
      }}</view>
      <canvas
        canvas-id="barcode"
        id="barcode"
        :style="{ height: height + 'px' }"
      />
      <view class="barnum" :style="styleName" v-if="textPosition == 'bottom'">{{
        value
      }}</view>
    </view>
  </view>
</template>

<script setup>
import { BarCode } from '@uni-plugs/uni-code';
import { computed, onMounted } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  type: {
    type: String,
    default: 'CODE128', //条码类型 默认CODE128 可选值 CODE39 UPCE UPC EAN13 ITF ITF14 MSI Codabar Pharmacode
  },
  height: {
    // 高度
    type: Number,
    default: 100,
  },
  displayValue: {
    type: Boolean, // 是否显示文本
    default: true,
  },
  fontOptions: {
    // 文字样式
    type: String,
    default: '',
  },
  textAlign: {
    // 文字对齐方式
    type: String,
    default: 'left',
  },
  textPosition: {
    // 文本位置
    type: String,
    default: 'bottom',
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
});

const styleName = computed(function () {
  return {
    width: '200px',
    color: props.color,
    backgroundColor: props.background,
    textAlign: props.textAlign,
    fontWeight: props.fontOptions.indexOf('bold') != -1 ? 'bold' : '',
    fontStyle: props.fontOptions.indexOf('italic') != -1 ? 'italic' : 'normal',
    display: props.displayValue ? 'block' : 'none',
  };
});

const findCan = function () {
  //条形码
  BarCode({
    id: 'barcode',
    code: String(props.modelValue),
    color: props.color,
    bgColor: props.background,
    type: props.type,
    width: 200,
    height: props.height,
  });
};

onMounted(() => {
  findCan();
});
</script>
