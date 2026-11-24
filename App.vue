<script setup>
import { onLaunch } from '@dcloudio/uni-app';
import {
  HIDE_LOADING,
  CONFIRM,
  GET_GLOBAL,
  SET_GLOBAL,
  GET_STORAGE,
} from '@/utils/index';
import {
  CHECK_LOGIN_STATE,
  FETCH_ICONS,
  FETCH_LANG_TYPE,
  FETCH_LANG_DATA_NOT_RELAUNCH_TO,
} from '@/utils/jcodePlatform';
import { START_TOKEN_AUTO_REFRESH } from '@/utils/http';

// 小程序：onLaunch 仅启动时调用一次
// H5/App：onLaunch 打开网页/用户点刷新/代码热更新时均会调用；
// 考虑到用户刷新网页时会丢失全局数据、页面栈、页面数据等，因此直接跳回首页即可

onLaunch(async (param) => {
  // 从本地存储恢复 token，确保后续预加载请求能携带认证信息
  const token = GET_GLOBAL('token') || GET_STORAGE('token');
  if (token && token !== 'null' && token !== 'undefined') {
    SET_GLOBAL('token', token);
    // H5 刷新浏览器后，内存中的全局数据（loginUser 等）会丢失。
    // 这里把登录态整体恢复回来，否则直接刷新到子页面（如聊天页）会因为拿不到
    // loginUser 而报错。CHECK_LOGIN_STATE 内部会在缺少 loginUser 时重新拉取用户信息。
    await CHECK_LOGIN_STATE();
    // 双 token：恢复访问令牌主动续期（存在刷新令牌时生效）
    START_TOKEN_AUTO_REFRESH();
  }

  // #ifdef MP-WEIXIN
  // 小程序端，处理更新
  // 目前只有微信小程序有更新管理器 getUpdateManager
  const updateManager = uni.getUpdateManager();
  updateManager.onUpdateReady(() => {
    HIDE_LOADING();
    CONFIRM('更新提示', '小程序新版本已准备好，是否更新应用？', true).then(
      (confirm) => {
        if (confirm) {
          updateManager.applyUpdate();
        }
      },
    );
  });
  // #endif

  // 加载图标
  await FETCH_ICONS();
  // 加载语言类型
  await FETCH_LANG_TYPE();
  await FETCH_LANG_DATA_NOT_RELAUNCH_TO();
});
</script>
<style lang="scss">
@import '@/uni_modules/uni-scss/index.scss';
@import '@/components/jcode-mpui/styles/index.scss';
@import '@/common/style/index.scss';
</style>
