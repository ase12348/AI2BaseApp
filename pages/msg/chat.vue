<template>
  <view
    class="page"
    :style="{ 'min-height': SCREENHEIGHT() + 'px', 'padding-bottom': '48px' }"
  >
    <!-- 聊天消息列表 -->
    <jcode-chat-wraper :nomore="false">
      <!-- 单条聊天消息 -->
      <jcode-chat-msg
        v-for="item of msgList"
        :key="item.f_MsgId"
        :content="item.f_Content"
        :type="item.f_SendUserId === chatUserId ? 'left' : 'right'"
        :date="dateDisplay(item.f_CreateDate)"
        :roundAvatar="roundAvatar"
        :imgAvatar="avatar(item.f_SendUserId)"
        iconAvatar="notice"
        iconStyle="background-color: #e4f2fd; color: #98c0da;"
      />
    </jcode-chat-wraper>

    <!-- 消息输入框 -->
    <jcode-chat-input
      v-model="msgInput"
      @sendMsg="sendMsg"
      :buttonDisabled="buttonDisabled"
      :placeholder="$t('输入要发送的消息内容')"
    />
  </view>
</template>

<script setup>
import moment from 'moment';
import {
  $t,
  DATENOW,
  GET_GLOBAL,
  HIDE_LOADING,
  JCODE_CONFIG,
  LOADING,
  SCREENHEIGHT,
  SET_TITLE,
  TABLEITEM_DATEFORMAT,
  TOAST,
} from '@/utils/index';
import { HTTP_GET, HTTP_POST } from '@/utils/http';
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

const chatUserId = ref(null);
const icon = ref(null);
const isSystem = ref(false);
const msgList = ref([]);
const msgInput = ref('');
const earliestTimePoint = ref('');
const nextTime = ref('');
const timer = ref(null);
const ready = ref(false);
const buttonDisabled = ref(false);

const roundAvatar = computed(function () {
  return JCODE_CONFIG('pageConfig.roundAvatar');
});

const init = async function ({ id, name, icon: icon__local, sys }) {
  LOADING('加载消息…');

  if (icon__local && icon__local.indexOf('.') == -1) {
    icon.value = icon__local;
  }

  chatUserId.value = id;
  isSystem.value = sys;

  SET_TITLE(name);
  const message = await HTTP_GET({
    url: '/message/msg/list/last',
    params: { toId: id },
  });

  // 记录最晚消息的时间点
  const nextTime__local2 = message[0] && message[0].f_CreateDate;

  nextTime.value = moment(nextTime__local2).format('YYYY-MM-DD HH:mm:ss');

  const msgList__local3 = message.reverse();

  // 记录最早消息的时间点
  const earliest = msgList__local3[0] && msgList__local3[0].f_CreateDate;
  earliestTimePoint.value = moment(earliest)
    .subtract(1, 'second')
    .format('YYYY-MM-DD HH:mm:ss');

  msgList.value = msgList__local3;
  ready.value = true;

  // 打开页面后，滚动到底部
  setTimeout(() => {
    uni.pageScrollTo({ scrollTop: 9999, duration: 100 });
  }, 500);

  HIDE_LOADING();
};
const fetchMsg = async function () {
  if (!ready.value) {
    return;
  }

  const message = await HTTP_GET({
    url: '/message/msg/list/big',
    params: {
      toId: chatUserId.value,
      time: nextTime.value,
    },
  });

  if (message && message.length > 0) {
    // 记录最晚消息的时间点
    const nextTime__local4 = message[0] && message[0].F_CreateDate;
    nextTime.value = moment(nextTime__local4).format('YYYY-MM-DD HH:mm:ss');

    msgList.value = msgList.value.concat(
      message
        .filter(
          (t) => msgList.value.findIndex((t2) => t2.f_MsgId == t.f_MsgId) == -1,
        )
        .reverse(),
    );

    // 打开页面后，滚动到底部
    setTimeout(() => {
      uni.pageScrollTo({ scrollTop: 9999, duration: 100 });
    }, 500);
  }
};
const fetchBefore = async function () {
  const message = await HTTP_GET({
    url: '/message/msg/list/less',
    params: {
      toId: chatUserId.value,
      time: earliestTimePoint.value,
    },
  });

  const oldMsgList = message.reverse();
  if (oldMsgList.length > 0) {
    earliestTimePoint.value = moment(oldMsgList[0].F_CreateDate)
      .subtract(1, 'second')
      .format('YYYY-MM-DD HH:mm:ss');

    msgList.value = oldMsgList.concat(msgList.value);
  }
};
const sendMsg = async function () {
  if (msgInput.value.trim().length <= 0) {
    TOAST('发送的消息不能为空');
    return;
  }

  ready.value = false;
  buttonDisabled.value = true;
  const result = await HTTP_POST({
    url: '/message/msg/send',
    data: { f_RecvUserId: chatUserId.value, f_Content: msgInput.value },
    errorTips: '消息发送失败',
  });

  if (!result) {
    return;
  }

  msgList.value.push({
    f_Content: msgInput.value,
    f_CreateDate: DATENOW(),
    f_IsSystem: null,
    f_MsgId: result,
    f_RecvUserId: chatUserId.value,
    f_SendUserId: GET_GLOBAL('loginUser')?.F_UserId,
  });

  msgInput.value = '';

  setTimeout(() => {
    uni.pageScrollTo({ scrollTop: 9999, duration: 100 });
  }, 10);

  buttonDisabled.value = false;
  ready.value = true;
};
const dateDisplay = function (date) {
  return TABLEITEM_DATEFORMAT(date).toString();
};
const avatar = function (id) {
  const token = GET_GLOBAL('token');
  if (id == chatUserId.value && icon.value) {
    return `${API.value}/system/annexesfile/${icon.value}?token=${token}`;
  } else if (id !== chatUserId.value) {
    const user = GET_GLOBAL('loginUser');
    return user?.f_HeadIcon
      ? `${API.value}/system/annexesfile/${user?.f_HeadIcon}?token=${token}`
      : `/static/img-avatar/head.png`;
  } else {
    return `/static/img-avatar/head.png`;
  }
};

onLoad(async (query) => {
  await init(query);
});
onPullDownRefresh(() => {
  fetchBefore().then(uni.stopPullDownRefresh);
});
onShow(() => {
  const intervalTime = JCODE_CONFIG('pageConfig.chat.fetchMsg');
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
