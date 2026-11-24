<template>
  <view>
    <view
      @click.stop="handleClick"
      :class="[
        'jcode-input',
        'jcode-input-border',
        { 'jcode-input-placeholder': myValue == -1 },
      ]"
    >
      <view class="jcode-input__content"
        ><text>{{ $t(label) }}</text></view
      >

      <view
        v-if="myValue == -1"
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
    <jcode-picker-popup :options="myOptions" @change="change" ref="myPopup">
    </jcode-picker-popup>
  </view>
</template>

<script setup>
import { $t, VALIDATENULL } from '@/utils/index';
import { computed, ref } from 'vue';

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
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-picker' });

const myValue = computed({
  get() {
    if (VALIDATENULL(props.modelValue)) {
      return -1;
    }
    return myOptions.value.findIndex((t) => t.value == props.modelValue);
  },
  set(val) {
    if (val == -1) {
      emit('update:modelValue', '');
      emit('change', undefined);
    } else {
      emit('update:modelValue', myOptions.value[val].value);
      emit('change', props.options[val]);
    }
  },
});
const myOptions = computed(function () {
  return props.options.map((t) => ({
    value: t[props.valueKey],
    label: t[props.labelKey] || '',
  }));
});
const label = computed(function () {
  if (myValue.value == -1) {
    return props.placeholder || '';
  } else {
    return myOptions.value[myValue.value].label || '';
  }
});

const myPopup = ref(null);

const change = function ({ index }) {
  myValue.value = index;
};
const handleClear = function () {
  if (props.disabled) {
    return;
  }
  myValue.value = -1;
};
const handleClick = function () {
  if (props.disabled) {
    return;
  }
  myPopup.value.open(
    myValue.value != -1 ? myOptions.value[myValue.value].value : undefined,
  );
};
</script>
