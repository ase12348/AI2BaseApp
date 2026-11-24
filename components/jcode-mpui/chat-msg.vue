<template>
  <view :class="[type === 'left' ? '' : 'self']" class="jcode-chat-item">
    <image
      v-if="type === 'left' && imgAvatar"
      :src="myMgAvatar"
      :style="{ 'border-radius': roundAvatar ? '50%' : '3px' }"
      mode="aspectFill"
      class="imgAvatar"
      @error="imageError($event)"
    ></image>

    <view class="main">
      <view
        class="content"
        :style="{ 'background-color': type !== 'left' ? '#3c9cff' : '' }"
      >
        <text
          style="word-break: break-all"
          :style="{ color: type !== 'left' ? '#fff' : '' }"
          >{{ content }}</text
        >
      </view>
    </view>

    <image
      v-if="type !== 'left' && imgAvatar"
      :src="myMgAvatar"
      :style="{ 'border-radius': roundAvatar ? '50%' : '3px' }"
      mode="aspectFill"
      class="imgAvatar"
      @error="imageError($event)"
    ></image>

    <view class="date">{{ date }}</view>
  </view>
</template>
<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  content: {},
  type: { default: 'left' },
  roundAvatar: {},
  date: {},
  leftColor: {},
  rightColor: { default: 'green' },
  avatar: {},
  iconAvatar: {},
  iconStyle: { default: '' },
  imgAvatar: {},
  imgStyle: { default: '' },
});
defineOptions({ name: 'jcode-chat-msg' });

const defaultValue = ref(null);

const myMgAvatar = computed(function () {
  if (defaultValue.value) {
    return defaultValue.value;
  }
  return props.imgAvatar;
});

const imageError = function (e) {
  defaultValue.value = `/static/img-avatar/head.png`;
};
</script>
<style lang="scss">
.imgAvatar {
  height: 48px;
  width: 48px;
}

.jcode-chat-item {
  display: flex;
  padding: 30rpx 30rpx 70rpx;
  position: relative;
}

.jcode-chat-item > .main {
  max-width: calc(100% - 260rpx);
  margin: 0 40rpx;
  display: flex;
  align-items: center;
}

.jcode-chat-item > .main .content {
  padding: 0 8px;
  border-radius: 2px;
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  font-size: 14px;
  position: relative;
  min-height: 36px;
  line-height: 36px;
  text-align: left;
}

.jcode-chat-item > .main .content {
  background-color: #ffffff;
  color: #333333;
}

.jcode-chat-item .date {
  position: absolute;
  font-size: 24rpx;
  color: #8799a3;
  width: calc(100% - 320rpx);
  bottom: 20rpx;
  left: 160rpx;
}

.jcode-chat-item > .main .content::after {
  content: '';
  top: 27rpx;
  transform: rotate(45deg);
  position: absolute;
  z-index: 100;
  display: inline-block;
  overflow: hidden;
  width: 24rpx;
  height: 24rpx;
  left: -12rpx;
  right: initial;
  background-color: inherit;
}

.jcode-chat-item.self > .main .content::after {
  left: auto;
  right: -12rpx;
}

.jcode-chat-item > .main .content::before {
  content: '';
  top: 30rpx;
  transform: rotate(45deg);
  position: absolute;
  z-index: -1;
  display: inline-block;
  overflow: hidden;
  width: 24rpx;
  height: 24rpx;
  left: -12rpx;
  right: initial;
  background-color: inherit;
  filter: blur(5rpx);
  opacity: 0.3;
}

.jcode-chat-item > .main .content::before {
  background-color: #333333;
  opacity: 0.1;
}

.jcode-chat-item.self > .main .content::before {
  left: auto;
  right: -12rpx;
}

.jcode-chat-item.self {
  justify-content: flex-end;
  text-align: right;
}
</style>
