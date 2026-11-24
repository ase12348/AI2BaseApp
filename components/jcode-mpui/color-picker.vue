<template>
  <view>
    <view
      class="jcode-box jcode-input jcode-input-border"
      :class="{ 'jcode-input-placeholder': VALIDATENULL(modelValue) }"
      @tap.stop="handleOpen"
    >
      <view class="jcode-input__content"
        ><text>{{ myValue }}</text></view
      >
      <view
        class="jcode-input__color-content"
        :style="{ background: myValue }"
      ></view>
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

    <jcode-color-popup
      ref="colorPicker"
      @confirm="confirm"
    ></jcode-color-popup>
  </view>
</template>

<script setup>
import { $t, VALIDATENULL } from '@/utils/index';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {},
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
defineOptions({ name: 'jcode-color-picker' });

const myValue = computed({
  get() {
    if (VALIDATENULL(props.modelValue)) {
      return $t(props.placeholder);
    }

    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
    emit('change', val);
  },
});

const colorPicker = ref(null);

const handleOpen = function () {
  if (props.disabled) {
    return;
  }
  // 打开颜色选择器
  colorPicker.value.open(myValue.value);
};
const handleClear = function () {
  if (props.disabled) {
    return;
  }
  myValue.value = '';
};
const confirm = function ({ rgba }) {
  myValue.value = `rgba(${rgba.r}, ${rgba.g},${rgba.b}, ${rgba.a})`;
};
</script>
<style lang="scss" scoped>
.jcode-input__color-content {
  position: absolute;
  top: 5px;
  right: 24px;
  height: 24px;
  width: 24px;
}
</style>
