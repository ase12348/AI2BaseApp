<template>
  <jcode-tree-picker
    v-if="!companyId"
    :options="options"
    :loadData="loadDepartment"
    :placeholder="$t(placeholder)"
    :getShowText="getShowText"
    :disabled="disabled"
    @change="handleChange"
    v-model="myValue"
    isTreeData
  >
  </jcode-tree-picker>
  <jcode-tree-picker
    v-else
    :options="options"
    :loadData="loadDepartment"
    :placeholder="$t(placeholder)"
    :getShowText="getShowText"
    :disabled="disabled"
    @change="handleChange"
    v-model="myValue"
    isTreeData
  >
  </jcode-tree-picker>
</template>

<script setup>
import { $t, GET_DATA, TOTREE } from '@/utils/index';
import { FETCH_DEPARTMENTS } from '@/utils/jcodePlatform';
import { computed } from 'vue';

const props = defineProps({
  getDataSource: Function,
  disabled: Boolean,
  placeholder: String,

  modelValue: {},
  companyId: String,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-department-picker' });

const options = computed(function () {
  if (props.getDataSource) {
    let companyList = props.getDataSource({ type: 'companySelect' });
    if (props.companyId) {
      companyList = companyList.filter((t) => t.f_CompanyId == props.companyId);
    }
    return TOTREE(
      companyList.map((t) => ({ ...t, disabled: true, isLoad: false })),
      'value',
      'f_ParentId',
      'value',
      'label',
    );
  }
  return [];
});
const myValue = computed({
  set(val) {
    emit('update:modelValue', val);
  },
  get() {
    return props.modelValue;
  },
});

const loadDepartment = async function (companyId) {
  const list = await FETCH_DEPARTMENTS(companyId);
  const res = TOTREE(
    list,
    'f_DepartmentId',
    'f_ParentId',
    'f_DepartmentId',
    'f_FullName',
  );
  return res;
};
const handleChange = function (val) {
  emit('change', val);
};
const getShowText = function (value) {
  const departmentMap = GET_DATA('jcode_departments_map') || {};
  let department = departmentMap[value];

  if (department) {
    return department.label;
  } else {
    return '';
  }
};
</script>

<style></style>
