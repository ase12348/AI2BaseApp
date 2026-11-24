<template>
  <view>
    <view
      @click.stop="handleClick"
      :class="[
        'jcode-input',
        'jcode-input-border',
        { 'jcode-input-placeholder': VALIDATENULL(modelValue) },
      ]"
    >
      <view class="jcode-input__content"
        ><text>{{ label }}</text></view
      >
      <view class="jcode-input-icon-right">
        <uni-icons
          v-if="VALIDATENULL(modelValue) || !clearable"
          type="bottom"
          size="15"
          color="#c0c4cc"
        ></uni-icons>
        <view v-else-if="!disabled && clearable" @click.stop="handleClear">
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
            <view class="item" v-for="(item, index) in list1" :key="index">{{
              item.label
            }}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="item" v-for="(item, index) in list2" :key="index">{{
              item.label
            }}</view>
          </picker-view-column>
          <picker-view-column>
            <view class="item" v-for="(item, index) in list3" :key="index">{{
              item.label
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
import {
  $t,
  GET_DATA,
  HIDE_LOADING,
  LOADING,
  SET_DATA,
  VALIDATENULL,
} from '@/utils/index';
import { FETCH_AREAS } from '@/utils/jcodePlatform';
import { computed, nextTick, ref, onBeforeMount } from 'vue';

const props = defineProps({
  modelValue: [String],
  placeholder: {
    type: String,
    default: '请选择',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: Boolean,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-area-picker' });

const myValue = ref([]);
const tmpValue = ref([]);
const isOpen = ref(false);
const list1 = ref([]);
const list2 = ref([]);
const list3 = ref([]);
const value1 = ref('');
const value2 = ref('');
const value3 = ref('');

const label = computed(function () {
  if (VALIDATENULL(props.modelValue)) {
    return $t(props.placeholder || '');
  } else {
    const valueList = props.modelValue.split(',');
    const nameList = [];
    const obj1 = GET_DATA(`jcode_areas_0`).find(
      (t) => t.value == valueList[0],
    );
    if (obj1) {
      nameList.push(obj1.label);
      const obj2 = GET_DATA(`jcode_areas_${valueList[0]}`).find(
        (t) => t.value == valueList[1],
      );
      if (obj2) {
        nameList.push(obj2.label);
        const obj3 = GET_DATA(`jcode_areas_${valueList[1]}`).find(
          (t) => t.value == valueList[2],
        );
        if (obj3) {
          nameList.push(obj3.label);
        }
      }
    }
    return nameList.join(',');
  }
});

const popup = ref(null);

const handleClear = function () {
  if (props.disabled) {
    return;
  }
  emit('update:modelValue', '');
  emit('change', undefined);
};
const handleClick = function () {
  if (props.disabled) {
    return;
  }
  if (VALIDATENULL(props.modelValue)) {
    myValue.value = [0, 0, 0];

    list2.value = GET_DATA(`jcode_areas_${list1.value[0].value}`);
    list3.value = GET_DATA(`jcode_areas_${list2.value[0].value}`);

    value1.value = list1.value[0].value;
    value2.value = list2.value[0].value;
    value3.value = list3.value[0].value;
  } else {
    myValue.value = [];
    const valueList = props.modelValue.split(',');

    value1.value = valueList[0];
    value2.value = valueList[1];
    value3.value = valueList[2];

    list2.value = GET_DATA(`jcode_areas_${value1.value}`);
    list3.value = GET_DATA(`jcode_areas_${value2.value}`);

    myValue.value.push(list1.value.findIndex((t) => t.value == valueList[0]));
    myValue.value.push(list2.value.findIndex((t) => t.value == valueList[1]));
    myValue.value.push(list3.value.findIndex((t) => t.value == valueList[2]));
  }

  tmpValue.value = myValue.value;
  popup.value.open();
  isOpen.value = true;
};
const close = function () {
  popup.value.close();
  isOpen.value = false;
};
const bindChange = async function (e) {
  tmpValue.value = e.detail.value;

  const value1__local = list1.value[tmpValue.value[0]].value;
  const value2__local2 = list2.value[tmpValue.value[1]].value;
  const value3__local3 = list3.value[tmpValue.value[2]].value;

  if (value1__local != value1.value) {
    list2.value = await loadData(value1__local);
    value1.value = value1__local;

    value2.value = list2.value[0].value;
    list3.value = await loadData(value2.value);

    value3.value = list3.value[0].value;

    tmpValue.value[1] = 0;
    tmpValue.value[2] = 0;

    isOpen.value = false;
  } else if (value2__local2 != value2.value) {
    list3.value = await loadData(value2__local2);
    value2.value = value2__local2;

    value3.value = list3.value[0].value;
    tmpValue.value[2] = 0;

    isOpen.value = false;
  } else {
    value3.value = value3__local3;
  }

  nextTick(() => {
    myValue.value = tmpValue.value;
    isOpen.value = true;
  });
};
const confirm = function () {
  const value = `${value1.value},${value2.value},${value3.value}`;

  emit('update:modelValue', value);

  const obj1 = list1.value.find((t) => t.value == value1.value);
  const obj2 = list2.value.find((t) => t.value == value2.value);
  const obj3 = list3.value.find((t) => t.value == value3.value);

  emit('change', [obj1, obj2, obj3]);

  close();
};
const loadData = async function (pid) {
  let list = GET_DATA(`jcode_areas_${pid}`);
  if (!list) {
    LOADING('加载数据中…');
    list = (await FETCH_AREAS(pid)).map((t) => ({
      value: t.f_AreaCode,
      label: t.f_AreaName,
    }));
    SET_DATA(`jcode_areas_${pid}`, list);
    HIDE_LOADING();
  }
  return list;
};

onBeforeMount(() => {
  list1.value = GET_DATA('jcode_areas_0');
});
defineExpose({ close });
</script>
