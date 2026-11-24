<template>
  <view
    v-if="ready"
    class="page"
    :style="{
      'min-height': SCREENHEIGHT() + 'px',
      'background-color': '#fff',
      'padding-bottom': '40px',
    }"
  >
    <uni-forms
      ref="form"
      :modelValue="config"
      :rules="configRules"
      label-width="96"
    >
      <uni-list class="jcode-forms-list">
        <uni-list-item>
          <template v-slot:body>
            <uni-forms-item required name="f_Name" :label="$t('考勤组名称')">
              <uni-easyinput
                :placeholder="$t('请输入')"
                placeholderStyle="text-align: right;margin-right:4px;"
                :inputBorder="false"
                v-model="config.f_Name"
              />
            </uni-forms-item>
          </template>
        </uni-list-item>
        <uni-list-item>
          <template v-slot:body>
            <uni-forms-item required name="f_Person" :label="$t('参与人员')">
              <jcode-user-picker
                isMulti
                v-model="config.f_Person"
                :placeholder="$t('请选择')"
              />
            </uni-forms-item>
          </template>
        </uni-list-item>
        <uni-list-item>
          <template v-slot:body>
            <uni-forms-item required name="f_Count" :label="$t('一天班次')">
              <jcode-picker
                :options="options"
                v-model="config.f_Count"
                jcode-multiple-picker
              />
            </uni-forms-item>
          </template>
        </uni-list-item>
        <uni-list-item>
          <template v-slot:body>
            <uni-forms-item required name="f_Time" :label="$t('班次时间')">
              <jcode-custom-layer-picker
                :placeholder="$t('请设置')"
                :params="{ count: config.f_Count }"
                nav="/pagesDemo/clock/selectTime"
                :getLabel="getTimeLabel"
                :validate="timeValidate"
                v-model="config.f_Time"
              />
            </uni-forms-item>
          </template>
        </uni-list-item>
        <uni-list-item>
          <template v-slot:body>
            <uni-forms-item required name="f_Date" :label="$t('考勤日期')">
              <jcode-multiple-picker
                :options="dayOptions"
                v-model="config.f_Date"
              />
            </uni-forms-item>
          </template>
        </uni-list-item>

        <uni-list-item>
          <template v-slot:body>
            <uni-forms-item required name="f_Scope" :label="$t('考勤范围')">
              <jcode-map-picker v-model="config.f_Scope" />
            </uni-forms-item>
          </template>
        </uni-list-item>
      </uni-list>
    </uni-forms>

    <view class="jcode-bottom-btns">
      <button v-if="mode !== 'create'" @click.stop="handleDelete" type="warn">
        {{ $t('删除') }}
      </button>
      <button @click.stop="saveForm" type="primary">{{ $t('保存') }}</button>
    </view>
  </view>
</template>

<script setup>
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import {
  $t,
  CONFIRM,
  COPY,
  EMIT,
  GET_PARAM,
  HIDE_LOADING,
  LOADING,
  NAV_BACK,
  SCREENHEIGHT,
  SET_TITLE,
  TOAST,
  VALIDATEFORM,
} from '@/utils/index';
import { HTTP_DELETE, HTTP_GET, HTTP_POST, HTTP_PUT } from '@/utils/http';
import { ref } from 'vue';
import { onShow, onLoad, onBackPress } from '@dcloudio/uni-app';

