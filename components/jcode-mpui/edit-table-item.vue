<template>
  <view class="jcode-edit-table-item">
    <view class="jcode-edit-table-item__title" @click.stop="handleClickTitle">
      <view>
        <uni-icons
          class="lefticon"
          :type="isOpen ? 'bottom' : 'right'"
          size="14"
          color="#c0c4cc"
        ></uni-icons>
        <text>{{ $t('第') }}{{ num }}{{ $t('行') }}</text>
      </view>
      <view v-if="hasDeleteBtn" class="delete-btn" @click.stop="handleDelete"
        ><text>{{ $t('删除') }}</text></view
      >
    </view>
    <view class="jcode-edit-table-item__content" v-show="isOpen">
      <uni-forms
        :modelValue="myRowData"
        label-position="top"
        :label-width="320"
        :rules="rules"
        ref="myForm"
      >
        <jcode-customform-item
          v-for="col in columns"
          :key="col.key"
          :modelValue="getValue(col.id)"
          @update:modelValue="setValue"
          @change="handleChange"
          :formId="formId"
          :tableId="tableId"
          :tableIndex="num - 1"
          :editMode="isEdit(col)"
          :component="col"
          :getDataSource="getDataSource"
        />
      </uni-forms>
    </view>
  </view>
</template>

<script setup>
import set from 'lodash/set';
import get from 'lodash/get';
import { $t, VALIDATEFORM } from '@/utils/index';
import { computed, ref, onBeforeMount } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  num: Number,
  rowData: {},
  getDataSource: Function,
  editMode: {
    type: Boolean,
    default: true,
  },
  hasRemoveBtn: {
    type: Boolean,
    default: true,
  },
  formId: String,
  tableId: String,
});
const emit = defineEmits(['change', 'deleteRow']);
defineOptions({ name: 'jcode-edit-table-item' });

const isOpen = ref(true);

const myRowData = computed(function () {
  return props.rowData;
});
const hasDeleteBtn = computed(function () {
  if (getValue('hasNoDeleteBtn')) {
    return false;
  } else if (props.editMode && props.hasRemoveBtn) {
    return true;
  } else {
    return false;
  }
});
const rules = computed(function () {
  const rules__local = {};
  for (let j = 0, len = props.columns.length; j < len; j++) {
    const component = props.columns[j];
    if (component.config.required) {
      rules__local[component.id] = rules__local[component.id] || { rules: [] };
      rules__local[component.id].rules.push({
        required: true,
        errorMessage: `${$t('请输入')}${component.config.label}`,
      });
    }
    if (component.config.patterns && component.config.patterns.length > 0) {
      rules__local[component.id] = rules__local[component.id] || { rules: [] };
      component.config.patterns.forEach((pattern) => {
        if (pattern.reg) {
          let reg = pattern.reg.substring(1, pattern.reg.length - 1);
          rules__local[component.id].rules.push({
            pattern: reg,
            errorMessage: pattern.msg,
          });
        }
      });
    }
  }
  return rules__local;
});

const myForm = ref(null);

const isEdit = function (col) {
  //console.log(this.rowData.disabled,this.rowData.abledList,'this.rowData.abledList')
  if (
    props.editMode &&
    (!props.rowData.disabled || getValue('abledList').indexOf(col.id) > -1)
  ) {
    return true;
  }
  return false;
};
const handleClickTitle = function () {
  isOpen.value = !isOpen.value;
};
const handleDelete = function () {
  emit('deleteRow');
};
const handleChange = function ({ data, component }) {
  emit('change', {
    index: props.num - 1,
    rowData: myRowData.value,
    data: data,
    prop: component.id,
    component: component,
  });
};
const setValue = function ({ path, value }) {
  // console.log(this.myRowData,path, value,'setValue');
  set(myRowData.value, path, value);
};
const getValue = function (path) {
  // console.log(path,'getValue');
  return get(myRowData.value, path);
};
const validate = async function () {
  const { err } = await VALIDATEFORM(myForm.value);
  if (err) {
    return false;
  }
  return true;
};

onBeforeMount(() => {
  // this.myRowData = this.COPY(this.rowData)
});
defineExpose({ validate });
</script>

<style lang="scss" scoped>
.jcode-edit-table-item {
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
