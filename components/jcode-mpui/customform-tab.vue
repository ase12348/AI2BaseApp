<template>
  <view class="jcode-customform-tab">
    <view v-if="title" class="jcode-customform-tab__title">
      <text>{{ $t(title) }}</text>
    </view>
    <scroll-view
      class="scroll-tab"
      scroll-x="true"
      scroll-left="10"
      :scroll-with-animation="true"
    >
      <block v-for="(item, index) in showTabList" :key="index">
        <view
          class="scroll-tab-item"
          :class="{ active: tabIndex == index }"
          v-if="item.display != false"
          @tap="toggleTab(index)"
        >
          {{ item.label }}
          <view class="scroll-tab-line"></view>
        </view>
      </block>
    </scroll-view>

    <view v-for="(row, index) in showTabList" :key="index">
      <jcode-customform-tab-item
        v-if="row.display != false"
        :rowData="row"
        :isOpen="index == tabIndex"
        :getDataSource="getDataSource"
        :formId="formId"
        :tableId="tableId"
        :editMode="editMode"
        @addRow="addTableRow"
        @deleteRow="deleteTableRow"
        @rowChange="rowChange"
        @update:modelValue="setValue"
        @change="handleChange"
        @btnClick="handleBtnClick"
        ref="gridtable"
      />
    </view>
  </view>
</template>

<script setup>
import get from 'lodash/get';
import { $t, GET_DATA, VALIDATENULL } from '@/utils/index';
import { computed, watch, ref, onBeforeMount } from 'vue';

const props = defineProps({
  title: String,
  editMode: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: Array,
    default: () => [],
  },

  component: {},
  getDataSource: Function,
  // formData:{},
  tableId: String,
  formId: String,
  required: Boolean,
});
const emit = defineEmits([
  'addRow',
  'btnClick',
  'change',
  'deleteRow',
  'rowChange',
  'update:modelValue',
]);
defineOptions({ name: 'jcode-customform-tab' });

const myData = ref({});
const isOpen = ref(true);
const tabIndex = ref(0);

const tabList = computed(function () {
  return props.component.children;
});
const tabContent = computed(function () {
  return tabList.value[tabIndex.value].children;
});
const formData = computed(function () {
  return GET_DATA(`jcode_form_data_${props.formId}`);
});
const showTabList = computed(function () {
  let res = tabList.value;
  if (
    VALIDATENULL(props.component.config.tabKey) ||
    VALIDATENULL(props.component.config.options)
  ) {
    return res;
  } else {
    props.component.config.options.forEach((item) => {
      if (!VALIDATENULL(item.label) && !VALIDATENULL(item.value)) {
        if (formData.value[props.component.config.tabKey] == item.value) {
          res.find((t) => t.i == item.label).display = !!item.display;
        } else {
          res.find((t) => t.i == item.label).display = !item.display;
        }
      }
    });
  }
  return res;
});

const gridtable = ref(null);

const toggleTab = function (index) {
  tabIndex.value = index;
};
const handleClickTitle = function () {
  isOpen.value = !isOpen.value;
};
const handleBtnClick = function (event) {
  emit('btnClick', event);
};
const handleChange = function (event) {
  emit('change', event);
};
const setValue = function (event) {
  emit('update:modelValue', event);
};
const getValue = function (path) {
  return get(GET_DATA(`jcode_form_data_${props.formId}`), path);
};
const rowChange = function ({ event, col }) {
  emit('rowChange', { event, col });
};
const addTableRow = function (event) {
  emit('addRow', event);
};
const deleteTableRow = function ({ event, col }) {
  emit('deleteRow', { event, col });
};
const validate = async function () {
  if (gridtable.value) {
    for (let i = 0, len = gridtable.value.length; i < len; i++) {
      const res = await gridtable.value[i].validate();
      if (!res) {
        return false;
      }
    }
  }

  return true;
};

onBeforeMount(() => {});

watch(
  () => showTabList.value,
  function (tabList__local) {
    // 如果隐藏的是当前的展示页，找到第一个显示的tab
    if (tabList__local[tabIndex.value].display == false) {
      for (let i = 0; i < tabList__local.length; i++) {
        if (tabList__local[i].display != false) {
          tabIndex.value = i;
          break;
        }
      }
    }
  },
  { immediate: true, deep: true },
);

defineExpose({ validate });
</script>
<style lang="scss" scoped>
.jcode-customform-tab {
  &__title {
    font-size: 13px;
    color: #666666;
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;
  }

  &__item {
    display: flex;
    align-items: center;

    .tab-title {
      padding: 10px;
    }

    .tab-title_active {
      color: #007aff;
      font-weight: bold;
    }
  }

  margin-bottom: 16px;
}

.scroll-tab {
  white-space: nowrap;
  margin-bottom: 10px;
  text-align: center;
}

.scroll-tab-item {
  display: inline-block;
  margin: 10px 15px 0 15px;
}

.active {
  color: #007aff;
}

.active .scroll-tab-line {
  border-bottom: 2px solid #007aff;
  height: 0;
}
</style>
