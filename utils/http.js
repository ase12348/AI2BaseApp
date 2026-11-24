import {
  $t,
  CLEAR_GLOBAL,
  GET_GLOBAL,
  SET_GLOBAL,
  GET_STORAGE,
  SET_STORAGE,
  LOADING,
  HIDE_LOADING,
  RELAUNCH_TO,
  TOAST,
  AesDecrypt,
  URL_QUERY,
  PATH,
  API,
} from "./index";
import { GET_LANG_MAIN_TYPE, GET_LANG_TYPE } from "./jcodePlatform";

/**
 * http 和 文件 请求方法
 */

/**
 * 双 token 相关（访问令牌 60 分钟 + 刷新令牌）
 * 令牌同时写 uni 全局与本地缓存：H5 刷新会丢全局数据，必须能从缓存回灌。
 */
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const TOKEN_EXPIRES_KEY = "tokenExpiresAt";
const REFRESH_EXPIRES_KEY = "refreshTokenExpiresAt";
/** 携带刷新令牌的请求头（与后端 AuthTokenConstants.RefreshTokenHeader 一致） */
const REFRESH_TOKEN_HEADER = "X-Refresh-Token";
/** 主动续期：访问令牌到期前 5 分钟 */
const REFRESH_AHEAD_MS = 5 * 60 * 1000;
/** 上传/下载等一次性请求提前 1 分钟续期 */
const URL_TOKEN_GUARD_MS = 60 * 1000;

/** single-flight：并发 4011 共用同一个刷新 Promise */
let refreshPromise = null;
let refreshTimer = null;

const lr_readAuthValue = (key) => {
  const val = GET_GLOBAL(key);
  if (val !== undefined && val !== null && val !== "") {
    return val;
  }
  return GET_STORAGE(key);
};

const lr_isTokenValue = (val) => !!val && val !== "null" && val !== "undefined";

const lr_setAuthValue = (key, val) => {
  SET_GLOBAL(key, val);
  SET_STORAGE(key, val);
};

/** 取当前访问令牌（全局 → 本地缓存） */
export const GET_ACCESS_TOKEN = () => {
  const val = lr_readAuthValue(TOKEN_KEY);
  return lr_isTokenValue(val) ? val : "";
};

/** 取刷新令牌 */
export const GET_REFRESH_TOKEN = () => {
  const val = lr_readAuthValue(REFRESH_TOKEN_KEY);
  return lr_isTokenValue(val) ? val : "";
};

const lr_stopAutoRefresh = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

const lr_scheduleAutoRefresh = () => {
  lr_stopAutoRefresh();
  const expiresAt = Number(lr_readAuthValue(TOKEN_EXPIRES_KEY) || 0);
  if (!expiresAt || !GET_REFRESH_TOKEN()) {
    return;
  }
  const delay = Math.max(expiresAt - Date.now() - REFRESH_AHEAD_MS, 0);
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    REFRESH_ACCESS_TOKEN().then((ok) => ok && lr_scheduleAutoRefresh());
  }, delay);
};

/** 应用启动时恢复主动续期（App.vue onLaunch 调用） */
export const START_TOKEN_AUTO_REFRESH = () => {
  lr_scheduleAutoRefresh();
};

/** 登录/续期成功后保存令牌对与到期时间 */
export const SAVE_AUTH_TOKEN = (data) => {
  if (!data || !data.token) {
    return;
  }
  const now = Date.now();
  lr_setAuthValue(TOKEN_KEY, data.token);
  if (data.refreshToken) {
    lr_setAuthValue(REFRESH_TOKEN_KEY, data.refreshToken);
  }
  lr_setAuthValue(
    TOKEN_EXPIRES_KEY,
    data.expiresIn ? now + Number(data.expiresIn) * 1000 : 0
  );
  lr_setAuthValue(
    REFRESH_EXPIRES_KEY,
    data.refreshExpiresIn ? now + Number(data.refreshExpiresIn) * 1000 : 0
  );
  lr_scheduleAutoRefresh();
};

/** 清空本地登录令牌（不通知服务端） */
export const CLEAR_AUTH_TOKEN = () => {
  [TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRES_KEY, REFRESH_EXPIRES_KEY].forEach(
    (key) => {
      SET_GLOBAL(key, null);
      SET_STORAGE(key, null);
    }
  );
  lr_stopAutoRefresh();
};

/**
 * 用刷新令牌换新令牌对
 * @returns Promise<boolean> 是否换到了新令牌
 */
