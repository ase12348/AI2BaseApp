<template>
  <view>
    <view
      @click.stop="handleClick"
      class="jcode-input jcode-input-border"
      :class="{ 'jcode-input-placeholder': !hasValue }"
    >
      <view class="jcode-input__content"
        ><text>{{ label }}</text></view
      >
      <view class="jcode-input-icon-right">
        <uni-icons
          v-if="!hasValue"
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
        <view class="jcode-popup-button-close" @click.stop="close">
          <jcode-icon
            type="jcode-icon-error"
            :size="14"
            color="#737987"
          ></jcode-icon>
        </view>

        <picker-view
          v-if="isOpen"
          :value="myValue"
          @change="bindChange"
          class="picker-view"
        >
          <picker-view-column>
            <view class="item" v-for="(item, index) in years" :key="index">{{
              item
            }}</view>
          </picker-view-column>
          <picker-view-column v-if="isMonth">
            <view class="item" v-for="(item, index) in months" :key="index">{{
              item
            }}</view>
          </picker-view-column>

          <picker-view-column>
            <view style="text-align: center">-</view>
          </picker-view-column>

          <picker-view-column>
            <view class="item" v-for="(item, index) in years" :key="index">{{
              item
            }}</view>
          </picker-view-column>
          <picker-view-column v-if="isMonth">
            <view class="item" v-for="(item, index) in months" :key="index">{{
              item
            }}</view>
          </picker-view-column>
        </picker-view>

        <view class="jcode-popup-button-wraper">
          <view class="jcode-popup-button-ok" @click="confirm">{{
            $t('确认')
          }}</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { $t, DATEFORMAT, DATENOW, VALIDATENULL } from '@/utils/index';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String],
    default: '',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  format: {
    type: String,
    default: 'yyyy-MM',
  },
  disabled: Boolean,
  startPlaceholder: {
    type: String,
    default: '开始日期',
  },
  endPlaceholder: {
    type: String,
    default: '结束日期',
  },
  isMonth: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-year-month-picker' });

const myValue = ref([]);
const tmpValue = ref([]);
const isOpen = ref(false);

const years = computed(function () {
  const year = parseInt(DATENOW('YYYY')) - 50;
  const res = [];

  for (let i = 0; i < 70; i++) {
    res.push(year + i + '年');
  }
  return res;
});
const months = computed(function () {
  return [
    '01月',
    '02月',
    '03月',
    '04月',
    '05月',
    '06月',
    '07月',
    '08月',
    '09月',
    '10月',
    '11月',
    '12月',
  ];
});
const label = computed(function () {
  if (hasValue.value) {
    return props.modelValue;
  }
  return `${$t(props.startPlaceholder)} - ${$t(props.endPlaceholder)}`;
});
const hasValue = computed(function () {
  if (!VALIDATENULL(props.modelValue)) {
    return true;
  }
  return false;
});

const popup = ref(null);

const handleClick = function () {
  if (props.disabled) {
    return;
  }

  myValue.value = [];

  if (!VALIDATENULL(props.modelValue)) {
    const valueList = props.modelValue.split(' - ');
    myValue.value.push(...getFormatValue(valueList[0]));
    myValue.value.push(0);
    myValue.value.push(...getFormatValue(valueList[1]));
  } else {
    myValue.value.push(50);
    if (props.isMonth) {
      myValue.value.push(0);
    }
    myValue.value.push(0);
    myValue.value.push(50);
    if (props.isMonth) {
      myValue.value.push(0);
    }
  }

  tmpValue.value = myValue.value;
  popup.value.open();
  isOpen.value = true;
};
const getFormatValue = function (v) {
  const formatValue = DATEFORMAT(v, 'YYYY:MM', props.format);
  const formatValueList = formatValue.split(':');

  const yearIndex = years.value.findIndex(
    (t) => t == formatValueList[0] + '年',
  );
  const monthIndex = months.value.findIndex(
    (t) => t == formatValueList[1] + '月',
  );

  const res = [];
  res.push(yearIndex);

  if (props.isMonth) {
    res.push(monthIndex);
  }

  return res;
};
const bindChange = function (e) {
  tmpValue.value = e.detail.value;
};
const close = function () {
  popup.value.close();
  isOpen.value = false;
};
const confirm = function () {
  let startValue = '';
  let endValue = '';
  if (props.isMonth) {
    startValue += years.value[tmpValue.value[0]].replace('年', '');
    startValue += ':';
    startValue += months.value[tmpValue.value[1]].replace('月', '');
    startValue = DATEFORMAT(startValue, props.format, 'YYYY:MM');

    endValue += years.value[tmpValue.value[3]].replace('年', '');
    endValue += ':';
    endValue += months.value[tmpValue.value[4]].replace('月', '');
    endValue = DATEFORMAT(endValue, props.format, 'YYYY:MM');
  } else {
    startValue += years.value[tmpValue.value[0]].replace('年', '');
    startValue = DATEFORMAT(startValue, props.format, 'YYYY');

    endValue += years.value[tmpValue.value[2]].replace('年', '');
    endValue = DATEFORMAT(endValue, props.format, 'YYYY');
  }

  const res = `${startValue} - ${endValue}`;

  console.log(res);

  emit('update:modelValue', res);
  emit('change', res);

  popup.value.close();
  isOpen.value = false;
};
const handleClear = function () {
  if (props.disabled) {
    return;
  }
  emit('update:modelValue', '');
  emit('change', '');
};

defineExpose({ close });
</script>
