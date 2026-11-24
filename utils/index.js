import moment from "moment";
import get from "lodash/get";
import mapValues from "lodash/mapValues";
import defaultConfig from "@/common/config.default.js";
import globalConfig from "@/config.js";

import cryptoJS from "@/common/aes.js";

export function WINDOWTOP() {
  return uni.getSystemInfoSync().windowTop;
}
export function SCREENHEIGHT() {
  return uni.getSystemInfoSync().windowHeight;
}
export function $t(label) {
  const data = GET_GLOBAL("lang_data") || {};
  return data[label] || label;
}
// 设置一个全局变量
export function SET_GLOBAL(key, val) {
  uni.$jcode.data[key] = val;
}

// 获取一个全局变量
export function GET_GLOBAL(key) {
  return uni.$jcode.data[key];
}

// 已下线功能的页面路径前缀：这些页面已随对应后端模块（流程、自定义表单等）一并移除
const REMOVED_PAGE_PREFIXES = [
  "/pages/workflow/",
  "/pages/customapp/",
  "/pages/home/desktop",
  "/pagesTest/",
  "/pagesTest1/",
  "/pagesGsptestparent/",
];
// 判断功能模块是否已下线：类型为自定义表单(2)/桌面(4)，或目标页面已删除
export function IS_MODULE_OFFLINE(module) {
  if (!module) {
    return true;
  }
  if (module.f_IsSystem == 2 || module.f_IsSystem == 4) {
    return true;
  }
  const url = module.f_Url || "";
  return REMOVED_PAGE_PREFIXES.some((prefix) => url.indexOf(prefix) === 0);
}

// 清空全局变量
export function CLEAR_GLOBAL() {
  const lang_data = GET_GLOBAL("lang_data");
  const lang_types = GET_GLOBAL("lang_types");
  const jcode_icon_list = GET_GLOBAL("jcode_icon_list");

  uni.$jcode.data = {
    lang_data,
    lang_types,
    jcode_datasource: {},
    jcode_icon_list,
  };
}

// 保存数据用于组件之间的通讯
export function SET_DATA(key, val) {
  uni.$jcode.data.jcode_datasource[key] = val;
}
export function SET_ALL_DATA(data) {
  uni.$jcode.data.jcode_datasource = data;
}
export function GET_DATA(key) {
  return uni.$jcode.data.jcode_datasource[key];
}
export function CLEAR_DATA() {
  uni.$jcode.data.jcode_datasource = {};
}

// 将数据写入本地缓存
export function SET_STORAGE(key, data) {
  if (data === null || data === undefined) {
    uni.removeStorageSync(key);
  } else {
    uni.setStorageSync(key, data);
  }
}
// 获取之前写入本地缓存的数据
export function GET_STORAGE(key) {
  return uni.getStorageSync(key);
}
// 清空本地缓存
export function CLEAR_STORAGE() {
  uni.clearStorageSync();
}

// 当前页面的路径
// 举例：登录页为 '/pages/login'
export function PATH() {
  if (!getCurrentPages) {
    return "";
  }
  const pages = getCurrentPages();

  return pages ? "/" + pages.slice(-1)[0].route : "";
}

// 从 /config.js 中获取某条配置项
// 如果在 /config.js 中获取不到，则前往 /common/config.default.js 中获取默认值
//   path 为配置项的访问路径
// 举例：
//   以下语句获取是否全局开启圆形头像
//   this.CONFIG('pageConfig.roundAvatar')
export function JCODE_CONFIG(path) {
  return get(globalConfig, path, get(defaultConfig, path));
}

// 监听一个全局事件
export function ON(name, func) {
  uni.$on(name, func);
}

// 仅单次监听一个全局事件
export function ONCE(name, func) {
  uni.$once(name, func);
}

// 触发一个全局事件
export function EMIT(name, data) {
  uni.$emit(name, data);
}

// 移除全局事件监听器
export function OFF(name, func) {
  uni.$off(name, func);
}
// 判断数据是否为空
export function isNullOrEmpty(val) {
  // 特殊判断
  if (val && parseInt(val) === 0) return false;
  const list = ["$parent"];
  if (typeof val === "boolean") {
    return false;
  }
  if (typeof val === "number") {
    return false;
  }
  if (val instanceof Array) {
    if (val.length === 0) return true;
  } else if (val instanceof Object) {
    val = DEEPCLONE(val);
    list.forEach((ele) => {
      delete val[ele];
    });
    for (var o in val) {
      return false;
    }
    return true;
  } else {
    if (
      val === "null" ||
      val == null ||
      val === "undefined" ||
      val === undefined ||
      val === ""
    ) {
      return true;
    }
    return false;
  }
  return false;
}

