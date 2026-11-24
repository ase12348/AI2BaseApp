<template>
  <uni-popup style="z-index: 999999999" ref="popup" type="bottom">
    <view class="jcode-picker-popup">
      <view class="jcode-popup-button-close" @click.stop="close">
        <jcode-icon
          type="jcode-icon-error"
          :size="14"
          color="#737987"
        ></jcode-icon>
      </view>

      <uni-search-bar
        v-model="keyword"
        @confirm="searchData"
        @cancel="cancelSearch"
        @clear="cancelSearch"
      />

      <picker-view
        v-if="isopen"
        :value="myValue"
        @change="bindChange"
        class="picker-view"
      >
        <picker-view-column>
          <view class="item" v-for="(item, index) in myOptions" :key="index">{{
            item[labelKey]
          }}</view>
        </picker-view-column>
      </picker-view>

      <view class="jcode-popup-button-wraper">
        <view class="jcode-popup-button-ok" @click="confirm">{{ $t('确认') }}</view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { $t, VALIDATENULL } from '@/utils/index';
import { computed, ref } from 'vue';

const props = defineProps({
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
});
const emit = defineEmits(['change']);
defineOptions({ name: 'jcode-picker-popup' });

const myValue = ref([0]);
const tmpValue = ref(0);
const isopen = ref(false);
const keyword = ref('');
const wordLower = ref('');
const isAZ = ref(false);

const myOptions = computed(function () {
  return props.options.filter((item) => {
    if (isAZ.value) {
      let itemLabel = item[props.labelKey].replace(/[A-Z]/g, (word) => {
        return word.toLowerCase();
      });
      return itemLabel.includes(wordLower.value);
    } else {
      return item[props.labelKey].includes(keyword.value);
    }
  });
});

const popup = ref(null);

const open = function (value) {
  if (!VALIDATENULL(value)) {
    const index = props.options.findIndex((t) => t[props.valueKey] == value);
    myValue.value[0] = index;
  } else {
    myValue.value[0] = 0;
  }
  tmpValue.value = myValue.value[0];

  popup.value.open();
  isopen.value = true;
};
const close = function () {
  isopen.value = false;
  cancelSearch();
  popup.value.close();
};
const bindChange = function (e) {
  tmpValue.value = e.detail.value[0];
};
const confirm = function () {
  let valueItem = myOptions.value[tmpValue.value][props.valueKey];
  let index = props.options.findIndex((t) => t[props.valueKey] == valueItem);
  tmpValue.value = index;
  emit('change', {
    data: props.options[tmpValue.value],
    value: props.options[tmpValue.value][props.valueKey],
    index: tmpValue.value,
  });
  close();
};
const cancelSearch = function () {
  keyword.value = '';
  // this.myOptions = this.options
};
const searchData = function () {
  isAZ.value = false;
  let pattern = /[a-zA-Z]/;
  if (pattern.test(keyword.value)) {
    isAZ.value = true;
    wordLower.value = keyword.value.replace(/[A-Z]/g, (word) => {
      return word.toLowerCase();
    });
  }
};

defineExpose({ open, close });
</script>
