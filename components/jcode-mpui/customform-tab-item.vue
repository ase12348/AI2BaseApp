<template>
  <view class="jcode-collapse-item__content" v-show="isShow">
    <view v-for="col in myRowData" :key="col.id">
      <jcode-divider v-if="col.type == 'divider'" :text="col.config.html" />
      <button
        style="margin-bottom: 8px"
        v-else-if="col.type == 'btn'"
        :disabled="col.config.disabled"
        :type="col.config.myType"
        @click="handleBtnClick(col)"
      >
        {{ $t(col.config.label) }}
      </button>
      <view
        style="margin-bottom: 15px"
        v-else-if="col.type == 'text'"
        :style="{
          fontSize: col.config.size + 'px',
          color: col.config.color,
          textAlign: col.config.align,
          fontWeight: col.config.weight,
          fontStyle: col.config.fontStyle,
        }"
        >{{ col.config.content }}</view
      >
      <jcode-customform-card
        v-else-if="col.type == 'card'"
        :component="col"
        :getDataSource="getDataSource"
        :editMode="editMode"
        :formId="formId"
        @addRow="addTableRow"
        @deleteRow="deleteTableRow($event.event, $event.col)"
        @rowChange="rowChange($event.event, $event.col)"
        @update:modelValue="setValue"
        @change="handleChange"
        @btnClick="handleBtnClick"
        ref="gridtable"
      />
      <jcode-edit-table
        v-else-if="col.type == 'gridtable'"
        :modelValue="getValue(col.id)"
        :columns="col.children"
        :getDataSource="getDataSource"
        :title="$t(col.config.label)"
        :editMode="editMode"
        :formId="formId"
        :tableId="col.id"
        :hasAddBtn="col.config.isAddBtn"
        :addBtnText="$t(col.config.addBtnText)"
        :hasRemoveBtn="col.config.isRemoveBtn"
        :required="col.config.required"
        @addRow="addTableRow(col)"
        @deleteRow="deleteTableRow($event, col)"
        @rowChange="rowChange($event, col)"
        ref="gridtable"
      />
      <jcode-view-table
        v-else-if="col.type == 'viewTable'"
        :paramFiled="getValue(col.config.paramFiled)"
        :columns="col.config.columns"
        :code="col.config.dataCode"
        :title="$t(col.config.label)"
      />
      <jcode-collapse
        v-else-if="col.type == 'collapse'"
        :component="col"
        :formId="formId"
        :getDataSource="getDataSource"
        :title="col.config.label"
        :editMode="editMode"
        @addRow="addTableRow"
        @deleteRow="deleteTableRow($event.event, $event.col)"
        @rowChange="rowChange($event.event, $event.col)"
        @update:modelValue="setValue"
        @change="handleChange"
        @btnClick="handleBtnClick"
        ref="gridtable"
      />
      <view
        style="margin-bottom: 15px"
        v-else-if="col.type == 'label'"
        :disabled="col.config.disabled"
        :style="{
          fontSize: col.config.size + 'px',
          color: col.config.color,
          textAlign: col.config.align,
        }"
        >{{ col.config.content }}</view
      >
      <jcode-customform-item
        v-else
        :component="col"
        :getDataSource="getDataSource"
        :editMode="editMode"
        :formId="formId"
        :modelValue="getValue(col.id)"
        @update:modelValue="setValue"
        @change="handleChange"
      />
    </view>
  </view>
</template>

<script setup>
import set from 'lodash/set';
import get from 'lodash/get';
import { $t, GET_DATA } from '@/utils/index';
import { computed, ref } from 'vue';

const props = defineProps({
  num: Number,
  rowData: {},
  getDataSource: Function,
  editMode: {
    type: Boolean,
    default: true,
  },
  formId: String,
  tableId: String,
  isOpen: {},
});
const emit = defineEmits([
  'addRow',
  'btnClick',
  'change',
  'deleteRow',
  'rowChange',
  'update:modelValue',
]);
defineOptions({ name: 'jcode-customform-tab-item' });

const myRowData = computed(function () {
  return props.rowData.children;
});
const isShow = computed(function () {
  return props.isOpen;
});

const gridtable = ref(null);

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
const rowChange = function (event, col) {
  emit('rowChange', { event, col });
};
const addTableRow = function (event) {
  emit('addRow', event);
};
const deleteTableRow = function (event, col) {
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

defineExpose({ validate });
</script>

<style lang="scss" scoped>
.jcode-tab {
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
.jcode-tab-item {
  &__title {
    padding: 0 8px;
    font-size: 12px;
    color: $uni-base-color;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 32px;
    background-color: $uni-info-light;
    box-sizing: border-box;

    .lefticon {
      margin-right: 4px;
    }

    .delete-btn {
      color: $uni-error;
    }
  }

  &__content {
    padding: 16px 8px 0 8px;
    background-color: #fdfdfd;
  }
}
</style>
