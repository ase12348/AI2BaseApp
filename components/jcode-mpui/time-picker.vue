<template>
  <view>
    <view
      @click.stop="handleClick"
      class="jcode-input jcode-input-border"
      :class="{ 'jcode-input-placeholder': !hasValue }"
    >
      <view class="jcode-input__content"
        ><text>{{ $t(label) }}</text></view
      >
      <view
        v-if="!hasValue"
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

    <uni-popup ref="popup" type="bottom">
      <view class="jcode-picker-popup">
        <view class="jcode-popup-button-close" @click.stop="close">
          <jcode-icon
            type="jcode-icon-error"
            :size="14"
            color="#737987"
          ></jcode-icon>
        </view>

        <picker-view :value="myValue" @change="bindChange" class="picker-view">
          <picker-view-column v-if="isHours">
            <view class="item" v-for="(item, index) in hours" :key="index">{{
              item
            }}</view>
          </picker-view-column>
          <picker-view-column v-if="isMinutes">
            <view class="item" v-for="(item, index) in minutes" :key="index">{{
              item
            }}</view>
          </picker-view-column>
          <picker-view-column v-if="isSecond">
            <view class="item" v-for="(item, index) in seconds" :key="index">{{
              item
            }}</view>
          </picker-view-column>

          <picker-view-column v-if="isRange">
            <view style="text-align: center">-</view>
          </picker-view-column>

          <picker-view-column v-if="isRange && isHours">
            <view class="item" v-for="(item, index) in endHours" :key="index">{{
              item
            }}</view>
          </picker-view-column>
          <picker-view-column v-if="isRange && isMinutes">
            <view
              class="item"
              v-for="(item, index) in endMinutes"
              :key="index"
              >{{ item }}</view
            >
          </picker-view-column>
          <picker-view-column v-if="isRange && isSecond">
            <view
              class="item"
              v-for="(item, index) in endSeconds"
              :key="index"
              >{{ item }}</view
            >
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
import { $t, DATEFORMAT, VALIDATENULL } from '@/utils/index';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: String,
  isRange: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  startPlaceholder: {
    type: String,
    default: '开始时间',
  },
  endPlaceholder: {
    type: String,
    default: '结束时间',
  },
  format: {
    type: String,
    default: 'HH:mm:ss',
  },
  selectableRange: String,
  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-time-picker' });

const myValue = ref([]);
const tmpValue = ref([]);
const hValue = ref(0);
const mValue = ref(0);
const sValue = ref(0);
const endHValue = ref(0);
const endMValue = ref(0);
const endSValue = ref(0);