// 判断数据是否为空（极简搭原 VALIDATENULL）
export function VALIDATENULL(val) {
  // 特殊判断
  if (val && parseInt(val) === 0) return false;
  const list = ["$parent"];
  if (typeof val === "boolean") {
    return false;
  }
  if (typeof val === "number") {
    return false;
  }
  if (val instanceof Array) {
    if (val.length === 0) return true;
  } else if (val instanceof Object) {
    val = DEEPCLONE(val);
    list.forEach((ele) => {
      delete val[ele];
    });
    for (var o in val) {
      return false;
    }
    return true;
  } else {
    if (
      val === "null" ||
      val == null ||
      val === "undefined" ||
      val === undefined ||
      val === ""
    ) {
      return true;
    }
    return false;
  }
  return false;
}

// 验证表单数据（form 可为 ref 或组件实例）
export function VALIDATEFORM(form) {
  return new Promise((resolve) => {
    const formVm = form && form.value ? form.value : form;
    if (!formVm || !formVm.validate) {
      resolve({
        err: null,
      });
    }
    formVm
      .validate()
      .then((formData) => {
        resolve({
          formData,
          err: null,
        });
      })
      .catch((err) => {
        resolve({
          formData: null,
          err,
        });
      });
  });
}

// 展示提示框
//   title 为提示文字
//   mask 为是否禁止点击
//   icon 为显示图标,可以改为 'success'
export function TOAST(title, icon = "none", mask = false) {
  uni.showToast({
    title: $t(title),
    icon,
    mask,
  });
}
// 停止展示 toast 提示框
export function HIDE_TOAST() {
  uni.hideToast();
}

// 显示 loading 提示框
//   title 为提示文字
//   mask 为是否禁止点击
export function LOADING(title, mask = true) {
  uni.showLoading({
    title: $t(title),
    mask,
  });
}
// 停止展示 loading 提示框
export function HIDE_LOADING() {
  uni.hideLoading();
}
// 展示确认提示框
//   title 为标题
//   content 为提示框文字内容
//   showCancel 为是否显示取消按钮
// 返回一个结果，true 或 false，表示用户是否确认
export async function CONFIRM(title, content, showCancel = false) {
  return new Promise((res) => {
    uni.showModal({
      title: $t(title),
      content: $t(content),
      showCancel,
      success: ({ confirm }) => {
        res(confirm);
      },
      fail: () => {
        res(false);
      },
    });
  });
}

// 生成一个32位 GUID 随机字符串
//   joinChar 为分割符，默认为下划线
export function GUID(joinChar = "-") {
  return `xxxxxxxx${joinChar}xxxx${joinChar}4xxx${joinChar}yxxx${joinChar}xxxxxxxxxxxx`.replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;

      return v.toString(16);
    }
  );
}

// 获取指定字符串的 MD5 码
export function MD5(val = "") {
  return cryptoJS.MD5(val).toString();
}

const aesKey = (key) => {
  const length = key.length;
  if (length < 32) {
    for (let i = 0, len = 32 - length; i < len; i++) {
      key += "0";
    }
    return key;
  } else {
    return key.substring(0, 32);
  }
};
export function AesDecrypt(source, key) {
  key = cryptoJS.enc.Utf8.parse(aesKey(key)); //32位
  let iv = cryptoJS.enc.Utf8.parse("1234567890000000"); //16位
  let decrypted = cryptoJS.AES.decrypt(source, key, {
    iv: iv,
    mode: cryptoJS.mode.CBC,
    padding: cryptoJS.pad.Pkcs7,
  });
  const res = decrypted.toString(cryptoJS.enc.Utf8);

  return res;
}

// 将一个对象编码并转化为 url 查询字符串
//   obj 为要转换的对象，值为空则会被忽略，值为对象会被转为 JSON 字符串
//   auth 为是否编入身份验证信息
export function URL_QUERY(obj, auth = false) {
  let queryObject = obj || {};
  if (typeof obj === "string") {
    queryObject = {
      data: obj,
    };
  }

  if (auth) {
    Object.assign(queryObject, {
      token: GET_GLOBAL("token"),
    });
  }

  return Object.entries(queryObject)
    .filter(([k, v]) => k && v)
    .map(
      ([k, v]) =>
        encodeURIComponent(k) +
        "=" +
        encodeURIComponent(typeof v === "object" ? JSON.stringify(v) : v)
    )
    .join("&");
}

