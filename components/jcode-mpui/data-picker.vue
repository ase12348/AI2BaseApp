<template>
  <view>
    <uni-data-picker
      v-slot:default="{ data, error, options }"
      :popup-title="$t('请选择所在地区')"
      :readonly="disabled"
      :localdata="myOptions"
      v-model="value2"
      @nodeclick="handleNodeClick"
      @popupclosed="handlePopupclosed"
      ref="picker"
      :map="{ text: 'label', value: 'value' }"
    >
      <view class="input-value input-value-border">
        <view v-if="error" class="error">
          <text>{{ error }}</text>
        </view>
        <scroll-view
          v-else-if="data.length"
          class="selected-area"
          scroll-x="true"
        >
          <view class="selected-list">
            <view v-if="showFormat == 'mostChild'" class="selected-item">{{
              data[data.length - 1].text
            }}</view>
            <template v-else>
              <view
                class="selected-item"
                v-for="(item, index) in data"
                :key="index"
              >
                <text v-if="index === data.length - 1">{{ item.text }}</text>
                <text v-else>{{ item.text }}{{ separator }}</text>
              </view>
            </template>
          </view>
        </scroll-view>
        <view v-else>
          <text class="placeholder">{{ $t(placeholder) || $t('请选择') }}</text>
        </view>
      </view>
    </uni-data-picker>
  </view>
</template>

<script setup>
import { $t, TOTREE, VALIDATENULL } from '@/utils/index';
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
  showFormat: {
    type: String,
    default: 'all', // all, mostChild
  },
  separator: {
    type: String,
    default: '/',
  },
  changeOnSelect: {
    type: String,
    default: 'mostChild', // mostChild, any
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-data-picker' });

const currentValue = ref('');

const myOptions = computed(function () {
  if (props.isTreeData) {
    return props.options || [];
  } else {
    return TOTREE(
      props.options,
      props.idKey,
      props.pIdKey,
      props.valueKey,
      props.labelKey,
    );
  }
});
const valDic = computed(function () {
  const options2 = props.isTreeData
    ? props.options
    : TOTREE(
        props.options,
        props.idKey,
        props.pIdKey,
        props.valueKey,
        props.labelKey,
      );
  let dic = {};
  getOptionsDic(options2, dic);
  return dic;
});
const value2 = computed({
  get() {
    if (!VALIDATENULL(props.modelValue)) {
      const valueArr = props.modelValue.split(',');
      return valueArr[valueArr.length - 1];
    }
    return props.modelValue;
  },
  set(val) {
    const vals = valDic.value[val];
    emit('update:modelValue', vals);
    emit('change', {
      data: props.options.find((item) => item[props.valueKey] == val),
      value: vals,
    });
  },
});

const handleNodeClick = function (data) {
  if (props.changeOnSelect == 'any') {
    currentValue.value = data[props.valueKey];
  }
};
const handlePopupclosed = function () {
  if (props.changeOnSelect == 'any') {
    value2.value = currentValue.value;
  }
};
const getOptionsDic = function (options, dic, parentPath = []) {
  options.forEach((item) => {
    const currentPath = [...parentPath, item[props.valueKey]];
    dic[item[props.valueKey]] = currentPath.join(',');
    if (item.children) {
      getOptionsDic(item.children, dic, currentPath);
    }
  });
};
</script>

<style lang="scss" scoped>
.input-value {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  font-size: 14px;
  /* line-height: 35px; */
  padding: 0 10px;
  padding-right: 5px;
  overflow: hidden;
  height: 35px;
  /* #ifndef APP-NVUE */
  box-sizing: border-box;
  /* #endif */
}

.input-value-border {
  border: 1px solid #e5e5e5;
  border-radius: 5px;
}
.selected-area {
  flex: 1;
  overflow: hidden;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
}
.selected-list {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  flex-wrap: nowrap;
  /* padding: 0 5px; */
}

.selected-item {
  flex-direction: row;
  /* padding: 0 1px; */
  /* #ifndef APP-NVUE */
  white-space: nowrap;
  /* #endif */
}
.placeholder {
  color: grey;
  font-size: 12px;
}
</style>
