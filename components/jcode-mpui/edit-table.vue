<template>
  <view
    v-if="columns && columns.filter((t) => t.display !== false).length > 0"
    class="jcode-edit-table"
  >
    <view v-if="title" class="jcode-edit-table__title">
      <text>{{ $t(title) }}</text>
    </view>
    <view class="jcode-edit-table__body">
      <jcode-edit-table-item
        v-for="(row, index) in childTableData"
        :key="index"
        :num="index + 1"
        :rowData="row"
        :columns="columns"
        :getDataSource="getDataSource"
        :formId="formId"
        :tableId="tableId"
        :editMode="editMode"
        @deleteRow="deleteRow(index, row)"
        @change="handleChange"
        :hasRemoveBtn="hasRemoveBtn"
        ref="tableTtem"
      />
    </view>
    <view v-if="hasAdd" class="jcode-edit-table__add" @click="handleAdd">
      <text>{{ $t(addBtnText) || $t('新增一行') }}</text>
    </view>
  </view>
</template>

<script setup>
import { $t, TOAST } from '@/utils/index';
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
  columns: {
    type: Array,
    default: () => [],
  },
  addBtnText: {
    type: String,
    default: '新增一行', //新增一行
  },

  hasAddBtn: {
    type: Boolean,
    default: true,
  },
  hasRemoveBtn: {
    type: Boolean,
    default: true,
  },

  getDataSource: Function,
  formData: {},
  tableId: String,
  formId: String,
  required: Boolean,
});
const emit = defineEmits(['addRow', 'deleteRow', 'rowChange']);
defineOptions({ name: 'jcode-edit-table' });

const myData = ref({});

const hasAdd = computed(function () {
  return props.editMode && props.hasAddBtn;
});
const childTableData = computed(function () {
  const res = props.modelValue || [];
  return res.filter((item) => item.jcode_table_flag !== 'delete');
});

const tableTtem = ref(null);

const handleAdd = function () {
  emit('addRow');
};
const deleteRow = function (index, row) {
  emit('deleteRow', { index: index, row: row });
};
const handleChange = function ($event) {
  emit('rowChange', $event);
};
const validate = async function () {
  if (props.required) {
    if (props.modelValue.length == 0) {
      TOAST(`${props.title || $t('表格')}${$t('需要添加数据')}！`);
      return false;
    }
  }
  if (tableTtem.value) {
    for (let i = 0, len = tableTtem.value.length; i < len; i++) {
      const res = await tableTtem.value[i].validate();
      if (!res) {
        return false;
      }
    }
  }
  return true;
};

onBeforeMount(() => {
  //console.log(this.columns,'columns')
});
defineExpose({ validate });
</script>
<style lang="scss" scoped>
.jcode-edit-table {
  &__title {
    font-size: 13px;
    color: #666666;
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;
  }

  &__add {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 40px;
    color: $uni-primary;

    border-bottom: 1px solid $uni-border-1;
  }

  margin-bottom: 16px;
}
</style>