export const REFRESH_ACCESS_TOKEN = () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = GET_REFRESH_TOKEN();
  if (!refreshToken) {
    return Promise.resolve(false);
  }

  // 本地已知刷新令牌过期，不必再发请求
  const refreshExpiresAt = Number(lr_readAuthValue(REFRESH_EXPIRES_KEY) || 0);
  if (refreshExpiresAt && refreshExpiresAt <= Date.now()) {
    return Promise.resolve(false);
  }

  const task = new Promise((resolve) => {
    uni.request({
      url: lr_handleUrl("login/refresh"),
      method: "POST",
      header: {
        [REFRESH_TOKEN_HEADER]: refreshToken,
        "Content-Type": "application/json;charset=UTF-8",
      },
      success: (res) => {
        const body = res && res.data;
        if (res.statusCode === 200 && body && Number(body.code) === 200) {
          let data = body.data;
          // 与 lr_handleResult 保持一致：后台开启 ApiDataAes 时信封为 { s: 1, data: 密文 }
          if (Number(body.s) === 1 && typeof data === "string") {
            try {
              data = JSON.parse(AesDecrypt(data, "jcodeapi"));
            } catch (e) {
              data = null;
            }
          }
          if (data && data.token) {
            SAVE_AUTH_TOKEN(data);
            resolve(true);
            return;
          }
        }
        resolve(false);
      },
      fail: () => resolve(false),
    });
  });

  refreshPromise = task.then(
    (ok) => {
      refreshPromise = null;
      return ok;
    },
    () => {
      refreshPromise = null;
      return false;
    }
  );
  return refreshPromise;
};

/** 上传/下载等把 token 放在 URL 或 header 的一次性请求，先确保令牌未过期 */
export const ENSURE_ACCESS_TOKEN = async () => {
  const token = GET_ACCESS_TOKEN();
  const expiresAt = Number(lr_readAuthValue(TOKEN_EXPIRES_KEY) || 0);
  if (token && (!expiresAt || expiresAt - Date.now() > URL_TOKEN_GUARD_MS)) {
    return token;
  }
  if (!token && !GET_REFRESH_TOKEN()) {
    return "";
  }
  const ok = await REFRESH_ACCESS_TOKEN();
  return ok ? GET_ACCESS_TOKEN() : token;
};

/** 退出登录：先作废服务端会话，再清本地令牌 */
export const LOGOUT_AUTH = async () => {
  const refreshToken = GET_REFRESH_TOKEN();
  CLEAR_AUTH_TOKEN();
  if (!refreshToken) {
    return;
  }
  await new Promise((resolve) => {
    uni.request({
      url: lr_handleUrl("login/logout"),
      method: "POST",
      header: {
        [REFRESH_TOKEN_HEADER]: refreshToken,
      },
      timeout: 3 * 1000,
      complete: () => resolve(),
    });
  });
};

// 封装的 GET 请求，集成了验证信息
// 返回请求结果或 null
// 对网络错误、返回错误码、登录状态失效等情况做了相应处理
//   url 为请求地址
//   params 为请求附带的提交数据
//   errorTips 为出现错误时出现的 TOAST 文字
const HTTP_GET = async ({ url, params, errorTips, callback }) => {
  try {
    const res = await lr_request(url, params, null, "GET");
    const result = lr_handleResult(url, null, res, errorTips);
    callback && callback(result);
    return result;
  } catch (err) {
    const result = lr_handleResult(url, err, null, errorTips);
    callback && callback(result);
    return result;
  }
};

// 封装的 POST 请求，集成了验证信息
// 返回请求结果或 null
// 对网络错误、返回错误码、登录状态失效等情况做了相应处理
//   url 为请求地址
//   data 为请求附带的提交数据
//   errorTips 为出现错误时出现的 TOAST 文字
const HTTP_POST = async ({ url, data, params, errorTips, callback }) => {
  url = lr_params_url(url, params);

  try {
    const res = await lr_request(url, data, null, "POST");
    const result = lr_handleResult(url, null, res, errorTips);
    callback && callback(result);
    return result;
  } catch (err) {
    const result = lr_handleResult(url, err, null, errorTips);
    callback && callback(result);
    return result;
  }
};
// 封装的 PUT 请求，集成了验证信息
// 返回请求结果或 null
// 对网络错误、返回错误码、登录状态失效等情况做了相应处理
//   url 为请求地址
//   data 为请求附带的提交数据
//   errorTips 为出现错误时出现的 TOAST 文字
const HTTP_PUT = async ({ url, data, params, errorTips, callback }) => {
  url = lr_params_url(url, params);

  try {
    const res = await lr_request(url, data, null, "PUT");
    const result = lr_handleResult(url, null, res, errorTips);
    callback && callback(result);
    return result;
  } catch (err) {
    const result = lr_handleResult(url, err, null, errorTips);
    callback && callback(result);
    return result;
  }
};

