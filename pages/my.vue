<template>
  <view class="page" :style="{ 'min-height': SCREENHEIGHT() + 'px' }">
    <!-- 顶部用户名、头像 banner -->
    <view @click="goTo('info')" class="mybanner">
      <view class="avatar-wraper">
        <image
          :src="avatarSrc"
          :style="{ borderRadius: roundAvatar ? '50%' : '3px' }"
          mode="aspectFill"
          class="avatar"
          @error="imageError"
        >
        </image>
      </view>
      <view class="info-wraper">
        <view class="username">{{ userName }}</view>
        <view>
          <uni-tag
            v-for="(tag, index) of userTag"
            :key="index"
            :text="tag.title"
            :type="tag.type"
            size="small"
          ></uni-tag>
        </view>
      </view>
      <view class="icon-wraper"
        ><jcode-icon type="jcode-icon-right-arrow" color="#fff"
      /></view>
    </view>

    <view class="jcode-panel">
      <uni-list>
        <uni-list-item
          @click="goTo('contact')"
          showExtraIcon
          :extraIcon="{ color: '#2979ff', size: '16', type: 'phone' }"
          :title="$t('联系方式')"
          showArrow
          clickable
        ></uni-list-item>
        <uni-list-item
          @click="goTo('qrcode')"
          showExtraIcon
          :extraIcon="{ color: '#2979ff', size: '16', type: 'bars' }"
          :title="$t('我的二维码')"
          showArrow
          clickable
        ></uni-list-item>
        <uni-list-item
          @click="goTo('password')"
          showExtraIcon
          :extraIcon="{ color: '#2979ff', size: '16', type: 'compose' }"
          :title="$t('修改密码')"
          showArrow
          clickable
        ></uni-list-item>
        <uni-list-item
          @click="pickerLangType()"
          showExtraIcon
          :extraIcon="{ color: '#2979ff', size: '16', type: 'gear-filled' }"
          :title="`${$t('语言')}：${langName()}`"
          showArrow
          clickable
        ></uni-list-item>
        <uni-list-item
          @click="pickerPostType()"
          showExtraIcon
          :extraIcon="{ color: '#2979ff', size: '16', type: 'person-filled' }"
          :title="`${$t('岗位')}：${postName()}`"
          showArrow
          clickable
          v-if="userPosts.length > 0"
        ></uni-list-item>
      </uni-list>
    </view>

    <view class="jcode-panel">
      <uni-list>
        <uni-list-item
          @click="goTo('jcode')"
          showExtraIcon
          :extraIcon="{ color: '#2979ff', size: '16', type: 'home' }"
          :title="$t('关于极简搭')"
          showArrow
          clickable
        ></uni-list-item>
        <uni-list-item
          @click="goTo('framework')"
          showExtraIcon
          :extraIcon="{ color: '#2979ff', size: '16', type: 'info' }"
          :title="$t('框架介绍')"
          showArrow
          clickable
        ></uni-list-item>
      </uni-list>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <view class="jcode-panel" v-if="MPBind || MPUnbind">
      <button
        v-if="MPBind && !currentUser.f_WxOpenId"
        @click="userBind()"
        style="background: #3399ff; color: #fff"
      >
        {{ $t('绑定') }}{{ PLATFORM_TEXT }}
      </button>
      <button
        v-else-if="MPUnbind"
        @click="userUnBind()"
        style="background: #ff0033; color: #fff"
      >
        {{ $t('解除') }}{{ PLATFORM_TEXT }}{{ $t('绑定') }}
      </button>
    </view>
    <!--#endif-->

    <view class="jcode-panel">
      <button @click="logout" type="warn">{{ $t('退出登录') }}</button>
    </view>

    <view class="footer">{{ copyRightDisplay }}</view>

    <!-- 语言选择 -->
    <jcode-picker-popup
      v-if="langTypes().length > 1"
      ref="langTypePicker"
      :options="langTypes()"
      @change="changeLangType"
    >
    </jcode-picker-popup>

    <!-- 岗位切换 -->
    <jcode-picker-popup
      ref="postsPicker"
      :options="userPosts"
      @change="changeCurrentPost"
    >
    </jcode-picker-popup>
  </view>
</template>

<script setup>
import {
  FETCH_LANG_DATA,
  FETCH_POST_DATA,
  GET_CURRENT_COMPANY,
  GET_CURRENT_DEPARTMENT,
  GET_LANG_TYPES,
  GET_USER_POSTS,
  PAGE_LAUNCH,
  SET_CURRENT_POST,
} from '@/utils/jcodePlatform';
import {
  $t,
  CLEAR_GLOBAL,
  CONFIRM,
  GET_GLOBAL,
  GET_STORAGE,
  HIDE_LOADING,
  JCODE_CONFIG,
  LOADING,
  NAV_TO,
  RELAUNCH_TO,
  SCREENHEIGHT,
  SET_STORAGE,
  TOAST,
} from '@/utils/index';
import { HTTP_POST, LOGOUT_AUTH } from '@/utils/http';
import { useGlobalConfig } from '@/hooks/setting/useGlobalConfig';
import { computed, ref } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';

const { API, PLATFORM, PLATFORM_TEXT } = useGlobalConfig();

const userTag = ref([]);
const currentUser = ref({});
const defaultSrc = ref(null);
const userPosts = ref([]);

