<template>
  <view>
    <view
      @click.stop="handleClick"
      class="jcode-input jcode-input-border"
      :class="{ 'jcode-input-placeholder': VALIDATENULL(modelValue) }"
    >
      <view class="jcode-input__content"
        ><text>{{ label() }}</text></view
      >
      <view
        v-if="VALIDATENULL(modelValue)"
        class="jcode-input-icon-right jcode-input-icon-right-bottom"
      >
        <uni-icons type="bottom" size="14" color="#c0c4cc"></uni-icons>
      </view>
      <view v-else-if="!disabled" class="jcode-input-icon-right">
        <view @tap.stop="handleClear">
          <uni-icons type="clear" size="14" color="#c0c4cc"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { $t, NAV_TO, ONCE, VALIDATENULL } from '@/utils/index';

const props = defineProps({
  modelValue: {
    default: null,
  },
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
  params: {
    type: Object,
    default: () => {
      return {};
    },
  },
  title: String,
  nav: String,
  validate: Function,
  getLabel: Function,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-custom-layer-picker' });

const handleClick = function () {
  if (props.disabled) {
    return;
  }

  if (!myValidate()) {
    return;
  }

  ONCE('jcode-custom-layer-picker', ({ value }) => {
    emit('update:modelValue', value);
    emit('change', value);
  });

  if (props.nav) {
    NAV_TO(
      props.nav,
      {
        value: props.modelValue,
        params: props.params,
      },
      true,
    );
  }
};
const handleClear = function () {
  emit('update:modelValue', undefined);
  emit('change', undefined);
};
const label = function () {
  if (VALIDATENULL(props.modelValue)) {
    return $t(props.placeholder);
  } else if (props.getLabel) {
    return $t(props.getLabel(props.modelValue));
  } else {
    return $t(props.modelValue);
  }
};
const myValidate = function () {
  if (props.validate) {
    return props.validate(props.params);
  } else {
    return true;
  }
};
</script>
