<template>
  <view
    class="jcode-input jcode-input-border"
    @click.stop="handleClick"
    :class="{ 'jcode-input-placeholder': VALIDATENULL(modelValue) }"
  >
    <view class="jcode-input__content"
      ><text>{{ $t(text) }}</text></view
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
</template>

<script setup>
import { $t, GET_DATA, NAV_TO_LAYER, ONCE, VALIDATENULL } from '@/utils/index';
import { jcode_form_fetchOrganizeInfo } from '@/common/customform.js';
import { computed, watch, ref, onBeforeMount } from 'vue';

const props = defineProps({
  modelValue: {
    default: null,
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  isMulti: {
    type: Boolean,
    default: false,
  },
  titleText: {
    type: String,
    default: '选择参与人员',
  },
  disabled: Boolean,
  isNotSaveData: {
    type: Boolean,
    default: false,
  },
  companyId: String,
  departmentId: String,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-user-picker' });

const showText = ref('');
const isSelf = ref(false);

const text = computed(function () {
  // 单选
  if (VALIDATENULL(props.modelValue)) {
    return props.placeholder || '';
  }

  return showText.value;
});

const setText = async function () {
  if (!VALIDATENULL(props.modelValue)) {
    const userMap = GET_DATA('jcode_users_map') || {};
    if (props.isMulti) {
      const textList = [];
      const valueList = props.modelValue.split(',');
      await jcode_form_fetchOrganizeInfo([valueList], []);
      for (let value of valueList) {
        if (userMap[value]) {
          textList.push(userMap[value].label);
        } else {
          textList.push(value);
        }
      }
      showText.value = String(textList);
    } else {
      await jcode_form_fetchOrganizeInfo([props.modelValue], []);
      showText.value = userMap[props.modelValue]
        ? userMap[props.modelValue].label
        : props.modelValue;
    }
  }
};
const handleClick = function () {
  if (props.disabled) {
    return;
  }

  ONCE('select-jcode-user', (data) => {
    isSelf.value = true;
    if (props.isMulti) {
      console.log(data, 'select-jcode-user');

      const userMap = GET_DATA('jcode_users_map') || {};
      const textList = [];
      const dataList = [];
      for (let value of data.values) {
        const user =
          userMap[value] || data.data.find((t) => t.f_UserId == value);

        if (user) {
          dataList.push(user);
          textList.push(user.label || user.f_RealName);
        }
      }

      emit('update:modelValue', String(data.values));
      emit('change', dataList);

      showText.value = String(textList);
    } else {
      emit('update:modelValue', data.value);
      emit('change', data);
      showText.value = data.label;
    }
  });

  NAV_TO_LAYER('/pages/common/jcode-user-picker', {
    isMulti: props.isMulti,
    value: props.isNotSaveData ? '' : props.modelValue,
    titleText: props.titleText,
  });
};
const handleClear = function () {
  if (props.disabled) {
    return;
  }

  emit('update:modelValue', undefined);
  emit('change', undefined);
};

onBeforeMount(() => {
  // console.log('user-picker',this.modelValue)
  setText();
});

watch(
  () => props.modelValue,
  function (val) {
    if (isSelf.value) {
      isSelf.value = false;
      return;
    }
    console.log(val, 'new');
    setText();
  },
  {},
);
</script>