// 将字符串转化为 HTML 格式 （处理表单页面的 HTML）
export function CONVERT_HTML(str) {
  if (!str) {
    return "";
  }

  return str
    .replace(
      /{@zuojian@}|{@youjian@}|{@and@}/g,
      (tag) =>
        ({
          "{@zuojian@}": "<",
          "{@youjian@}": ">",
          "{@and@}": "&",
        }[tag] || tag)
    )
    .replace(
      /&amp;|&lt;|&gt;|&#39;|&quot;/g,
      (tag) =>
        ({
          "&amp;": "&",
          "&lt;": "<",
          "&gt;": ">",
          "&#39;": "'",
          "&quot;": '"',
        }[tag] || tag)
    );
}

// 设置页面标题
export function SET_TITLE(title) {
  uni.setNavigationBarTitle({
    // $t(undefined) 会返回 undefined，uni H5 对 title 做严格类型校验（新版会直接报错），
    // 这里兜底为空串保证类型安全
    title: $t(title) || "",
  });
}

// 暂存一个跨页面变量 （与 GET_PARAM 成对使用）
export function SET_PARAM(val) {
  SET_GLOBAL("pageParam", val);
}

// 获取之前暂存的跨页面变量 （与 SET_PARAM 成对使用）
export function GET_PARAM() {
  return GET_GLOBAL("pageParam");
}

// 跳转
// 进入某个页面
export function NAV_TO(url, param, usePageParam = false) {
  uni.navigateTo({
    url: lr_handleNav(url, param, usePageParam),
  });
}

// 进入某个Layer页面,
export function NAV_TO_LAYER(url, param, usePageParam = true) {
  uni.navigateTo({
    url: lr_handleNav(url, param, usePageParam),
  });
}

// 返回上个页面
//   delta 参数为返回的次数
export function NAV_BACK(delta = 1) {
  uni.navigateBack({
    delta,
  });
}

// 跳转到某个页面，跳转后无法返回
export function JUMP_TO(url, param, usePageParam = false) {
  uni.redirectTo({
    url: lr_handleNav(url, param, usePageParam),
  });
}
// 跳转到某个页面，跳转后无法返回,可携带路径参数和页面参数
export function JUMP_TO_Param(url, param, usePageParam = true, routeParam) {
  uni.redirectTo({
    url: lr_handleNav(url, param, usePageParam, routeParam),
  });
}

// 转到某个 Tab 页
export function TAB_TO(url, param) {
  uni.switchTab({
    url: lr_handleNav(url, param),
  });
}

// 重启应用，跳转到指定页面
export function RELAUNCH_TO(url) {
  uni.reLaunch({
    url,
  });
}

// 深拷贝
export function DEEPCLONE(data) {
  var type = lr_getObjType(data);
  var obj;
  if (type === "array") {
    obj = [];
  } else if (type === "object") {
    obj = {};
  } else {
    // 不再具有下一层次
    return data;
  }
  if (type === "array") {
    for (var i = 0, len = data.length; i < len; i++) {
      data[i] = (() => {
        if (data[i] === 0) {
          return data[i];
        }
        return data[i];
      })();
      if (data[i]) {
        delete data[i].$parent;
      }
      obj.push(DEEPCLONE(data[i]));
    }
  } else if (type === "object") {
    for (var key in data) {
      if (data) {
        delete data.$parent;
      }
      obj[key] = DEEPCLONE(data[key]);
    }
  }
  return obj;
}

// 深拷贝
export function COPY(data) {
  return DEEPCLONE(data);
}

// 树型数据转化成数组数据
export function TREE_TO_ARRAY(arr, res) {
  arr.forEach((t) => {
    const children = t.children;
    delete t.children;
    res.push(t);
    if (children) {
      TREE_TO_ARRAY(children, res);
    }
  });
}
// 获取树形数据
export function TOTREE(data, idKey, pidKey, valueKey, labelKey) {
  // 数据去重根据value值
  const _data = [];
  let _dataMap = {};
  data.forEach((item) => {
    if (!_dataMap[item[valueKey]]) {
      _dataMap[item[valueKey]] = true;
      _data.push(DEEPCLONE(item));
    }
  });
  _dataMap = null;

  if (idKey == pidKey) {
    const res = [];
    _data.forEach((item) => {
      item.value = item[valueKey];
      item.label = item[labelKey];
      res.push(item);
    });
    return res;
  }

  const allList = lr_getGroupMap(_data, idKey, pidKey);
  return lr_getTree(null, allList, idKey, valueKey, labelKey);
}

