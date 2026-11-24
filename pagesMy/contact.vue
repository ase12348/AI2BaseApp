<template>
  <view class="page">
    <uni-list>
      <uni-list-item
        :title="$t('手机')"
        :rightText="currentUser.f_Mobile"
      ></uni-list-item>
      <uni-list-item
        :title="$t('电话')"
        :rightText="currentUser.f_Telephone"
      ></uni-list-item>
      <uni-list-item
        :title="$t('邮箱')"
        :rightText="currentUser.f_Email"
      ></uni-list-item>
      <uni-list-item
        :title="$t('微信')"
        :rightText="currentUser.f_WeChat"
      ></uni-list-item>
      <uni-list-item
        :title="$t('QQ')"
        :rightText="currentUser.f_OICQ"
      ></uni-list-item>
    </uni-list>
  </view>
</template>

<script setup>
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import { $t, GET_GLOBAL, HIDE_LOADING } from '@/utils/index';
import { computed } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';

const currentUser = computed(function () {
  return GET_GLOBAL('loginUser') || {};
});

onLoad(async () => {
  await PAGE_LAUNCH();
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