const seconds = computed(function () {
  const seconds__local = [];

  let min = 0;
  let max = 59;
  if (!VALIDATENULL(props.selectableRange)) {
    if (
      (!isHours.value ||
        hours.value[hValue.value] == selectableRangeList.value[0]) &&
      (!isMinutes.value ||
        minutes.value[mValue.value] == selectableRangeList.value[1])
    ) {
      min = parseInt(selectableRangeList.value[2]);
    }

    if (
      (!isHours.value ||
        hours.value[hValue.value] == selectableRangeList.value[3]) &&
      (!isMinutes.value ||
        minutes.value[mValue.value] == selectableRangeList.value[4])
    ) {
      max = parseInt(selectableRangeList.value[5]);
    }
  }

  for (let i = min; i <= max; i++) {
    if (i < 10) {
      i = '0' + i;
    } else {
      i = '' + i;
    }
    seconds__local.push(i);
  }
  return seconds__local;
});
const minutes = computed(function () {
  const minutes__local2 = [];
  let min = 0;
  let max = 59;
  if (!VALIDATENULL(props.selectableRange)) {
    if (
      !isHours.value ||
      hours.value[hValue.value] == selectableRangeList.value[0]
    ) {
      min = parseInt(selectableRangeList.value[1]);
    }

    if (
      !isHours.value ||
      hours.value[hValue.value] == selectableRangeList.value[3]
    ) {
      max = parseInt(selectableRangeList.value[4]);
    }
  }

  for (let i = min; i <= max; i++) {
    if (i < 10) {
      i = '0' + i;
    } else {
      i = '' + i;
    }
    minutes__local2.push(i);
  }
  return minutes__local2;
});
const hours = computed(function () {
  const hours__local3 = [];
  let min = 0;
  let max = 23;

  if (!VALIDATENULL(props.selectableRange)) {
    min = parseInt(selectableRangeList.value[0]);
    max = parseInt(selectableRangeList.value[3]);
  }

  for (let i = min; i <= max; i++) {
    if (i < 10) {
      i = '0' + i;
    } else {
      i = '' + i;
    }
    hours__local3.push(i);
  }
  return hours__local3;
});
const endSeconds = computed(function () {
  const seconds__local4 = [];

  let min = 0;
  if (
    (!isHours.value ||
      hours.value[hValue.value] == endHours.value[endHValue.value]) &&
    (!isMinutes.value ||
      minutes.value[mValue.value] == endMinutes.value[endMValue.value])
  ) {
    min = sValue.value;
  }

  let max = 59;
  if (!VALIDATENULL(props.selectableRange)) {
    if (
      (!isHours.value ||
        hours.value[endHValue.value] == selectableRangeList.value[3]) &&
      (!isMinutes.value ||
        minutes.value[endMValue.value] == selectableRangeList.value[4])
    ) {
      max = parseInt(selectableRangeList.value[5]);
    }
  }

  for (let i = min; i <= max; i++) {
    if (i < 10) {
      i = '0' + i;
    } else {
      i = '' + i;
    }
    seconds__local4.push(i);
  }
  return seconds__local4;
});
const endMinutes = computed(function () {
  const minutes__local5 = [];

  let min = 0;
  if (
    !isHours.value ||
    hours.value[hValue.value] == endHours.value[endHValue.value]
  ) {
    min = mValue.value;
  }

  let max = 59;
  if (!VALIDATENULL(props.selectableRange)) {
    if (
      !isHours.value ||
      hours.value[endHValue.value] == selectableRangeList.value[3]
    ) {
      max = parseInt(selectableRangeList.value[4]);
    }
  }

  //console.log(min,'min')

  for (let i = min; i <= max; i++) {
    if (i < 10) {
      i = '0' + i;
    } else {
      i = '' + i;
    }
    minutes__local5.push(i);
  }
  return minutes__local5;
});
const endHours = computed(function () {
  const hours__local6 = [];
  let min = hValue.value;

  let max = 23;
  if (!VALIDATENULL(props.selectableRange)) {
    max = parseInt(selectableRangeList.value[3]);
  }

  for (let i = min; i <= max; i++) {
    if (i < 10) {
      i = '0' + i;
    } else {
      i = '' + i;
    }
    hours__local6.push(i);
  }
  return hours__local6;
});
const isHours = computed(function () {
  if (props.format.indexOf('HH') != -1) {
    return true;
  } else {
    return false;
  }
});
const isMinutes = computed(function () {
  if (props.format.indexOf('mm') != -1) {
    return true;
  } else {
    return false;
  }
});
const isSecond = computed(function () {
  if (props.format.indexOf('ss') != -1) {
    return true;
  } else {
    return false;
  }
});
const selectableRangeList = computed(function () {
  if (VALIDATENULL(props.selectableRange)) {
    return [];
  }

  const list = props.selectableRange.split(' - ');
  const res = [];
  const vList1 = list[0].split(':');
  const vList2 = list[1].split(':');
  res.push(...vList1);
  res.push(...vList2);

  return res;
});
const minHours = computed(function () {
  if (VALIDATENULL(props.selectableRange)) {
    return 0;
  } else {
    return parseInt(selectableRangeList.value[0]);
  }
});
const maxHours = computed(function () {
  if (VALIDATENULL(props.selectableRange)) {
    return 23;
  } else {
    return parseInt(selectableRangeList.value[3]);
  }
});
const label = computed(function () {
  if (hasValue.value) {
    return props.modelValue;
  }

  if (props.isRange) {
    return `${$t(props.startPlaceholder)} - ${$t(props.endPlaceholder)}`;
  } else {
    return $t(props.placeholder);
  }
});
const hasValue = computed(function () {
  if (!VALIDATENULL(props.modelValue)) {
    return true;
  }
  return false;
});

const popup = ref(null);

