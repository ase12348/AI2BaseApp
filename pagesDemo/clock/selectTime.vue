<template>
  <view
    v-if="ready"
    class="page"
    :style="{ 'min-height': SCREENHEIGHT() + 'px', 'padding-top': '8px' }"
  >
    <uni-forms
      :modelValue="formData"
      ref="myForm"
      :rules="formRules"
      label-width="88"
    >
      <view
        v-for="item in list"
        :key="item"
        class="jcode-panel"
        style="margin-top: 8px"
      >
        <uni-list class="jcode-forms-list">
          <uni-list-item>
            <template v-slot:body>
              <uni-forms-item required :name="`name${item}`" :label="$t('班次名称')">
                <uni-easyinput
                  :placeholder="$t('请输入')"
                  placeholderStyle="text-align: right;margin-right:4px;"
                  :inputBorder="false"
                  v-model="formData[`name${item}`]"
                />
              </uni-forms-item>
            </template>
          </uni-list-item>
          <uni-list-item>
            <template v-slot:body>
              <uni-forms-item required :name="`time${item}`" :label="$t('班次时间')">
                <jcode-time-picker
                  isRange
                  style="width: 100%"
                  v-model="formData[`time${item}`]"
                />
              </uni-forms-item>
            </template>
          </uni-list-item>
        </uni-list>
      </view>
    </uni-forms>

    <view class="jcode-bottom-btns">
      <button @click.stop="handleSave" type="primary">{{ $t('保存') }}</button>
    </view>
  </view>
</template>

<script setup>
import {
  $t,
  EMIT,
  GET_PARAM,
  HIDE_LOADING,
  NAV_BACK,
  OFF,
  SCREENHEIGHT,
  VALIDATEFORM,
} from '@/utils/index';
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import { ref } from 'vue';
import { onBackPress, onUnload, onLoad } from '@dcloudio/uni-app';

const formRules = ref({
  name0: {
    rules: [
      {
        required: true,
        errorMessage: $t('请输入'),
      },
    ],
  },
  time0: {
    rules: [
      {
        required: true,
        errorMessage: $t('请选择'),
      },
    ],
  },
  name1: {
    rules: [
      {
        required: true,
        errorMessage: $t('请输入'),
      },
    ],
  },
  time1: {
    rules: [
      {
        required: true,
        errorMessage: $t('请选择'),
      },
    ],
  },
  name2: {
    rules: [
      {
        required: true,
        errorMessage: $t('请输入'),
      },
    ],
  },
  time2: {
    rules: [
      {
        required: true,
        errorMessage: $t('请选择'),
      },
    ],
  },
});
const formData = ref({
  name0: '',
  time0: '',
  name1: '',
  time1: '',
  name2: '',
  time2: '',
});
const list = ref([]);
const ready = ref(false);
const isLayer = ref(true);

const myForm = ref(null);

const init = function () {
  ready.value = false;
  const { params, value } = GET_PARAM() || {};

  let values = [];
  if (value) {
    values = value.split(',');
  }

  const count = parseInt(params.count);
  const list__local = [];
  for (let i = 0; i < count; i++) {
    list__local.push(i);
    if (values.length > i) {
      let valueItem = values[i];
      let valueItems = valueItem.split('|');
      formData.value['name' + i] = valueItems[0];
      formData.value['time' + i] = valueItems[1];
    }
  }

  console.log(values, formData.value);

  list.value = list__local;
  ready.value = true;
};
const validate = async function () {
  const { err } = await VALIDATEFORM(myForm.value);
  if (err) {
    return false;
  } else {
    return true;
  }
};
const handleSave = async function () {
  if (await validate()) {
    let values = [];
    for (let i = 0; i < list.value.length; i++) {
      let point = `${formData.value['name' + i]}|${formData.value['time' + i]}`;
      values.push(point);

      formData.value['name' + i] = '';
      formData.value['time' + i] = '';
    }

    EMIT('jcode-custom-layer-picker', {
      value: String(values),
    });
    ready.value = false;

    NAV_BACK();

    //console.log(this.formData,values,'values');
  }
};

onBackPress(() => {
  // #ifdef APP-VUE || APP-HARMONY
  HIDE_LOADING();
  // #endif

  OFF('jcode-custom-layer-picker');
});
onUnload(() => {
  OFF('jcode-custom-layer-picker');
});
onLoad(async () => {
  if (await PAGE_LAUNCH()) {
    init();
  }
});
</script>

<style></style>