const avatarSrc = computed(function () {
  if (defaultSrc.value) {
    return defaultSrc.value;
  }
  const token = GET_GLOBAL('token');
  return currentUser.value.f_HeadIcon
    ? `${API.value}/system/annexesfile/${currentUser.value.f_HeadIcon}?token=${token}`
    : `/static/img-avatar/head.png`;
});
const userName = computed(function () {
  return currentUser.value
    ? currentUser.value.f_RealName
    : `(${$t('未知用户名')})`;
});
const roundAvatar = computed(function () {
  return JCODE_CONFIG('pageConfig.roundAvatar');
});
const copyRightDisplay = computed(function () {
  const year = new Date().getFullYear();
  const company = JCODE_CONFIG('company');

  return `Copyright © ${year} ${company}`;
});
// #ifdef MP-ALIPAY || MP-WEIXIN
// 是否显示小程序绑定按钮
const MPBind = computed(function () {
  return JCODE_CONFIG(`miniProgramAccount.${PLATFORM.value}`).includes('bind');
});
const MPUnbind = computed(function () {
  return JCODE_CONFIG(`miniProgramAccount.${PLATFORM.value}`).includes(
    'unbind',
  );
});
// #endif

const langTypePicker = ref(null);
const postsPicker = ref(null);

const init = async function () {
  currentUser.value = GET_GLOBAL('loginUser');
  userTag.value = await getUserTag();
  userPosts.value = (await getPosts()) || [];
};
const logout = async function () {
  if (await CONFIRM('注销确认', '确定要注销登录吗？', true)) {
    // 作废服务端会话（刷新令牌），再清本地登录态
    await LOGOUT_AUTH();
    CLEAR_GLOBAL();
    RELAUNCH_TO('/pages/login');
  }
};
const getUserTag = async function () {
  const companyName = (await GET_CURRENT_COMPANY()).f_FullName;
  const departmentName = (await GET_CURRENT_DEPARTMENT()).f_FullName;

  if (!companyName) {
    return [
      {
        title: $t('总集团公司'),
        type: 'success',
      },
    ];
  }

  if (!departmentName) {
    return [
      {
        title: companyName,
        type: 'success',
      },
    ];
  }

  return [
    {
      title: companyName,
      type: 'success',
    },
    {
      title: departmentName,
      type: 'warning',
    },
  ];
};
// #ifdef MP-ALIPAY || MP-WEIXIN
// 小程序绑定方法，只会编译到小程序
const userBind = async function () {
  const type = PLATFORM.value;
  const confirm = await CONFIRM(
    '绑定确认',
    `确定要将您的极简搭账号与当前登录的${PLATFORM_TEXT.value}账号绑定吗？\n(绑定后可以使用一键登录功能)`,
    true,
  );
  if (!confirm) {
    return;
  }

  LOADING('绑定中…');
  const [codeErr, { code }] = await uni.login({
    provider: type,
  });
  if (codeErr || !code) {
    HIDE_LOADING();
    TOAST('获取用户授权码失败');
    return;
  }

  const success = await HTTP_POST({
    url: '/login/binding',
    params: {
      code,
      type,
    },
    errorTips: '绑定失败',
  });
  if (success) {
    HIDE_LOADING();
    currentUser.value.f_WxOpenId = 'xxx';
    TOAST(`已成功绑定到当前的${PLATFORM_TEXT.value}账号`);
  }
};
const userUnBind = async function () {
  const confirm = await CONFIRM(
    '解绑确认',
    '确定要解除小程序账号绑定吗？ （解绑将自动退出登录，需使用极简搭账号和密码再次登录）',
    true,
  );
  if (!confirm) {
    return;
  }

  const success = await HTTP_POST({
    url: '/login/unbinding',
    params: {
      type: PLATFORM.value,
    },
    errorTips: '解除绑定失败',
  });
  if (success) {
    await LOGOUT_AUTH();
    CLEAR_GLOBAL();
    RELAUNCH_TO('/pages/login');
    TOAST('已成功解除绑定');
  }
};
// #endif

// 跳转到
const goTo = function (urlPath) {
  NAV_TO(`/pagesMy/${urlPath}`);
};
const pickerLangType = function () {
  langTypePicker.value.open(GET_STORAGE('jcode_lang_type'));
};
const changeLangType = async function ({ index, value }) {
  SET_STORAGE('jcode_lang_type', value);
  await FETCH_LANG_DATA();
};
const langTypes = function () {
  return GET_LANG_TYPES();
};
const langName = function () {
  const type = GET_STORAGE('jcode_lang_type');
  const list = langTypes();
  let lang;
  if (type) {
    lang = list.find((t) => t.value == type);
  }
  if (!lang) {
    lang = list.find((t) => t.f_IsMain == 1);
  }
  return lang?.label || '';
};
const pickerPostType = async function () {
  postsPicker.value.open(currentUser.value.postId);
};
const getPosts = async function () {
  const res = await GET_USER_POSTS(String(currentUser.value.postIds || []));
  return res;
};
const changeCurrentPost = async function ({ value }) {
  SET_CURRENT_POST(value);
  await FETCH_POST_DATA();
};
const postName = function () {
  const postId = currentUser.value.postId;
  const post = userPosts.value.find((t) => t.value === postId) || {};
  return post.label || '';
};
const imageError = function () {
  defaultSrc.value = `/static/img-avatar/head.png`;
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

<style lang="scss" scoped>
.mybanner {
  background: #0c86d8;
  height: 120px;
  padding: 24px 16px;
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .avatar-wraper {
    display: flex;
    align-items: center;
  }

  .avatar-wraper,
  .icon-wraper {
    flex-grow: 0;

    .avatar {
      height: 60px;
      width: 60px;
    }
  }

  .info-wraper {
    padding-left: 20px;
    flex-grow: 1;

    .username {
      color: #fff;
      margin-bottom: 8px;
    }
  }
}

.footer {
  text-align: center;
  font-size: 12px;
  margin-bottom: 8px;
  color: $uni-info;
}
</style>
