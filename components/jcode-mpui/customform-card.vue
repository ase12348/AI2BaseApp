<template>
  <view style="margin-bottom: 8px">
    <uni-group :title="component.config.label" mode="card" top="0">
      <view v-for="col in component.children" :key="col.id">
        <jcode-divider v-if="col.type == 'divider'" :text="col.config.html" />
        <button
          style="margin-bottom: 8px"
          :style="col.config.style"
          v-else-if="col.type == 'btn'"
          :disabled="col.config.disabled"
          :type="col.config.danger ? 'warn' : col.config.type"
          @click="handleBtnClick(col)"
        >
          <jcode-icon
            :type="col.config.iconName"
            :size="16"
            :isBlock="false"
            style="margin-right: 2px"
            v-if="col.config.iconName"
            :color="col.config.type == 'default' ? '' : '#fff'"
          />
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
    </uni-group>
  </view>
</template>

<script setup>
import get from 'lodash/get';
import { $t, GET_DATA } from '@/utils/index';
import { ref } from 'vue';

const props = defineProps({
  formId: String,
  component: {},
  getDataSource: Function,
  editMode: { default: true },
});
const emit = defineEmits([
  'addRow',
  'btnClick',
  'change',
  'deleteRow',
  'rowChange',
  'update:modelValue',
]);
defineOptions({ name: 'jcode-customform-card' });

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
