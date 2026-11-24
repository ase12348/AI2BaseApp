<template>
  <view class="page">
    <uni-list>
      <uni-list-item
        :title="$t('账号')"
        :rightText="currentUser.f_Account"
      ></uni-list-item>
      <uni-list-item
        :title="$t('姓名')"
        :rightText="currentUser.f_RealName"
      ></uni-list-item>
      <uni-list-item
        :title="$t('性别')"
        :rightText="Number(currentUser.f_Gender) === 1 ? $t('男') : $t('女')"
      ></uni-list-item>

      <uni-list-item
        :title="$t('公司')"
        :rightText="userInfo.company"
      ></uni-list-item>
      <uni-list-item
        :title="$t('部门')"
        :rightText="userInfo.department"
      ></uni-list-item>
      <uni-list-item
        :title="$t('岗位')"
        :rightText="userInfo.post"
      ></uni-list-item>
      <uni-list-item
        :title="$t('角色')"
        :rightText="userInfo.role"
      ></uni-list-item>
    </uni-list>
  </view>
</template>

<script setup>
import {
  GET_CURRENT_COMPANY,
  GET_CURRENT_DEPARTMENT,
  PAGE_LAUNCH,
} from '@/utils/jcodePlatform';
import { $t, GET_GLOBAL, HIDE_LOADING } from '@/utils/index';
import { computed, ref } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';

const userInfo = ref({});

const currentUser = computed(function () {
  return GET_GLOBAL('loginUser') || {};
});

const init = async function () {
  if (GET_GLOBAL('loginUser') == null) {
    return;
  }
  //const { F_CompanyId: companyId, F_DepartmentId: departmentId } = this.currentUser

  const info = {
    company: (await GET_CURRENT_COMPANY()).f_FullName || $t('总集团公司'),
    department: (await GET_CURRENT_DEPARTMENT()).f_FullName || `(${$t('无')})`,
    post: `(${$t('无')})`,
    role: `(${$t('无')})`,
  };

  if (currentUser.value.role && currentUser.value.role[0]) {
    info.role = currentUser.value.role.map((t) => t.f_FullName).join(' · ');
  }

  if (currentUser.value.post && currentUser.value.post[0]) {
    info.post = currentUser.value.post.map((t) => t.f_Name).join(' · ');
  }

  userInfo.value = info;
};

onLoad(async () => {
  if (await PAGE_LAUNCH()) {
    await init();
  }
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
