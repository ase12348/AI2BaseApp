<template>
  <view class="page" :style="{ 'min-height': SCREENHEIGHT() + 'px' }">
    <uni-list :border="true">
      <!-- 头像显示角标 -->
      <uni-list-chat
        :avatar-circle="true"
        v-for="item of msgList"
        :key="item.f_Id"
        clickable
        @click="goTo(item)"
        :avatar="avatarSrc(item)"
        :title="msgTitle(item)"
        :note="item.f_Content"
        :time="msgDateTime(item.f_Time).toString()"
        badge-positon="left"
        :badge-text="item.f_NoReadNum"
      >
      </uni-list-chat>
    </uni-list>
  </view>
</template>

<script setup>
import moment from 'moment';
import mapKeys from 'lodash/mapKeys';
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import {
  $t,
  GET_GLOBAL,
  HIDE_LOADING,
  JCODE_CONFIG,
  LOADING,
  NAV_TO,
  SCREENHEIGHT,
  TABLEITEM_DATEFORMAT,
  TOAST,
} from '@/utils/index';
import { HTTP_GET, HTTP_POST, HTTP_PUT } from '@/utils/http';
import { useGlobalConfig } from '@/hooks/setting/useGlobalConfig';
import { computed, ref } from 'vue';
import {
  onLoad,
  onPullDownRefresh,
  onShow,
  onHide,
  onUnload,
  onBackPress,
} from '@dcloudio/uni-app';

const { API } = useGlobalConfig();

const msgList = ref([]);
const userTable = ref({});
const sysUserTable = ref({});
const timer = ref(null);
const nextTime = ref('1888-10-10 10:10:10');

const msgCount = computed(function () {
  return msgList.value.length;
});
const roundAvatar = computed(function () {
  return JCODE_CONFIG('pageConfig.roundAvatar');
});

const init = async function () {
  LOADING('读取消息列表中…');
  await fetchMsg();
  HIDE_LOADING();
};
const fetchMsg = async function () {
  const message = await HTTP_GET({
    url: `/message/contacts/${nextTime.value}`,
    errorTips: '加载信息时通讯出错',
  });
  if (!message || message.length <= 0) {
    return;
  }
  nextTime.value = moment(message[0].f_Time).format('YYYY-MM-DD HH:mm:ss');

  // 不在列表里的消息，则插入；已在列表里的消息，则替换
  // 最后按照时间排序，最后的消息在最上
  const newMsg = message;
  const allMsg = msgList.value;

  // 提取出消息列表中新增的用户的ID，拉取这些用户的信息
  const newUserIds = newMsg
    .filter((t) => !userTable.value[t.f_OtherUserId])
    .map((t) => t.f_OtherUserId);

  if (newUserIds.length > 0) {
    await fetchUsers(newUserIds);
  }

  newMsg.forEach((item) => {
    const idx = allMsg.findIndex((t) => t.f_Id === item.f_Id);
    if (idx === -1) {
      allMsg.push(item);
      return;
    }
    allMsg[idx] = item;
  });

  msgList.value = allMsg.sort(
    (a, b) => moment(b.f_Time).valueOf() - moment(a.f_Time).valueOf(),
  );
};
const fetchUsers = async function (newIds) {
  const result = await HTTP_POST({
    url: '/organization/users',
    data: { ids: newIds.join(',') },
    errorTips: '拉取用户信息失败',
  });
  userTable.value = Object.assign(
    userTable.value,
    mapKeys(result || [], 'f_UserId'),
  );
};
const goTo = function (item) {
  const otherUserId = item.f_OtherUserId;
  HTTP_PUT({ url: `/message/contact/state/${otherUserId}` });
  const user = userTable.value[otherUserId];

  //const sys = this.sysUserTable[otherUserId] ? '1' : null

  NAV_TO('/pages/msg/chat', {
    id: otherUserId,
    name: user.f_Name || user.f_RealName || `(${$t('未知用户')})`,
    icon: user.f_HeadIcon,
    sys: null,
  });
};
const msgTitle = function (item) {
  const user = userTable.value[item.f_OtherUserId] || {};
  return user.f_Name || user.f_RealName || `(${$t('未知用户')})`;
};
const msgDateTime = function (date) {
  return TABLEITEM_DATEFORMAT(date);
};
const avatarSrc = function (item) {
  const user = item && userTable.value[item.f_OtherUserId];
  if (!user) {
    return null;
  }
  const token = GET_GLOBAL('token');
  return user.f_HeadIcon && user.f_HeadIcon.indexOf('.') == -1
    ? `${API.value}/system/annexesfile/${user.f_HeadIcon}?token=${token}`
    : `/static/img-avatar/head.png`;
};

onLoad(async () => {
  if (await PAGE_LAUNCH()) {
    await init();
  }
});
onPullDownRefresh(() => {
  msgList.value = [];
  nextTime.value = '1888-10-10 10:10:10';
  fetchMsg().then(() => {
    TOAST('已更新消息列表');
    uni.stopPullDownRefresh();
  });
});
onShow(() => {
  const intervalTime = JCODE_CONFIG('pageConfig.msg.fetchMsg');
  timer.value = setInterval(fetchMsg, intervalTime);
});
onHide(() => {
  clearInterval(timer.value);
});
onUnload(() => {
  clearInterval(timer.value);
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
