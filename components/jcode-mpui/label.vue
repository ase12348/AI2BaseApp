<template>
  <uni-easyinput :value="name" disabled :clearable="false" />
</template>

<script setup>
import { FORMAT_NAME, GET_DATA, VALIDATENULL } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  modelValue: {},
  type: String,
});
defineOptions({ name: 'jcode-label' });

const name = computed(function () {
  if (VALIDATENULL(props.modelValue)) {
    return '';
  } else {
    let obj = null;
    switch (props.type) {
      case 'company':
        return FORMAT_NAME(
          GET_DATA('jcode_company_list'),
          props.modelValue,
          'f_CompanyId',
          'f_FullName',
        );
      case 'department':
        const departmentMap = GET_DATA('jcode_departments_map') || {};
        obj = departmentMap[props.modelValue];
        break;
      case 'createUser':
      case 'modifyUser':
        const userMap = GET_DATA('jcode_users_map') || {};
        obj = userMap[props.modelValue];
        // console.log(userMap,'userMap')
        break;
    }
    // console.log(obj,this.modelValue,'jcode-label',this.type)
    return obj ? obj.label : '';
  }
});
</script>