// 时间格式化
export function DATEFORMAT(value, format, myFormat) {
  if (format) {
    format = format.replace(/y/g, "Y");
    format = format.replace(/d/g, "D");
  }

  if (myFormat) {
    myFormat = myFormat.replace(/y/g, "Y");
    myFormat = myFormat.replace(/d/g, "D");
  }

  return moment(value, myFormat).format(format || "YYYY-MM-DD HH:mm:ss");
}
export function DATE_DIFF(time1, time2) {
  return moment(time1).diff(time2);
}

// 获取当前时间
export function DATENOW(format) {
  return moment().format(format || "YYYY-MM-DD HH:mm:ss");
}
export function DATENOW_DIFF(time) {
  return moment().diff(time);
}

// 将时间日期转化为特定格式 （一般用于 <l-list-item>）
//   datetimeString 为要格式化的日期时间字符串
// 返回值是一个数组，它也可以当做字符串直接使用
// 举例：
//   如果日期是当天，则返回 ['今天 17:32']       或者 '今天 17:32'
//   如果日期是今年，则返回 ['6月8日', '17:32']  或者 '6月8日 17:32'
//   如果日期不是今年，返回 ['2018-06-08']      或者 '2018-06-08'
export function TABLEITEM_DATEFORMAT(datetimeString, format = "YYYY-MM-DD") {
  const dt = moment(datetimeString);
  let result = [];

  if (!dt.isValid()) {
    result.toString = () => "";
    return result;
  }

  const now = moment();

  if (dt.isSame(now, "day")) {
    result = [`${$t("今天")} ${dt.format("HH:mm")}`];
    result.toString = () => `${$t("今天")} ${dt.format("HH:mm")}`;
  } else if (dt.isSame(now, "year")) {
    result = [dt.format("M月D日"), dt.format("HH:mm")];
    result.toString = () => dt.format("M月D日") + " " + dt.format("HH:mm");
  } else {
    result = [dt.format(format)];
    result.toString = () => dt.format(format);
  }

  return result;
}
// 格式化数据显示，将value值转化成name
export function FORMAT_NAME(data, value, valueKey, labelKey) {
  data = data || [];
  if (data.length == 0) {
    return "";
  }

  value = (value || "") + "";

  const valueList = value.split(",");
  const list = [];

  valueList.forEach((vitem) => {
    const item = data.find((item) => {
      return item[valueKey] == vitem;
    });
    if (item) {
      list.push(item[labelKey]);
    }
  });

  return String(list);
}

// 获取js脚本
export function JCODE_EVAL(str) {
  if (eval) {
    console.log(str, "JCODE_EVAL");
    return eval(str);
  }
}

// 获取js方法

export function GET_FUNCTION(funStr) {
  if (!isNullOrEmpty(funStr)) {
    try {
      funStr = `async(jcode) => {${funStr}}`;
      const fn = JCODE_EVAL(funStr);
      if (typeof fn === "function") {
        return {
          res: true,
          msg: "ok",
          fn,
        };
      } else {
        return {
          res: false,
          msg: $t("此方法不是一个函数"),
        };
      }
    } catch (err) {
      return {
        res: false,
        msg: err,
      };
    }
  } else {
    return {
      res: false,
      msg: $t("没设置脚本函数"),
    };
  }
}
// 注意：原 Vue2 mixin 的 BUTTONS_CLICK({prop}) 是把按钮 prop 转调**页面自己的** handle${prop} 方法：
//   this[`handle${prop}`] && this[`handle${prop}`]()
// Vue3 <script setup> 的 utils 无法触达页面局部函数，该全局分发**无法移植**，已删除。
// 需要的页面各自定义本地分发器：
//   const BUTTONS_CLICK = function({ prop }) {
//     const fn = { handleEdit, handleDetails, handleDelete }[`handle${prop}`]
//     if (fn) fn()
//   }