const configRules = ref({
  f_Name: {
    rules: [
      {
        required: true,
        errorMessage: $t('请输入'),
      },
    ],
  },
  f_Person: {
    rules: [
      {
        required: true,
        errorMessage: $t('请选择'),
      },
    ],
  },
  f_Count: {
    rules: [
      {
        required: true,
        errorMessage: $t('请选择'),
      },
    ],
  },
  f_Date: {
    rules: [
      {
        required: true,
        errorMessage: $t('请选择'),
      },
    ],
  },
  f_Time: {
    rules: [
      {
        required: true,
        errorMessage: $t('请选择'),
      },
    ],
  },
  f_Scope: {
    rules: [
      {
        required: true,
        errorMessage: $t('请选择'),
      },
    ],
  },
});
const dayOptions = ref([
  {
    label: $t('星期一'),
    value: '1',
  },
  {
    label: $t('星期二'),
    value: '2',
  },
  {
    label: $t('星期三'),
    value: '3',
  },
  {
    label: $t('星期四'),
    value: '4',
  },
  {
    label: $t('星期五'),
    value: '5',
  },
  {
    label: $t('星期六'),
    value: '6',
  },
  {
    label: $t('星期天'),
    value: '0',
  },
]);
const options = ref([
  {
    value: '1',
    label: $t('一天一班'),
  },
  {
    value: '2',
    label: $t('一天两班'),
  },
  {
    value: '3',
    label: $t('一天三班'),
  },
]);
const config = ref({
  f_Name: '',
  f_Person: '',
  f_Count: '',
  f_Date: '',
  f_Time: '',
  f_Scope: '',
});
const mode = ref('');
const moduleId = ref('');
const keyValue = ref('');
const ready = ref(false);
const isLayer = ref(true);

const form = ref(null);

const init = async function (type) {
  ready.value = false;
  LOADING('加载数据中…');

  mode.value = type;
  const {
    title,
    moduleId: moduleId__local,
    keyValue: keyValue__local2,
  } = GET_PARAM();
  SET_TITLE(title);
  moduleId.value = moduleId__local;
  keyValue.value = keyValue__local2;

  if (mode.value == 'edit') {
    const formData = await HTTP_GET({
      url: `/demoApp/apprule/${keyValue__local2}`,
      errorTips: '获取数据失败',
    });
    config.value = formData;
  } else {
    config.value = {
      f_Name: '',
      f_Person: '',
      f_Count: '',
      f_Date: '',
      f_Time: '',
      f_Scope: '',
    };
  }

  HIDE_LOADING();
  ready.value = true;
};
const timeValidate = function (param) {
  if (param.count) {
    return true;
  }
  TOAST('请选择一天班次', 'error');
  return false;
};
const getTimeLabel = function (value) {
  return value.replace(/\|/g, ' ');
};
const validate = async function () {
  const { err } = await VALIDATEFORM(form.value);
  if (err) {
    return false;
  } else {
    return true;
  }
};
const getForm = function () {
  const postData = COPY(config.value);
  return postData;
};
const saveForm = async function () {
  LOADING('正在提交…');
  if (await validate()) {
    const res = await handleSave({
      keyValue: keyValue.value,
      isEdit: mode.value !== 'create',
    });
    HIDE_LOADING();
    if (res) {
      EMIT(`custom-list-change-${moduleId.value}`);
      NAV_BACK();
    }
  } else {
    HIDE_LOADING();
  }
};
const handleSave = async function ({ keyValue: keyValue__local3, isEdit }) {
  const postData = getForm();
  let res;
  if (isEdit) {
    res = await HTTP_PUT({
      url: `/demoApp/apprule/${keyValue.value}`,
      data: postData,
      errorTips: '表单提交保存失败',
    });
  } else {
    res = await HTTP_POST({
      url: `/demoApp/apprule`,
      data: postData,
      errorTips: '表单提交保存失败',
    });
  }

  return res;
};
const handleDelete = async function (row) {
  if (!(await CONFIRM('删除项目', '确定要删除该项吗？', true))) {
    return;
  }

  LOADING('提交删除中…');

  const success = await HTTP_DELETE({
    url: '/demoApp/apprule/' + keyValue.value,
    errorTips: '删除失败',
  });
  HIDE_LOADING();
  if (success) {
    TOAST('删除成功', 'success');
    EMIT(`custom-list-change-${moduleId.value}`);
    NAV_BACK();
  }
};

onShow(() => {});
onLoad(async ({ type }) => {
  if (await PAGE_LAUNCH()) {
    await init(type);
  }
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
