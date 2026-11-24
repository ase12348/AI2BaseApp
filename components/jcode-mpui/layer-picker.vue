<template>
  <view>
    <view
      @click.stop="handleClick"
      class="jcode-input jcode-input-border"
      :class="{ 'jcode-input-placeholder': VALIDATENULL(modelValue) }"
      v-if="!onlyButton"
    >
      <view class="jcode-input__content"
        ><text>{{ label() }}</text></view
      >
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
    <view v-else>
      <button
        :disabled="disabled"
        :type="danger ? 'warn' : type"
        :size="size"
        @click.stop="handleClick"
      >
        <view style="display: flex; align-items: center">
          <jcode-icon
            :type="iconName"
            :size="16"
            :isBlock="false"
            style="margin-right: 2px"
            v-if="iconName"
            :color="type == 'default' ? '' : '#fff'"
          />
          <text>{{ $t(content) }}</text>
        </view>
      </button>
    </view>
  </view>
</template>

<script setup>
import { $t, NAV_TO_LAYER, ONCE, VALIDATENULL } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  modelValue: { default: null },
  placeholder: {
    type: String,
    default: '请选择',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  columns: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  title: String,
  onlyButton: {
    type: Boolean,
    default: false,
  },
  content: String,
  type: {
    type: String,
    default: 'primary',
  },
  size: {
    type: String,
    default: 'mini',
  },
  danger: Boolean,
  iconName: String,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-layer-picker' });

const displayPlaceholder = computed(function () {
  if (props.disabled) {
    return '';
  }

  if (props.placeholder) {
    return $t(props.placeholder);
  }

  return props.title ? `${$t('请选择')}${props.title}` : `${$t('请选择')}…`;
});
const myColumns = computed(function () {
  return props.columns.filter((t) => !t.hidden);
});

const handleClick = function () {
  if (props.disabled) {
    return;
  }

  ONCE('jcode-layer-picker', (data) => {
    // console.log(this.valueKey,data,'jcode-layer-picker');
    emit('update:modelValue', data[props.valueKey]);
    emit('change', data);

    // console.log(this.modelValue);
  });

  NAV_TO_LAYER('/pages/common/jcode-layer-picker', {
    columns: myColumns.value,
    options: props.options,
  });
};
const handleClear = function () {
  emit('update:modelValue', undefined);
  emit('change', undefined);
};
const label = function () {
  if (VALIDATENULL(props.modelValue)) {
    return $t(props.placeholder);
  } else {
    const res = props.options.find(
      (t) => t[props.valueKey] == props.modelValue,
    );
    // console.log(res,'测试弹窗值')
    if (res) {
      return res[props.labelKey];
    } else {
      return props.modelValue;
    }
  }
};
</script>
