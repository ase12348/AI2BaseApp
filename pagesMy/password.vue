<template>
  <view class="page" style="padding-top: 8px">
    <view class="bg-white jcode-list-form">
      <uni-forms :modelValue="formData" :rules="rules" ref="myForm">
        <uni-forms-item :label="$t('旧密码')" name="oldPwd" required>
          <uni-easyinput
            v-model="formData.oldPwd"
            :placeholder="$t('请输入')"
            :inputBorder="false"
            type="password"
          >
          </uni-easyinput>
        </uni-forms-item>
        <uni-forms-item :label="$t('新的密码')" name="newPwd" required>
          <uni-easyinput
            v-model="formData.newPwd"
            :placeholder="$t('请输入')"
            :inputBorder="false"
            type="password"
          >
          </uni-easyinput>
        </uni-forms-item>
        <uni-forms-item :label="$t('确认输入')" name="confirmPwd" required>
          <uni-easyinput
            v-model="formData.confirmPwd"
            :placeholder="$t('请输入')"
            :inputBorder="false"
            type="password"
          >
          </uni-easyinput>
        </uni-forms-item>
      </uni-forms>
    </view>

    <view class="padding">
      <button @click="submit" type="primary">{{ $t('确认修改') }}</button>
    </view>
  </view>
</template>

<script setup>
import {
  $t,
  CONFIRM,
  HIDE_LOADING,
  LOADING,
  MD5,
  NAV_BACK,
  TOAST,
  VALIDATEFORM,
} from '@/utils/index';
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import { HTTP_PUT } from '@/utils/http';
import { ref } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';

const formData = ref({
  oldPwd: '',
  newPwd: '',
  confirmPwd: '',
});
const rules = ref({
  oldPwd: {
    rules: [
      {
        required: true,
        errorMessage: $t('请填写旧密码'),
      },
    ],
  },
  newPwd: {
    rules: [
      {
        required: true,
        errorMessage: $t('请填写新密码'),
      },
    ],
  },
  confirmPwd: {
    rules: [
      {
        required: true,
        errorMessage: $t('请再次输入新密码'),
      },
    ],
  },
});

const myForm = ref(null);

const submit = async function () {
  const { err } = await VALIDATEFORM(myForm.value);

  if (err) {
    return;
  }

  const { oldPwd, newPwd, confirmPwd } = formData.value;

  if (newPwd !== confirmPwd) {
    CONFIRM('操作失败', '新密码和确认密码输入不一致，请修改。');
    return;
  }

  LOADING('提交…');

  const success = await HTTP_PUT({
    url: '/organization/user/password',
    data: {
      password: MD5(newPwd),
      oldPassword: MD5(oldPwd),
    },
    errorTips: '未能成功修改密码',
  });

  HIDE_LOADING();
  if (!success) {
    return;
  }

  NAV_BACK();
  TOAST('密码修改成功');
};

onLoad(async () => {
  await PAGE_LAUNCH();
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
