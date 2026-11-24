<template>
  <view class="tki-qrcode">
    <canvas
      class="tki-qrcode-canvas"
      :canvas-id="cid"
      :id="cid"
      :style="{ width: cpSize + 'px', height: cpSize + 'px' }"
    />
    <image
      v-show="show"
      :src="result"
      :style="{ width: cpSize + 'px', height: cpSize + 'px' }"
    />
  </view>
</template>

<script setup>
import QRCode from './qrcode.js';
import { $t } from '@/utils/index';
import { computed, watch, ref, onMounted } from 'vue';
import { getCurrentInstance } from 'vue';

let qrcode;

const props = defineProps({
  cid: { type: String, default: 'tki-qrcode-canvas' },
  size: { type: Number, default: 200 },
  unit: { type: String, default: 'upx' },
  show: { type: Boolean, default: true },
  val: { type: String, default: '' },
  background: { type: String, default: '#ffffff' },
  foreground: { type: String, default: '#000000' },
  pdground: { type: String, default: '#000000' },
  icon: { type: String, default: '' },
  iconSize: { type: Number, default: 40 },
  lv: { type: Number, default: 3 },
  onval: { type: Boolean, default: false },
  loadMake: { type: Boolean, default: false },
  usingComponents: { type: Boolean, default: true },
  showLoading: { type: Boolean, default: true },
  loadingText: { type: String, default: '二维码生成中' },
});
const emit = defineEmits(['result']);
defineOptions({ name: 'tki-qrcode' });

const { proxy } = getCurrentInstance();

const result = ref('');

const cpSize = computed(function () {
  if (props.unit == 'upx') {
    return uni.upx2px(props.size);
  } else {
    return props.size;
  }
});

const cSize = ref(null);

const _makeCode = function () {
  if (!_empty(props.val)) {
    qrcode = new QRCode({
      context: proxy, // 上下文环境
      canvasId: props.cid, // canvas-id
      usingComponents: props.usingComponents, // 是否是自定义组件
      showLoading: props.showLoading, // 是否显示loading
      loadingText: $t(props.loadingText), // loading文字
      text: props.val, // 生成内容
      size: cpSize.value, // 二维码大小
      background: props.background, // 背景色
      foreground: props.foreground, // 前景色
      pdground: props.pdground, // 定位角点颜色
      correctLevel: props.lv, // 容错级别
      image: props.icon, // 二维码图标
      imageSize: props.iconSize, // 二维码图标大小
      cbResult: function (res) {
        // 生成二维码的回调
        _result(res);
      },
    });
  } else {
    uni.showToast({
      title: $t('二维码内容不能为空'),
      icon: 'none',
      duration: 2000,
    });
  }
};
const _clearCode = function () {
  _result('');
  qrcode.clear();
};
const _saveCode = function () {
  if (result.value != '') {
    uni.saveImageToPhotosAlbum({
      filePath: result.value,
      success: function () {
        uni.showToast({
          title: $t('二维码保存成功'),
          icon: 'success',
          duration: 2000,
        });
      },
    });
  }
};
const _result = function (res) {
  result.value = res;
  emit('result', res);
};
const _empty = function (v) {
  let tp = typeof v,
    rt = false;
  if (tp == 'number' && String(v) == '') {
    rt = true;
  } else if (tp == 'undefined') {
    rt = true;
  } else if (tp == 'object') {
    if (JSON.stringify(v) == '{}' || JSON.stringify(v) == '[]' || v == null)
      rt = true;
  } else if (tp == 'string') {
    if (v == '' || v == 'undefined' || v == 'null' || v == '{}' || v == '[]')
      rt = true;
  } else if (tp == 'function') {
    rt = false;
  }
  return rt;
};

onMounted(() => {
  if (props.loadMake) {
    if (!_empty(props.val)) {
      setTimeout(() => {
        _makeCode();
      }, 300);
    }
  }
});

watch(
  () => props.size,
  function (n, o) {
    if (n != o && !_empty(n)) {
      cSize.value = n;
      if (!_empty(props.val)) {
        setTimeout(() => {
          _makeCode();
        }, 100);
      }
    }
  },
  {},
);
watch(
  () => props.val,
  function (n, o) {
    if (props.onval) {
      if (n != o && !_empty(n)) {
        setTimeout(() => {
          _makeCode();
        }, 0);
      }
    }
  },
  {},
);
</script>

<style>
.tki-qrcode {
  position: relative;
}
.tki-qrcode-canvas {
  position: fixed;
  top: -99999upx;
  left: -99999upx;
  z-index: -99999;
}
</style>