// 用于编码小程序分享消息的 url 查询字符串
//   pageParam 为点击分享消息跳转时携带的 pageParam
//   query 为点击分享消息跳转时携带的 query
//   pagePath 点击分享消息跳转到小程序的页面 (默认为当前页)
// 返回编码好的查询字符串
export function MP_SHARE_ENCODE(pageParam, query, pagePath) {
  const loginUser = GET_GLOBAL("loginUser");
  const shareObj = {
    fromUser: loginUser ? loginUser.userId : "",
    fromPlatform: PLATFORM(),
    timestamp: new Date().valueOf(),
    pagePath: pagePath || PATH(),
    query: query,
    pageParam,
    jcode: JCODE_CONFIG("appVersion") || "",
  };
  const result = URL_QUERY(shareObj);

  if (DEV()) {
    console.log("【您正在分享极简搭小程序页面】");
    console.log("====分享对象：====");
    console.log(shareObj);
    console.log("====启动路径：====");
    console.log("/pages/home");
    console.log("====启动参数：====");
    console.log(result);
    console.log("====(以上消息仅开发模式可见)====");
  }

  return result;
}

// 解析小程序分享字符串 （会自动适配微信小程序的 url 编码）
export function MP_SHARE_DECODE(info) {
  let shareInfo;
  // 微信小程序中获取的分享信息是被 uri 编码过的，需要解码
  // 支付宝/钉钉小程序不需要解码
  // #ifdef MP-WEIXIN
  shareInfo = mapValues(info, decodeURIComponent);
  // #endif
  // #ifndef MP-WEIXIN
  shareInfo = info;
  // #endif

  shareInfo.pageParam = shareInfo.pageParam
    ? JSON.parse(shareInfo.pageParam)
    : undefined;
  shareInfo.query = shareInfo.query
    ? JSON.parse(shareInfo.query)
    : undefined;

  if (DEV()) {
    console.log("【您通过小程序消息分享启动了极简搭小程序】");
    console.log("====小程序分享对象：====");
    console.log(shareInfo);
    console.log("====即将转入页面：====");
    console.log(shareInfo.pagePath);
    console.log("====设置的 url query：====");
    console.log(shareInfo.query);
    console.log("====设置的 pageParam：====");
    console.log(shareInfo.pageParam);
    console.log("====(以上消息仅开发模式可见)====");
  }

  SET_GLOBAL("pageParam", shareInfo.pageParam);
  uni.navigateTo({
    url: `${shareInfo.pagePath}?${URL_QUERY(shareInfo.query)}`,
  });
}

// 从对象中按大小写不敏感的方式获取值
export function GET_VALUE(data, key) {
  if (data && key) {
    let value = undefined;
    for (let _key in data) {
      if (_key.toLowerCase() == key.toLowerCase()) {
        value = data[_key];
        break;
      }
    }
    return value;
  } else {
    return undefined;
  }
}

// 获取当前定位（返回百度坐标系）
export function GET_LOCATION() {
  return new Promise((res) => {
    uni.getLocation({
      type: "gcj02",
      success: (data) => {
        console.log("test success");
        const lngAndlat = lr_toBaiDuLngAndLat(data.longitude, data.latitude);
        res({
          lat: lngAndlat.lat, // 纬度
          lng: lngAndlat.lng, // 经度
          accuracy: data.accuracy, // 位置的精确度
        });
      },
      fail: () => {
        console.log("test fail");
        res(null);
      },
    });
  });
}

// 数组分页
export function PAGINATION(pageNo, pageSize, array) {
  var offset = (pageNo - 1) * pageSize;
  return offset + pageSize >= array.length
    ? array.slice(offset, array.length)
    : array.slice(offset, offset + pageSize);
}