// 封装的 DELETE 请求，集成了验证信息
// 返回请求结果或 null
// 对网络错误、返回错误码、登录状态失效等情况做了相应处理
//   url 为请求地址
//   data 为请求附带的提交数据
//   errorTips 为出现错误时出现的 TOAST 文字
const HTTP_DELETE = async ({ url, data, params, errorTips, callback }) => {
  url = lr_params_url(url, params);

  try {
    const res = await lr_request(url, data, null, "DELETE");
    const result = lr_handleResult(url, null, res, errorTips);
    callback && callback(result);
    return result;
  } catch (err) {
    const result = lr_handleResult(url, err, null, errorTips);
    callback && callback(result);
    return result;
  }
};

// 封装的文件上传，集成了验证信息
// 返回接口返回值或 null
// 对网络错误、返回错误码、登录状态失效等情况做了相应处理
//   url 为请求地址
//   filePath 为临时文件的路径
//   formData 为请求附带的提交数据
const HTTP_UPLOAD = async (url, filePath, formData) => {
  try {
    const res = await UPLOAD(url, filePath, formData);
    return lr_handleResult(url, null, res);
  } catch (err) {
    return lr_handleResult(url, err, null);
  }
};

// 封装的文件下载（下载后为临时文件），集成了身份验证
// 返回接口返回值或 null
const HTTP_DOWNLOAD = async (id, formData) => {
  const url = `/annexes/down?fileId=${id}`;
  try {
    const res = await DOWNLOAD(url, formData);
    return lr_handleResult(url, null, res);
  } catch (err) {
    return lr_handleResult(url, err, null);
  }
};

// 发起一个 GET 请求，封装了身份验证
//   url 为请求地址
//   data 为请求附带的提交数据
// 返回结果是一个数组： [error, result]
//   error 表示错误，一般是网络错误，请求很可能根本没有发出
//   result 包含 { statusCode, headers, data } 分别表示状态码、响应头、数据
const GET = async (url, data, header) => {
  return await lr_request(url, data, header, "GET");
};

// 发起一个 POST 请求，封装了身份验证
//   url 为请求地址
//   data 为请求附带的提交数据
// 返回结果是一个数组： [error, result]
//   error 表示错误，一般是网络错误，请求很可能根本没有发出
//   result 包含 { statusCode, headers, data } 分别表示状态码、响应头、数据
const POST = async (url, data, header) => {
  return await lr_request(url, data, header, "POST");
};

// 上传一个文件 （本地临时文件），封装了身份验证
//   url 为提交地址
//   filePath 为本地临时文件路径
//   formData 为上传时附带的参数
// 返回结果是一个数组： [error, result]
//   error 表示错误，一般是网络错误，请求很可能根本没有发出
//   result 包含 { statusCode, data } 分别表示状态码、接口返回的数据
const UPLOAD = async (url, filePath, formData) => {
  const uploadUrl = lr_handleUrl(url);
  // 上传用 uni.uploadFile 直连，拿不到 4011 重试，先确保令牌未过期
  const header = {
    token: await ENSURE_ACCESS_TOKEN(),
  };

  // #ifdef MP-DINGTALK
  return new Promise((res, rej) => {
    dd.uploadFile({
      url: uploadUrl,
      filePath,
      header,
      formData,
      fileName: "file",
      fileType: "image",
      success: (dt) => {
        dt.data = JSON.parse(dt.data);
        res(dt);
      },
      fail: (rs) => {
        rej(rs);
      },
    });
  });
  // #endif

  // #ifndef MP-DINGTALK
  return uni
    .uploadFile({
      url: uploadUrl,
      header,
      filePath,
      formData,
      name: "file",
      fileType: "image",
    })
    .then((result) => {
      result.data = JSON.parse(result.data);
      return result;
    });
  // #endif
};

// 下载一个文件（下载后为临时文件），封装了身份验证
//   url 为请求的地址
//   formData 为请求时附带的参数
// 返回结果是一个数组： [error, result]
//   error 表示错误，一般是网络错误，请求很可能根本没有发出
//   result 包含 { statusCode, tempFilePath } 分别表示状态码、下载后的临时文件路径
const DOWNLOAD = async (url, formData) => {
  let downloadUrl = lr_handleUrl(url);
  const header = {
    token: await ENSURE_ACCESS_TOKEN(),
  };
  downloadUrl = downloadUrl + "?" + URL_QUERY(formData);

  return uni
    .downloadFile({
      url: downloadUrl,
      header,
    })
    .then((result) => {
      result.data = {
        data: result.tempFilePath,
      };
      result.statusCode = 200;
      return result;
    });
};

