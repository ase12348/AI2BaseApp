<template>
  <view class="auto-complete" :class="border ? '' : 'uni-combox__no-border'">
    <view class="uni-combox__input-box">
      <slot name="left"> </slot>
      <input
        class="uni-combox__input"
        type="text"
        :placeholder="$t(placeholder)"
        :disabled="disabled"
        placeholder-class="uni-combox__input-plac"
        v-model="inputVal"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        :class="isTag ? 'auto-input-tag' : ''"
        v-if="!(isTag && disabled)"
      />
      <view
        class="auto-input-btn"
        v-if="isTag && !disabled"
        @click="handleBtnClick"
        >{{ $t('确认') }}</view
      >
    </view>
    <view
      class="uni-combox__selector"
      v-if="showSelector && myOptions.length > 0"
    >
      <view class="uni-popper__arrow"></view>
      <scroll-view scroll-y="true" class="uni-combox__selector-scroll">
        <view
          class="uni-combox__selector-item"
          v-for="(item, index) in myOptions"
          :key="index"
          @click="onSelectorClick(item[valueKey])"
        >
          <text>{{ item[labelKey] }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { $t } from '@/utils/index';
import { computed, watch, ref } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
  placeholder: {
    type: String,
    default: '请选择',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  options: {
    type: Array,
    default: () => [],
  },
  disabled: Boolean,
  border: {
    type: Boolean,
    default: true,
  },
  isTag: Boolean,
});
const emit = defineEmits(['change', 'select', 'update:modelValue']);
defineOptions({ name: 'jcode-auto-complete' });

const showSelector = ref(false);
const inputVal = ref('');

const myOptions = computed(function () {
  const res = props.options || [];
  return res;
});
const candidates = computed(function () {
  const res = props.options.map((item) => item[props.labelKey]);
  return res || [];
});

const toggleSelector = function () {
  showSelector.value = !showSelector.value;
};
const onFocus = function () {
  showSelector.value = true;
};
const onBlur = function () {
  setTimeout(() => {
    showSelector.value = false;
  }, 153);
};
const onSelectorClick = function (val) {
  inputVal.value = val;
  showSelector.value = false;
  emit('update:modelValue', inputVal.value);
  emit('select', inputVal.value);
  emit('change', inputVal.value);
  if (props.isTag) {
    inputVal.value = '';
  }
};
const onInput = function () {
  setTimeout(() => {
    emit('update:modelValue', inputVal.value);
    emit('change', inputVal.value);
  });
};
const handleBtnClick = function () {
  emit('select', inputVal.value);
  inputVal.value = '';
};

watch(
  () => props.modelValue,
  function (newVal) {
    inputVal.value = newVal;
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
.auto-complete {
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px 10px;
  position: relative;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  // height: 40px;
  flex-direction: row;
  align-items: center;

  // border-bottom: solid 1px #DDDDDD;
  .uni-combox__input-box {
    position: relative;
    /* #ifndef APP-NVUE */
    // display: flex;
    /* #endif */
    flex: 1;
    flex-direction: row;
    align-items: center;
  }

  .uni-combox__input {
    flex: 1;
    font-size: 14px;
    height: 22px;
    line-height: 22px;
    border-radius: 4px;
  }

  .auto-input-tag {
    border: 1px solid #dcdfe6;
    height: 30px;
  }

  .uni-combox__input-plac {
    font-size: 14px;
    color: #999;
  }

  .auto-input-btn {
    background-color: #2979ff;
    color: #fff;
    font-size: 14px;
    height: 20px;
    width: 33px;
    padding: 2px 4px;
    text-align: center;
    border-radius: 4px;
    margin-top: 2px;
  }

  .uni-combox__selector {
    /* #ifndef APP-NVUE */
    box-sizing: border-box;
    /* #endif */
    position: absolute;
    top: calc(100% + 12px);
    left: 0;
    width: 100%;
    background-color: #ffffff;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 2;
    padding: 4px 0;
  }

  .uni-combox__selector-scroll {
    /* #ifndef APP-NVUE */
    max-height: 200px;
    box-sizing: border-box;
    /* #endif */
  }

  .uni-combox__selector-empty,
  .uni-combox__selector-item {
    /* #ifndef APP-NVUE */
    display: flex;
    cursor: pointer;
    /* #endif */
    line-height: 36px;
    font-size: 14px;
    text-align: center;
    // border-bottom: solid 1px #DDDDDD;
    padding: 0px 10px;
  }

  .uni-combox__selector-item:hover {
    background-color: #f9f9f9;
  }

  .uni-combox__selector-empty:last-child,
  .uni-combox__selector-item:last-child {
    /* #ifndef APP-NVUE */
    border-bottom: none;
    /* #endif */
  }

  // picker 弹出层通用的指示小三角
  .uni-popper__arrow,
  .uni-popper__arrow::after {
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    border-width: 6px;
  }

  .uni-popper__arrow {
    filter: drop-shadow(0 2px 12px rgba(0, 0, 0, 0.03));
    top: -6px;
    left: 10%;
    margin-right: 3px;
    border-top-width: 0;
    border-bottom-color: #ebeef5;
  }

  .uni-popper__arrow::after {
    content: ' ';
    top: 1px;
    margin-left: -6px;
    border-top-width: 0;
    border-bottom-color: #fff;
  }

  .uni-combox__no-border {
    border: none;
  }
}
</style>
