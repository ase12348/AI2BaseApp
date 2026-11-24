<template>
  <view class="page">
    <view class="bg">
      <view class="info">
        <image :src="avatar" class="avatar" @error="imageError" />
        <view class="infotext">
          <view class="text-xl">{{ currentUser.name }}</view>
          <uni-tag line="green" size="small" :text="userTag"></uni-tag>
        </view>
      </view>

      <view class="qrcode"
        ><tki-qrcode :val="qrCodeValue" :size="550" loadMake
      /></view>
    </view>
  </view>
</template>

<script setup>
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import { $t, GET_GLOBAL, HIDE_LOADING } from '@/utils/index';
import { useGlobalConfig } from '@/hooks/setting/useGlobalConfig';
import { computed, ref } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';

const { API } = useGlobalConfig();

const qrCodeValue = ref('https://www.jcodesoft.com');
const defaultSrc = ref(null);

const currentUser = computed(function () {
  return GET_GLOBAL('loginUser') || {};
});
const avatar = computed(function () {
  if (defaultSrc.value) {
    return defaultSrc.value;
  }
  const token = GET_GLOBAL('token');
  return currentUser.value.f_HeadIcon
    ? `${API.value}/system/annexesfile/${currentUser.value.f_HeadIcon}?token=${token}`
    : `/static/img-avatar/head.png`;
});
const userTag = computed(function () {
  const { companyId, departmentId } = currentUser.value;
  if (!companyId) {
    return $t(`总集团公司`);
  }

  const company = GET_GLOBAL('company');
  const dep = GET_GLOBAL('department');
  const companyName = company[companyId].name;
  if (!dep) {
    return companyName;
  }

  return `${companyName} / ${dep[departmentId].name}`;
});

const imageError = function () {
  defaultSrc.value = `/static/img-avatar/head.png`;
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

<style lang="scss" scoped>
.page {
  background-color: #2f2d2d;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 0;
  top: 0;
  right: 0;
  left: 0;

  .bg {
    background: #ffffff;
    border-radius: 5px;
    padding: 20rpx;
    display: inline-block;

    .info {
      display: flex;
      align-items: center;
      margin-bottom: 10px;

      .avatar {
        width: 120rpx;
        height: 120rpx;
        margin-right: 15px;
        border-radius: 2px;
      }

      .infotext > view {
        margin-bottom: 10px;
      }
    }
  }
}
</style>
