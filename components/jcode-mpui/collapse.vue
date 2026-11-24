<template>
  <view class="jcode-collapse">
    <view v-if="title" class="jcode-edit-table__title">
      <text>{{ $t(title) }}</text>
    </view>
    <view class="jcode-edit-table__body">
      <jcode-collapse-item
        v-for="(row, index) in tabList"
        :key="index"
        :num="index + 1"
        :rowData="row"
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
import { $t, GET_DATA } from '@/utils/index';
import { computed, ref, onBeforeMount } from 'vue';

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
  formData: {},
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
defineOptions({ name: 'jcode-collapse' });

const myData = ref({});
const isOpen = ref(true);

const tabList = computed(function () {
  return props.component.children;
});

const gridtable = ref(null);

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
defineExpose({ validate });
</script>
<style lang="scss" scoped>
.jcode-collapse {
  &__title {
    font-size: 13px;
    color: #666666;
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;
  }

  margin-bottom: 16px;
}
</style>
