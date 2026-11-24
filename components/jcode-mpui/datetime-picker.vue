<template>
  <view>
    <uni-datetime-picker
      v-if="isDatetime"
      :type="type"
      v-model="myValue"
      :clear-icon="clearable"
      :disabled="disabled"
      :placeholder="$t(placeholder)"
      :start-placeholder="$t(startPlaceholder)"
      :end-placeholder="$t(endPlaceholder)"
      :key="i"
    />

    <jcode-year-month-picker
      v-else-if="type == 'monthrange'"
      :disabled="disabled"
      :startPlaceholder="$t(startPlaceholder)"
      :endPlaceholder="$t(endPlaceholder)"
      :value="myValue"
      @input="handleInput"
    />

    <picker v-else mode="date" :fields="type" :value="myValue" @change="change">
      <view
        class="jcode-input jcode-input-border"
        :class="{ 'jcode-input-placeholder': myValue == -1 }"
      >
        <view class="jcode-input__content"
          ><text>{{ $t(myValue) }}</text></view
        >
        <view class="jcode-input-icon-right">
          <uni-icons
            v-if="VALIDATENULL(myValue)"
            type="bottom"
            size="14"
            color="#c0c4cc"
          ></uni-icons>
          <view v-else @tap.stop="handleClear">
            <uni-icons type="clear" size="14" color="#c0c4cc"></uni-icons>
          </view>
        </view>
      </view>
    </picker>
  </view>
</template>

<script setup>
import { $t, DATEFORMAT, VALIDATENULL } from '@/utils/index';
import { computed, nextTick, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String],
    default: '',
  },
  type: {
    default: 'date',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  format: {
    type: String,
    default: 'yyyy-MM-dd',
  },
  disabled: Boolean,
  placeholder: String,
  startPlaceholder: {
    type: String,
    default: '开始日期',
  },
  endPlaceholder: {
    type: String,
    default: '结束日期',
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-datetime-picker' });

const i = ref(0);

const isDatetime = computed(function () {
  // uni-datetime-picker 支持的类型：date / datetime / time / daterange / datetimerange
  // 其中设计师导出的 picker 值可能是 "dateTime"（含大写 T），统一转小写判断，
  // 否则会落到原生 <picker> 分支（fields="dateTime" 非法）导致无法选择
  const t = (props.type || '').toLowerCase();
  return ['date', 'datetime', 'time', 'daterange', 'datetimerange'].includes(t);
});
const isRange = computed(function () {
  // 与 uni-datetime-picker 自身逻辑保持一致（含 dateTimerange 等）
  return (props.type || '').toLowerCase().indexOf('range') !== -1;
});
const myValue = computed({
  get() {
    if (props.type == 'monthrange') {
      return props.modelValue;
    }

    if (isRange.value) {
      if (VALIDATENULL(props.modelValue)) {
        return ['', ''];
      } else {
        return props.modelValue.split(' - ');
      }
    } else {
      if (VALIDATENULL(props.modelValue)) {
        return props.modelValue;
      } else {
        return DATEFORMAT(props.modelValue, props.format);
      }
    }
  },
  set(val) {
    nextTick(() => {
      if (isRange.value) {
        if (VALIDATENULL(val)) {
          emit('update:modelValue', undefined);
          emit('change', undefined);
        } else {
          if (VALIDATENULL(props.format)) {
            emit('update:modelValue', `${val[0]} - ${val[1]}`);
            emit('change', `${val[0]} - ${val[1]}`);
          } else {
            emit(
              'update:modelValue',
              `${DATEFORMAT(val[0], props.format)} - ${DATEFORMAT(val[1], props.format)}`,
            );
            emit(
              'change',
              `${DATEFORMAT(val[0], props.format)} - ${DATEFORMAT(val[1], props.format)}`,
            );
          }
        }
      } else {
        if (VALIDATENULL(val) || VALIDATENULL(props.format)) {
          emit('update:modelValue', val);
          emit('change', val);
        } else {
          emit('update:modelValue', DATEFORMAT(val, props.format));
          emit('change', DATEFORMAT(val, props.format));
        }
      }
      i.value++;
    });
  },
});

const change = function (e) {
  myValue.value = e.target.value;
};
const handleInput = function (e) {
  emit('update:modelValue', e);
  emit('change', e);
};
const handleClear = function () {
  myValue.value = '';
};
</script>
