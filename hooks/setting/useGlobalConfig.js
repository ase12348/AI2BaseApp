import { computed } from "vue";
import {
  API as getApi,
  DEV as getDev,
  APP_VERSION as getAppVersion,
  APP_EDITION as getAppEdition,
  PLATFORM as getPlatform,
  PLATFORM_TEXT as getPlatformText,
} from "@/utils/index";

// 全局配置（计算属性形式）
// 模板中可直接使用：{{ APP_VERSION }}、{{ APP_VERSION_TEXT }}、{{ PLATFORM_TEXT }}
// 脚本中使用：API.value、DEV.value
export function useGlobalConfig() {
  const API = computed(() => getApi.value);
  const DEV = computed(() => getDev());
  const APP_VERSION = computed(() => getAppVersion());
  // 带版本标识的完整版本文案，如「3.3.0 社区版」（与 Web 端「关于」弹窗一致）
  const APP_VERSION_TEXT = computed(() => {
    const edition = getAppEdition();
    return edition ? `${APP_VERSION.value} ${edition}` : APP_VERSION.value;
  });
  const PLATFORM = computed(() => getPlatform());
  const PLATFORM_TEXT = computed(() => getPlatformText());

  return {
    API,
    DEV,
    APP_VERSION,
    APP_VERSION_TEXT,
    PLATFORM,
    PLATFORM_TEXT,
  };
}