// 【内部方法】获取对象类型
export function lr_getObjType(obj) {
  var toString = Object.prototype.toString;
  var map = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regExp",
    "[object Undefined]": "undefined",
    "[object Null]": "null",
    "[object Object]": "object",
  };
  return map[toString.call(obj)];
}
// 【内部方法】获取数据集合
export function lr_getGroupMap(data, idKey, pidKey) {
  const groupList = {};
  const map = {};
  data.forEach((item) => {
    groupList[item[pidKey]] = groupList[item[pidKey]] || [];
    groupList[item[pidKey]].push(item);
    map[item[idKey]] = item;
  });
  return {
    group: groupList,
    map: map,
  };
}
// 【内部方法】获取数据集合
export function lr_getTree(data, allList, idKey, valueKey, labelKey) {
  const res = [];
  if (data == null) {
    for (const id in allList.group) {
      if (!allList.map[id]) {
        const list = allList.group[id];
        list.forEach((item2) => {
          item2.value = item2[valueKey];
          item2.label = item2[labelKey];
          if (
            allList.group[item2[idKey]] &&
            allList.group[item2[idKey]].length > 0
          ) {
            item2.children = lr_getTree(
              allList.group[item2[idKey]],
              allList,
              idKey,
              valueKey,
              labelKey
            );
          }
          res.push(item2);
        });
      }
    }
  } else {
    data.forEach((item) => {
      item.value = item[valueKey];
      item.label = item[labelKey];
      if (allList.group[item[idKey]] && allList.group[item[idKey]].length > 0) {
        item.children = lr_getTree(
          allList.group[item[idKey]],
          allList,
          idKey,
          valueKey,
          labelKey
        );
      }
      res.push(item);
    });
  }
  return res;
}

// 【内部方法】GPS 坐标转百度坐标
export function lr_toBaiDuLngAndLat(lng, lat) {
  if (lng == null || lng == "" || lat == null || lat == "")
    return { lng: lng, lat: lat };
  let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
  let x = lng;
  let y = lat;
  let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  let lngs = z * Math.cos(theta) + 0.0065;
  let lats = z * Math.sin(theta) + 0.006;
  return { lng: lngs, lat: lats };
}

// 【内部方法】处理页面跳转 url 和参数
export function lr_handleNav(url, param, usePageParam, routeParam) {
  let query = "";
  SET_PARAM(undefined);
  if (param && usePageParam) {
    SET_PARAM(param);
  } else if (param && !usePageParam) {
    let str = "?";
    if (url.includes("?")) {
      str = "&";
    }
    query +=
      str +
      Object.entries(param)
        .filter(([k, v]) => k && !isNullOrEmpty(v))
        .map(([k, v]) => k + "=" + v)
        .join("&");
  }
  if (routeParam) {
    let str = "?";
    if (url.includes("?") || query.includes("?")) {
      str = "&";
    }
    query +=
      str +
      Object.entries(routeParam)
        .filter(([k, v]) => k && !isNullOrEmpty(v))
        .map(([k, v]) => k + "=" + v)
        .join("&");
  }
  return url + query;
}


// ===== 以下为原 mixin 的 computed，转为可用函数/对象 =====

// 当前是否为开发环境
export function DEV() {
  return process.env.NODE_ENV === 'development';
}

// 请求后台接口的地址（供 utils/http.js 使用：API.value）
export const API = {
  get value() {
    return (
      GET_GLOBAL('apiRoot') ||
      JCODE_CONFIG('apiHost')[
        DEV() ? JCODE_CONFIG('devApiHostIndex') : JCODE_CONFIG('prodApiHostIndex')
      ]
    );
  },
};

// 获取当前移动端版本号 （定义在 config.js）
export function APP_VERSION() {
  return JCODE_CONFIG('appVersion');
}

// 获取当前移动端版本标识，如「社区版」（定义在 config.js，可与 Web 端 edition 保持一致）
export function APP_EDITION() {
  return JCODE_CONFIG('edition') || '';
}

// 当前运行平台
// 取值 'alipay'/'weixin'/'dingtalk'/'h5'/'app'/'unknow'
export function PLATFORM() {
  let result = 'unknow';
  // #ifdef MP-ALIPAY
  // #ifndef MP-DINGTALK
  result = 'alipay';
  // #endif
  // #ifdef MP-DINGTALK
  result = 'dingtalk';
  // #endif
  // #endif
  // #ifdef MP-WEIXIN
  result = 'weixin';
  // #endif
  // #ifdef H5
  result = 'h5';
  // #endif
  // #ifdef APP-VUE
  result = 'app';
  // #endif
  return result;
}

// 获取当前运行平台的中文全称
export function PLATFORM_TEXT() {
  let result = `（${$t('未知')}）`;
  // #ifdef MP-ALIPAY
  // #ifndef MP-DINGTALK
  result = $t('支付宝小程序');
  // #endif
  // #ifdef MP-DINGTALK
  result = $t('钉钉小程序');
  // #endif
  // #endif
  // #ifdef MP-WEIXIN
  result = $t('微信小程序');
  // #endif
  // #ifdef H5
  result = $t('移动 H5 ');
  // #endif
  // #ifdef APP-VUE
  result = $t('手机 App ');
  // #endif
  return result;
}
