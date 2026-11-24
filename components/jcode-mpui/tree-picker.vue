<template>
  <view>
    <view
      class="jcode-input jcode-input-border"
      :class="{ 'jcode-input-placeholder': VALIDATENULL(modelValue) }"
      @tap.stop="handleOpen"
    >
      <view class="jcode-input__content"
        ><text>{{ text }}</text></view
      >
      <view class="jcode-input-icon-right">
        <uni-icons
          v-if="VALIDATENULL(modelValue)"
          type="bottom"
          size="15"
          color="#c0c4cc"
        ></uni-icons>
        <view v-else-if="!disabled" @tap.stop="handleClear">
          <uni-icons type="clear" size="15" color="#c0c4cc"></uni-icons>
        </view>
      </view>
    </view>

    <uni-popup ref="popup" type="bottom">
      <view class="jcode-picker-popup">
        <view class="jcode-popup-button-close" @click.stop="handleCancel">
          <jcode-icon
            type="jcode-icon-error"
            :size="14"
            color="#737987"
          ></jcode-icon>
        </view>
        <view class="jcode-box jcode-picker-popup__box">
          <scroll-view scroll-with-animation scroll-y style="height: 100%">
            <jcode-tree-view
              :options="options"
              :labelKey="labelKey"
              :valueKey="valueKey"
              :idKey="idKey"
              :pIdKey="pIdKey"
              :isTreeData="isTreeData"
              :loadData="loadData"
              @change="handleChange"
            >
            </jcode-tree-view>
          </scroll-view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { $t, COPY, TREE_TO_ARRAY, VALIDATENULL } from '@/utils/index';
import { computed, ref, onBeforeMount } from 'vue';

const props = defineProps({
  modelValue: {
    default: null,
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  idKey: {
    type: String,
    default: 'id',
  },
  pIdKey: {
    type: String,
    default: 'pid',
  },
  options: {
    type: Array,
    default: () => [],
  },
  isTreeData: Boolean,
  disabled: Boolean,
  placeholder: {
    type: String,
    default: '请选择',
  },
  loadData: Function,
  getShowText: Function,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-tree-picker' });

const showText = ref('');

const myValue = computed({
  get() {
    if (VALIDATENULL(props.modelValue)) {
      return '';
    }
    return props.modelValue;
  },
  set(val) {
    if (VALIDATENULL(val)) {
      emit('update:modelValue', '');
      emit('change', undefined);
    } else {
      emit('update:modelValue', val.value);
      emit('change', val);
    }
  },
});
const text = computed(function () {
  if (VALIDATENULL(myValue.value)) {
    return $t(props.placeholder || '');
  } else {
    if (!VALIDATENULL(showText.value)) {
      return showText.value;
    }

    let list = [];
    if (props.isTreeData) {
      TREE_TO_ARRAY(COPY(props.options), list);
    } else {
      list = props.options;
    }

    const obj = list.find((t) => t[props.valueKey] == myValue.value);
    if (obj) {
      return obj[props.labelKey];
    } else {
      if (!VALIDATENULL(props.modelValue) && props.getShowText) {
        return props.getShowText(props.modelValue);
      }
      return '';
    }
  }
});

const popup = ref(null);

const handleOpen = function () {
  if (props.disabled) {
    return;
  }
  popup.value.open();
};
const handleCancel = function () {
  popup.value.close();
};
const handleClear = function () {
  myValue.value = '';
};
const handleChange = function (item) {
  myValue.value = item;
  showText.value = item.label;
  popup.value.close();
};

onBeforeMount(() => {
  if (!VALIDATENULL(props.modelValue) && props.getShowText) {
    showText.value = props.getShowText(props.modelValue);
  }
});
</script>
