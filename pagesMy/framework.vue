<template>
  <view class="page padding bg-white" style="box-sizing: border-box">
    <view>
      <view style="text-align: center">
        {{ $t('关注极简搭微信公众号') }}
        <br />
        {{ $t('获取更多框架信息') }}
      </view>
      <view style="text-align: center" class="margin-tb"
        ><image mode="aspectFill" src="/static/wx-qrcode.png"
      /></view>
    </view>
    <view class="content">
      <text>{{ $t('极简搭AI应用开发基座移动端版本号') }}：{{ APP_VERSION_TEXT }}。</text>
    </view>
  </view>
</template>

<script setup>
import { $t } from '@/utils/index';
import { useGlobalConfig } from '@/hooks/setting/useGlobalConfig';

const { APP_VERSION_TEXT } = useGlobalConfig();
</script>

<style lang="scss" scoped>
image {
  width: 120px;
  height: 120px;
}
.content {
  font-size: 18px;
  text-align: center;
}
</style>
