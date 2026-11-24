<template>
  <view class="jcode-collapse-item" ref="jcode-collapse-item">
    <view class="jcode-collapse-item__title" @click.stop="handleClickTitle">
      <view>
        <uni-icons
          class="lefticon"
          :type="isOpen ? 'bottom' : 'right'"
          size="14"
          color="#c0c4cc"
        ></uni-icons>
        <text>{{ $t(myRowData.label) }}</text>
      </view>
    </view>
    <view class="jcode-collapse-item__content" v-show="isOpen">
      <view v-for="col in myRowData.children" :key="col.id">
        <jcode-divider v-if="col.type == 'divider'" :text="col.html" />
        <button
          style="margin-bottom: 8px"
          v-else-if="col.type == 'btn'"
          :disabled="col.config.disabled"
          :type="col.config.myType"
          @click="handleBtnClick(component)"
        >
          {{ $t(col.config.label) }}
        </button>
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
        <view class="jcode-collapse" v-else-if="col.type == 'collapse'">
          <view v-if="col.config.label" class="jcode-edit-table__title">
            <text>{{ $t(col.config.label) }}</text>
          </view>
          <view class="jcode-edit-table__body">
            <jcode-collapse-item
              v-for="(row, index) in col.children"
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
});
const emit = defineEmits([
  'addRow',
  'btnClick',
  'change',
  'deleteRow',
  'rowChange',
  'update:modelValue',
]);
defineOptions({ name: 'jcode-collapse-item' });

const isOpen = ref(true);

const myRowData = computed(function () {
  return props.rowData;
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
.jcode-collapse-item {
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