const handleClear = function () {
  if (props.disabled) {
    return;
  }
  emit('update:modelValue', '');
  emit('change', '');
};
const setFormatValue = function (v, list, isEnd) {
  console.log(v, list, isEnd, props.format);
  const formatValue = DATEFORMAT(v, 'HH:mm:ss', props.format);
  console.log(formatValue, 'formatValue');
  const formatValueList = formatValue.split(':');
  if (isHours.value) {
    let hourIndex = 0;
    if (isEnd) {
      hourIndex = endHours.value.findIndex((t) => t == formatValueList[0]);
    } else {
      hourIndex = hours.value.findIndex((t) => t == formatValueList[0]);
    }

    if (hourIndex == -1) {
      hourIndex = 0;
    }
    list.push(hourIndex);
  }

  if (isMinutes.value) {
    let minuteIndex = 0;

    if (isEnd) {
      minuteIndex = endMinutes.value.findIndex((t) => t == formatValueList[1]);
    } else {
      minuteIndex = minutes.value.findIndex((t) => t == formatValueList[1]);
    }

    if (minuteIndex == -1) {
      minuteIndex = 0;
    }
    list.push(minuteIndex);
  }

  if (isSecond.value) {
    let secondIndex = 0;
    if (isEnd) {
      secondIndex = endSeconds.value.findIndex((t) => t == formatValueList[2]);
    } else {
      secondIndex = seconds.value.findIndex((t) => t == formatValueList[2]);
    }

    if (secondIndex == -1) {
      secondIndex = 0;
    }
    list.push(secondIndex);
  }
};
const setValue = function () {
  if (isHours.value && isMinutes.value && isSecond.value) {
    hValue.value = tmpValue.value[0];
    mValue.value = tmpValue.value[1];
    sValue.value = tmpValue.value[2];

    if (props.isRange) {
      endHValue.value = tmpValue.value[4];
      endMValue.value = tmpValue.value[5];
      endSValue.value = tmpValue.value[6];
    }
  } else if (!isHours.value && isMinutes.value && isSecond.value) {
    mValue.value = tmpValue.value[0];
    sValue.value = tmpValue.value[1];

    if (props.isRange) {
      endMValue.value = tmpValue.value[3];
      endSValue.value = tmpValue.value[4];
    }
  } else if (!isHours.value && !isMinutes.value && isSecond.value) {
    sValue.value = tmpValue.value[0];

    if (props.isRange) {
      endSValue.value = tmpValue.value[2];
    }
  } else if (isHours.value && !isMinutes.value && !isSecond.value) {
    hValue.value = tmpValue.value[0];

    if (props.isRange) {
      endHValue.value = tmpValue.value[2];
    }
  } else if (isHours.value && isMinutes.value && !isSecond.value) {
    hValue.value = tmpValue.value[0];
    mValue.value = tmpValue.value[1];

    if (props.isRange) {
      endHValue.value = tmpValue.value[3];
      endMValue.value = tmpValue.value[4];
    }
  } else if (!isHours.value && isMinutes.value && !isSecond.value) {
    mValue.value = tmpValue.value[0];

    if (props.isRange) {
      endMValue.value = tmpValue.value[2];
    }
  } else if (isHours.value && !isMinutes.value && isSecond.value) {
    hValue.value = tmpValue.value[0];
    sValue.value = tmpValue.value[1];

    if (props.isRange) {
      endHValue.value = tmpValue.value[3];
      endSValue.value = tmpValue.value[4];
    }
  }
};
const handleClick = function () {
  if (props.disabled) {
    return;
  }

  myValue.value = [];

  if (!VALIDATENULL(props.modelValue)) {
    if (props.isRange) {
      const valueList = props.modelValue.split(' - ');
      setFormatValue(valueList[0], myValue.value);
      myValue.value.push(0);
      setFormatValue(valueList[1], myValue.value, true);
    } else {
      setFormatValue(props.modelValue, myValue.value);
    }
  } else {
    if (isHours.value) {
      myValue.value.push(0);
    }

    if (isMinutes.value) {
      myValue.value.push(0);
    }

    if (isSecond.value) {
      myValue.value.push(0);
    }

    if (props.isRange) {
      myValue.value.push(0);
      if (isHours.value) {
        myValue.value.push(0);
      }

      if (isMinutes.value) {
        myValue.value.push(0);
      }

      if (isSecond.value) {
        myValue.value.push(0);
      }
    }
  }

  tmpValue.value = myValue.value;
  setValue();
  popup.value.open();
};
const close = function () {
  popup.value.close();
};
const bindChange = function (e) {
  tmpValue.value = e.detail.value;
  setValue();
};
const confirm = function () {
  let res = '';
  if (props.isRange) {
    let startValue = '';
    let endValue = '';
    startValue += hours.value[hValue.value] + ':';
    startValue += minutes.value[mValue.value] + ':';
    startValue += seconds.value[sValue.value];
    startValue = DATEFORMAT(`2022-02-21 ${startValue}`, props.format);
    endValue += endHours.value[endHValue.value] + ':';
    endValue += endMinutes.value[endMValue.value] + ':';
    endValue += endSeconds.value[endSValue.value];
    endValue = DATEFORMAT(`2022-02-21 ${endValue}`, props.format);

    res = `${startValue} - ${endValue}`;
  } else {
    res += hours.value[hValue.value] + ':';
    res += minutes.value[mValue.value] + ':';
    res += seconds.value[sValue.value];

    res = DATEFORMAT(`2022-02-21 ${res}`, props.format);
  }

  emit('update:modelValue', res);
  emit('change', res);

  popup.value.close();
};

defineExpose({ close });
</script>
