<template>
  <view class="page home" :style="{ 'min-height': SCREENHEIGHT() + 'px' }">
    <!-- 顶部搜索栏 -->
    <view class="header">
      <view @click="moreClick(1)" class="header-mid margin-lr">
        <view class="header-mid-icon">
          <jcode-icon
            type="jcode-icon-magnifying-glass-m"
            color="#B3B3B3"
            size="12"
          />
        </view>
        {{ $t('搜索更多应用') }}
      </view>
      <!-- #ifndef H5 -->
      <view class="header-right margin-right">
        <jcode-icon
          @click="scanClick"
          type="jcode-icon-scanning"
          color="#B3B3B3"
        />
      </view>
      <!-- #endif -->
    </view>
    <!-- 功能宫格列表 -->
    <view class="content padding-bottom" style="margin-bottom: 8px">
      <uni-grid :showBorder="false" :column="5" @change="funcListClick">
        <uni-grid-item
          v-for="(listItem, listIndex) in myModuleApps"
          :key="listIndex"
          :index="listIndex"
        >
          <view class="jcode-grid-item">
            <view
              class="jcode-grid-icon"
              style="background-color: transparent"
            >
              <jcode-icon
                :type="listItem.icon"
                :color="listItem.f_Color"
                size="24"
              />
            </view>
            <view
              ><text class="jcode-grid-text">{{
                $t(listItem.f_Name)
              }}</text></view
            >
          </view>
        </uni-grid-item>
        <uni-grid-item :index="100">
          <view class="jcode-grid-item">
            <view
              class="jcode-grid-icon"
              style="background-color: transparent"
            >
              <jcode-icon type="ellipsis-outlined" color="#8f939c" size="24" />
            </view>
            <view
              ><text class="jcode-grid-text">{{ $t('更多') }}</text></view
            >
          </view>
        </uni-grid-item>
      </uni-grid>
    </view>
  </view>
</template>

<script setup>
import {
  FETCH_CURRENT_USERINFO,
  PAGE_LAUNCH,
  TO_MODULE,
} from '@/utils/jcodePlatform';
import {
  $t,
  GET_GLOBAL,
  GET_STORAGE,
  HIDE_LOADING,
  IS_MODULE_OFFLINE,
  LOADING,
  MP_SHARE_DECODE,
  NAV_TO,
  RELAUNCH_TO,
  SCREENHEIGHT,
  SET_GLOBAL,
  SET_STORAGE,
  TOAST,
} from '@/utils/index';
import { HTTP_GET, CLEAR_AUTH_TOKEN } from '@/utils/http';
import { ref } from 'vue';
import {
  onLoad,
  onShow,
  onPullDownRefresh,
  onBackPress,
} from '@dcloudio/uni-app';

const myModuleApps = ref([]);
const isLoad = ref(true);

const init = async function (param) {
  // 有参数表示可能是打开分享消息；将数据存入全局变量以备后续跳转
  if (param && param.jcode && param.pagePath) {
    SET_GLOBAL('jumpParam', param);
  }

  // 登录状态无效，则跳转到登录页
  const stateValid = await checkLoginState();
  if (!stateValid) {
    RELAUNCH_TO('/pages/login');
    return;
  }

  // 加载页面数据
  await refresh();

  SET_STORAGE('nextTime', null);

  // 处理小程序分享消息跳转
  // #ifdef MP
  const jumpParam = GET_GLOBAL('jumpParam');
  if (jumpParam) {
    SET_GLOBAL('jumpParam', null);
    MP_SHARE_DECODE(jumpParam);
  }
  // #endif
};
const checkLoginState = async function () {
  // 判断 token 字段，没有 token 则必定无登录态
  const token = GET_GLOBAL('token') || GET_STORAGE('token');
  if (!token || token === 'null' || token === 'undefined') {
    HIDE_LOADING();
    return false;
  }
  SET_GLOBAL('token', token);

  // 判断是否有 loginUser 对象
  if (GET_GLOBAL('loginUser')) {
    return true;
  }

  // 拉取用户信息以验证登录态
  const success = await FETCH_CURRENT_USERINFO();
  if (!success) {
    TOAST('获取用户/部门/公司信息时出现错误，登录失败');

    // 连同刷新令牌一起清掉，避免下个请求又拿旧会话续期
    CLEAR_AUTH_TOKEN();

    return false;
  }

  return true;
};
const refresh = async function () {
  LOADING('数据加载中');
  await fetchModules();
  HIDE_LOADING();
};
const fetchModules = async function () {
  // 已取消「我的应用」个性化列表，首页宫格直接展示全部移动端功能
  const modules = await HTTP_GET({ url: '/mapp/modules' }); // 功能模块数据
  initModule(modules);
};
const initModule = function (modules) {
  const loginUser = GET_GLOBAL('loginUser');
  // 功能区按钮需要处理 icon
  const myModules = [];
  modules.forEach((item) => {
    if (
      item.f_EnabledMark == 1 &&
      !IS_MODULE_OFFLINE(item) &&
      (loginUser?.f_SecurityLevel == 1 ||
        loginUser?.f_SecurityLevel == 5 ||
        (loginUser?.moduleAuthIds || []).indexOf(item.f_Id) > -1)
    ) {
      const icon = item.f_Icon ? item.f_Icon : '';
      myModules.push({ ...item, icon: icon });
    }
  });
  SET_GLOBAL('jcode_modules', myModules);

  myModuleApps.value = myModules.filter((t) => t.f_IsSystem != 3);
};
const funcListClick = function (e) {
  if (e.detail.index == 100) {
    moreClick(0);
    return;
  }
  const item = myModuleApps.value[e.detail.index];
  TO_MODULE(item, { f_Name: item.f_Name });
};
// #ifndef H5
// 点击左上角扫码图标，H5 无此功能
const scanClick = function () {
  uni.scanCode({
    scanType: ['qrCode', 'barCode'],
    success: ({ result, charSet }) => {
      // 您可以在这里自行定制扫码后的功能
    },
  });
};
// #endif

// 点击更多功能按钮
const moreClick = function (openSearch) {
  NAV_TO('/pages/home/more', { search: openSearch ? '1' : null });
};

onLoad(async (param) => {
  if (await PAGE_LAUNCH()) {
    await init(param);
  }
  isLoad.value = false;
});
onShow(async () => {
  if (!isLoad.value) {
    // 处理 待办任务处理完成后返回首页没刷新数据
    await refresh();
  }
});
onPullDownRefresh(() => {
  refresh().then(() => {
    TOAST('已更新首页数据');
    uni.stopPullDownRefresh();
  });
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>

<style lang="scss" scoped>
.home {
  .header {
    height: 48px;
    background-color: #fff;
    display: flex;
    align-items: center;

    .header-left,
    .header-right {
      flex-grow: 0;
    }

    .header-mid {
      display: flex;
      align-items: center;

      flex-grow: 1;
      background-color: #f8f8f8;
      height: 32px;
      font-size: 12px;
      color: #b3b3b3;
      border-radius: 2px;
    }

    .header-mid-icon {
      margin: 0 8px;
    }
  }

  .content {
    position: relative;
    background-color: #fff;
  }
}
</style>
