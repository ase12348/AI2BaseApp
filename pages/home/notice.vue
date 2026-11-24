<template>
  <view id="notice" class="page">
    <view class="padding text-lg"> </view>
    <view class="padding-sm text-grey notice-info">
      <view class="text-right">{{ $t('本页内容发布于') }} {{ time }}</view>
      <view class="text-right">{{ date }}</view>
    </view>
  </view>
</template>

<script setup>
import moment from 'moment';
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import {
  $t,
  CONVERT_HTML,
  GET_PARAM,
  HIDE_LOADING,
  LOADING,
  SET_TITLE,
} from '@/utils/index';
import { ref } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';

const isLayer = ref(true);
const ready = ref(false);
const content = ref('');
const time = ref('');
const date = ref('');

const init = async function () {
  LOADING('加载中…');
  const noticeItem = GET_PARAM();

  content.value = CONVERT_HTML(noticeItem.f_content);

  time.value = moment(noticeItem.f_time).format('HH : mm');
  date.value = moment(noticeItem.f_time).format('YYYY年 M月 D日');
  SET_TITLE(noticeItem.f_title);

  ready.value = true;
  HIDE_LOADING();
};

onLoad(async () => {
  if (await PAGE_LAUNCH()) {
    await init();
  }
  await init();
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
