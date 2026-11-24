<template>
  <view
    class="page login-page"
    :style="{ 'min-height': SCREENHEIGHT() + 'px' }"
  >
    <view class="content">
      <!-- 多语言设置 -->
      <view
        @click="pickerLangType"
        class="jcode-lang"
        v-if="langTypes().length > 1"
      >
        <jcode-icon type="menu-translation-m"></jcode-icon>
      </view>

      <view class="head-banner">
        <!-- 标题文字 -->
        <view class="title">
          <text>{{ $t('极简搭AI应用开发基座') }}</text>
          <text v-if="DEV" class="devTitle">({{ $t('开发模式') }})</text>
          <text class="subTitle">{{ APP_VERSION_TEXT }}</text>
        </view>

        <!-- 首页 Logo -->
        <view class="logo">
          <image
            mode="aspectFit"
            style="height: 100%; width: 100%"
            src="/static/logo.png"
          />
        </view>

        <!-- 【仅生产环境】使用账号的原因，无此项则微信审核通不过 -->
        <view v-if="!DEV">
          <view class="intro"
            ><text
              >{{ $t('注册登录极简搭账号后，您将可以体验极简搭AI应用开发基座中的所有功能与业务') }}</text
            ></view
          >
          <view class="intro"
            ><text>{{ $t('自定义表单 · 工作流审批等') }}</text></view
          >
          <view class="intro subIntro">
            <text
              >{{ $t('如果您之前已在极简搭AI应用开发基座 PC 端中注册过体验账号，可以直接使用原账号登录，无需另行注册') }}</text
            >
          </view>
        </view>
      </view>

      <!-- 账户密码表单 -->
      <view class="bg-white" v-if="ready">
        <uni-easyinput
          trim
          v-model="username"
          :placeholder="isTenant ? $t('请输入租户号@账号') : $t('请输入账号')"
          prefixIcon="person"
          :inputBorder="false"
        ></uni-easyinput>
        <uni-easyinput
          trim
          v-model="password"
          :placeholder="$t('请输入密码')"
          prefixIcon="locked"
          type="password"
          :inputBorder="false"
        ></uni-easyinput>
      </view>

      <button class="margin-top" @click="login(null)" type="primary">
        {{ $t('登录') }}
      </button>

      <!-- 【仅小程序】一键登录按钮 -->
      <!-- #ifdef MP -->
      <button
        v-if="MPLogin"
        @click="login(PLATFORM)"
        type="success"
        class="margin-top"
      >
        {{ PLATFORM_TEXT }}{{ $t('一键登录') }}
      </button>
      <!-- #endif -->

      <!-- 【仅开发模式】显示，后台地址切换 -->
      <view
        v-if="DEV && apiRootList.length > 1"
        class="margin-top"
        style="font-size: 16px"
        @click="pickerApiRoot"
      >
        <view
          ><text>{{ $t('后台地址') }}({{ $t('点击切换') }}):</text></view
        >
        <view
          ><text>{{ currentApiRoot }}</text></view
        >
      </view>

      <!-- 【仅开发模式】选择 API 地址的弹层 -->
      <jcode-picker-popup
        v-if="DEV && apiRootList.length > 1"
        ref="apiPicker"
        :options="apiRootList"
        @change="changeApiRoot"
      >
      </jcode-picker-popup>

      <!-- 语言选择 -->
      <jcode-picker-popup
        v-if="langTypes().length > 1"
        ref="langTypePicker"
        :options="langTypes()"
        @change="changeLangType"
      >
      </jcode-picker-popup>
    </view>
    <!-- 页面底部版权文字 -->
    <view class="footer">{{ copyRightDisplay }}</view>
  </view>
</template>

<script setup>
import {
  $t,
  CONFIRM,
  GET_STORAGE,
  HIDE_LOADING,
  JCODE_CONFIG,
  LOADING,
  MD5,
  SCREENHEIGHT,
  SET_GLOBAL,
  SET_STORAGE,
  TAB_TO,
  TOAST,
} from '@/utils/index';
import {
  FETCH_CURRENT_USERINFO,
  FETCH_LANG_DATA,
  FETCH_LANG_TYPE,
  GET_LANG_TYPES,
} from '@/utils/jcodePlatform';
import { HTTP_POST, SAVE_AUTH_TOKEN } from '@/utils/http';
import { useGlobalConfig } from '@/hooks/setting/useGlobalConfig';
import { computed, ref } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';

const { API, APP_VERSION_TEXT, DEV, PLATFORM, PLATFORM_TEXT } = useGlobalConfig();

const username = ref('');
const password = ref('');
const ready = ref(false);
const showApiRootSelector = ref(false);
const currentApiRoot = ref('');
const apiRootList = ref([]);
const devAccountList = ref([]);