// 【内部方法】处理请求 url，判断是否需要添加后台地址前缀
const lr_handleUrl = (url) => {
  let result = url;
  if (result.startsWith("http://") || result.startsWith("https://")) {
    return result;
  }
  if (!result.startsWith("/")) {
    result = "/" + result;
  }
  if (!result.startsWith(API.value)) {
    result = API.value + result;
  }
  return result;
};

// 【内部方法】处理请求params参数
const lr_params_url = (url, params) => {
  if (params) {
    if (url.indexOf("?") == -1) {
      url += "?";
    } else {
      url += "&";
    }
    for (const key in params) {
      url += `${key}=${params[key]}&`;
    }
    url = url.substring(0, url.length - 1);
  }
  return url;
};

// 【内部方法】HTTP 请求基础方法
const lr_requestBase = async (url, data, header, method = "GET") => {
  const requestUrl = lr_handleUrl(url);
  const token = GET_ACCESS_TOKEN();
  const requestHeader = header || {};

  if (token && token !== "undefined" && token !== "null") {
    requestHeader.token = token;
  }
  // 设置登录者岗位
  const loginUser = GET_GLOBAL("loginUser");
  if (loginUser && loginUser.postId) {
    requestHeader.jcodepostId = loginUser.postId;
  }

  // 多语言
  const mainLanguage = GET_LANG_MAIN_TYPE();
  const nowLanguage = GET_LANG_TYPE();
  if (mainLanguage != nowLanguage) {
    requestHeader.langType = nowLanguage;
    requestHeader.langMType = mainLanguage;
  }

  return uni.request({
    url: requestUrl,
    method,
    header: requestHeader,
    data: data,
  });
};

// 【内部方法】响应体是否为「访问令牌过期」（业务码 4011）
const lr_isTokenExpired = (result) =>
  !!result &&
  result.statusCode === 200 &&
  !!result.data &&
  Number(result.data.code) === 4011;

// 【内部方法】带 4011 自动续期并重试一次的请求
const lr_request = async (url, data, header, method = "GET") => {
  const result = await lr_requestBase(url, data, header, method);
  if (!lr_isTokenExpired(result)) {
    return result;
  }

  const ok = await REFRESH_ACCESS_TOKEN();
  if (!ok) {
    // 续期失败：把 4011 原样交给 lr_handleResult 统一清理登录态
    return result;
  }
  // 重试时请求头会重新取续期后的新令牌
  return await lr_requestBase(url, data, header, method);
};

// 【内部方法】处理网络请求方法的返回结果
const lr_handleResult = (url, err, result, tips) => {
  // 出现错误，一般是网络连接错误
  if (err || !result) {
    LOADING("");
    HIDE_LOADING();
    TOAST("网络请求失败，请检查您的网络连接");
    return null;
  }

  // 状态码为 410，登录状态失效
  if (result.statusCode === 410 || (result.data && result.data.code === 401)) {
    if (PATH() != "/pages/login") {
      LOADING("");
      HIDE_LOADING();
      TOAST("登录状态无效，正在跳转到登录页…");
      CLEAR_AUTH_TOKEN();
      CLEAR_GLOBAL();
      RELAUNCH_TO("/pages/login");
    }
    return null;
  }

  // 访问令牌过期且刷新令牌续期失败：清理登录态并回登录页
  if (lr_isTokenExpired(result)) {
    if (PATH() != "/pages/login") {
      LOADING("");
      HIDE_LOADING();
      TOAST("登录状态已过期，正在跳转到登录页…");
      CLEAR_AUTH_TOKEN();
      CLEAR_GLOBAL();
      RELAUNCH_TO("/pages/login");
    } else {
      CLEAR_AUTH_TOKEN();
    }
    return null;
  } else if (
    result.statusCode !== 200 ||
    (result.data && result.data.code !== 200)
  ) {
    LOADING("");
    HIDE_LOADING();
    const errInfo = (result.data && result.data.info) || `(${$t("未知原因")})`;
    if (tips) {
      const errTips = typeof tips === "string" ? tips : $t("请求数据时发生错误");
      TOAST(`${errTips}： ${errInfo}`);
    } else {
      TOAST(errInfo);
    }
    return null;
  }

  if (result.data.s === 1) {
    const res = JSON.parse(AesDecrypt(result.data.data, "jcodeapi"));
    // console.log(res,url)
    return res;
  }

  return result.data.data;
};
export {
  HTTP_GET,
  HTTP_POST,
  HTTP_PUT,
  HTTP_DELETE,
  UPLOAD,
  DOWNLOAD,
  HTTP_UPLOAD,
  HTTP_DOWNLOAD,
};