const copyRightDisplay = computed(function () {
  const year = new Date().getFullYear();
  const company = JCODE_CONFIG('company');
  return `Copyright © ${year} ${company}`;
});
const MPLogin = computed(function () {
  return JCODE_CONFIG(`miniProgramAccount.${PLATFORM.value}`).includes(
    'login',
  );
});
const isTenant = computed(function () {
  return JCODE_CONFIG('isTenant');
});

const apiPicker = ref(null);
const langTypePicker = ref(null);

const init = async function () {
  const index = DEV.value
    ? JCODE_CONFIG('devApiHostIndex')
    : JCODE_CONFIG('prodApiHostIndex');
  const apiRootList__local = JCODE_CONFIG('apiHost');
  currentApiRoot.value = apiRootList__local[index];
  apiRootList.value = apiRootList__local.map((t) => ({ label: t, value: t }));

  // 如果是开发模式，填入测试账号密码
  if (DEV.value) {
    devAccountList.value = JCODE_CONFIG('devAccount');
    const account = devAccountList.value[index] || {
      username: '',
      password: '',
    };
    username.value = account.username;
    password.value = account.password;
  }

  // 获取语言类型配置
  await FETCH_LANG_TYPE();
  ready.value = true;
};
const pickerApiRoot = function () {
  apiPicker.value.open();
};
const changeApiRoot = function ({ index, value }) {
  currentApiRoot.value = value;
  SET_GLOBAL('apiRoot', value);

  // 如果是开发模式，填入测试账号密码
  if (DEV.value && devAccountList.value && devAccountList.value[index]) {
    const account = devAccountList.value[index] || {
      username: '',
      password: '',
    };
    username.value = account.username;
    password.value = account.password;
  }
};
const login = async function (type) {
  const { username: username__local2, password: password__local3 } = {
    username: username.value,
    password: password.value,
  };

  // 账号密码登录时，验证输入，输入有误则返回
  if (!type && !check()) {
    return;
  }
  LOADING('登录中…');

  // 根据不同的登录方式，调用 API
  let res = null;

  // 不是小程序，则提交用户名、密码登录
  // 是小程序，则申请授权码登录
  if (!type) {
    let _username = username__local2;
    const usernameList = username__local2.split('@');
    let tenantNo = '';
    if (usernameList.length == 2) {
      _username = usernameList[1];
      tenantNo = usernameList[0];
    }
    res = await HTTP_POST({
      url: '/login',
      data: { account: _username, password: MD5(password__local3) },
      params: { tenantNo },
      errorTips: '登录时发生错误',
    });
  } else {
    console.log('微信小程序一建登录');

    const [codeErr, { code } = {}] = await uni.login({ provider: type });
    if (codeErr || !code) {
      HIDE_LOADING();
      CONFIRM('登录失败', '无法获取小程序登录授权码');
      return;
    }

    res = await HTTP_POST({
      url: '/login/openid',
      params: { code, type },
      //params:{tenantNo},
      errorTips: '登录时发生错误',
    });
  }

  if (!res) {
    return;
  }

  // 双 token：访问令牌 + 刷新令牌 + 到期时间一起落库，并启动主动续期
  SAVE_AUTH_TOKEN(res);

  const success = await FETCH_CURRENT_USERINFO();
  if (!success) {
    TOAST('获取用户/部门/公司信息时出现错误，登录失败');
    return;
  }

  HIDE_LOADING();
  TAB_TO('/pages/home/index');
};
const check = function () {
  const { username: username__local4, password: password__local5 } = {
    username: username.value,
    password: password.value,
  };
  if (username__local4.length <= 0 || password__local5.length <= 0) {
    CONFIRM('输入错误', '账号或密码不能为空，请重新输入。');
    return false;
  }
  return true;
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

onLoad(async () => {
  await init();
});
/* TODO: 未识别的生命周期 onResize 请手动转换 */
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  justify-content: center;
  flex-direction: column;

  .head-banner {
    margin-bottom: 32px;
    .title {
      display: block;
      margin: 8px 0;
      font-size: 20px;
      margin-bottom: 16px;
      color: $uni-main-color;
    }
    .devTitle {
      color: $uni-error;
    }
    .subTitle {
      font-size: 16px;
      color: $uni-info;
    }

    .logo {
      background-size: contain;
      height: 64px;
      width: 64px;
      text-align: center;
      display: inline-block;
      border-radius: 2px;
    }

    .intro {
      font-size: 12px;
      margin-top: 8px;
      color: $uni-base-color;
    }
    .subIntro {
      color: $uni-extra-color;
    }
  }

  .content {
    text-align: center;
    width: 100%;
    padding: 0 24px;
    box-sizing: border-box;
  }

  .footer {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 8px;
    bottom: calc(8px + env(safe-area-inset-bottom));
    text-align: center;
    font-size: 12px;
    color: $uni-info;

    /* #ifdef MP-ALIPAY */
    bottom: 8px;
    /* #endif */
  }

  .jcode-lang {
    position: absolute;
    top: 24px;
    right: 24px;
  }
}
</style>
