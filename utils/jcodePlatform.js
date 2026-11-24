/**
 * 和框架后端相关的方法集合（极简搭版）
 */
import { nextTick } from "vue";
import mapValues from "lodash/mapValues";
import keyBy from "lodash/keyBy";
import values from "lodash/values";
import {
  CLEAR_GLOBAL,
  GET_GLOBAL,
  SET_GLOBAL,
  SET_DATA,
  GET_DATA,
  GET_STORAGE,
  SET_STORAGE,
  RELAUNCH_TO,
  LOADING,
  HIDE_LOADING,
  TOAST,
  JUMP_TO,
  GUID,
  NAV_TO,
  PATH,
  JCODE_CONFIG,
  API,
  VALIDATENULL,
  IS_MODULE_OFFLINE,
} from "./index";
import {
  HTTP_GET,
  HTTP_POST,
  HTTP_UPLOAD,
  HTTP_DELETE,
  UPLOAD,
  DOWNLOAD,
  CLEAR_AUTH_TOKEN,
} from "./http";

// 页面刷新后的数据获取
export async function PAGE_LAUNCH(isLayer) {
  const isLaunch = GET_GLOBAL("isLaunch");
  if (isLaunch !== false) {
    // 刷新后执行
    if (isLayer) {
      RELAUNCH_TO("/pages/home/index");
      return false;
    }
    SET_GLOBAL("isLaunch", false);
    const pages = getCurrentPages();
    const pagePath = pages ? "/" + pages.slice(-1)[0].route : "/";

    if (!["/pages/login"].includes(pagePath)) {
      const loginState = await CHECK_LOGIN_STATE();
      if (!loginState) {
        RELAUNCH_TO("/pages/login");
        return false;
      }
    }

    // 同时发出请求，获取所有功能按钮、我的列表、数据字典中的功能名称表
    const [modules] = await Promise.all([
      HTTP_GET({ url: "/mapp/modules" }),
      HTTP_GET({ url: "/mapp/module/mylist" }),
      FETCH_DATAITEM("function").then((result) =>
        mapValues(keyBy(values(result), "f_ItemValue"), "f_ItemName")
      ),
    ]);
    const loginUser = GET_GLOBAL("loginUser");
    // 功能区按钮需要处理 icon
    const myModules = [];
    modules.forEach((item) => {
      if (
        item.f_EnabledMark == 1 &&
        item.f_IsSystem != 3 &&
        !IS_MODULE_OFFLINE(item) &&
        (loginUser.f_SecurityLevel == 1 ||
          loginUser.f_SecurityLevel == 5 ||
          (loginUser.moduleAuthIds || []).indexOf(item.f_Id) > -1)
      ) {
        const icon = item.f_Icon ? item.f_Icon : "";
        myModules.push({ ...item, icon: icon });
      }
    });
    SET_GLOBAL("jcode_modules", myModules);
    HIDE_LOADING();

    // 判断是否是流程表单页面,是的话就跳转回标记的页面
    const routeOptions = pages ? pages.slice(-1)[0].options : {};
    if (routeOptions.routeFrom) {
      JUMP_TO(routeOptions.routeFrom, routeOptions);
    }
    return true;
  }
  return true;
}

// 拉取多语言类型
export async function FETCH_LANG_TYPE() {
  const types = (
    (await HTTP_GET({
      url: `/language/types`,
    })) || []
  ).map((t) => ({
    ...t,
    value: t.f_Code,
    label: t.f_Name,
  }));
  SET_GLOBAL("lang_types", types);
}

export function GET_LANG_MAIN_TYPE() {
  const langConfig = JCODE_CONFIG("language");
  return langConfig.mainType;
}
export function GET_LANG_TYPE() {
  const langConfig = JCODE_CONFIG("language");
  return GET_STORAGE("jcode_lang_type") || langConfig.type;
}
export function GET_LANG_TYPES() {
  return GET_GLOBAL("lang_types") || [];
}

export async function FETCH_LANG_DATA() {
  await FETCH_LANG_DATA_NOT_RELAUNCH_TO();
  if (getCurrentPages()[0]) {
    const path = getCurrentPages()[0].route;
    nextTick(() => {
      RELAUNCH_TO(`/${path}`);
    });
  }
}

export async function FETCH_LANG_DATA_NOT_RELAUNCH_TO() {
  if (GET_LANG_MAIN_TYPE() != GET_LANG_TYPE()) {
    const data = await HTTP_GET({
      url: `/language/mapping/${GET_LANG_MAIN_TYPE()}/${GET_LANG_TYPE()}`,
    });
    SET_GLOBAL("lang_data", data);
  } else {
    SET_GLOBAL("lang_data", {});
  }
}

// 获取图标
export async function FETCH_ICONS() {
  try {
    const iconVer = GET_STORAGE("jcode_icon_ver");
    let iconList = JSON.parse(GET_STORAGE("jcode_icon_list") || "[]");
    SET_GLOBAL("jcode_icon_list", iconList);

    const { ver, list } = (await HTTP_GET({
      url: `/data/icons`,
      params: {
        ver: iconVer,
      },
    })) || {};
    if (ver && ver != iconVer) {
      list.forEach((item) => {
        const point = {
          code: item.f_Code,
          name: item.f_Name,
          body: item.f_Body,
          width: item.f_Width,
          height: item.f_Height,
        };
        iconList.push(point);
      });
      SET_STORAGE("jcode_icon_list", JSON.stringify(iconList));
      SET_STORAGE("jcode_icon_ver", ver);
      SET_GLOBAL("jcode_icon_list", iconList);

      if (getCurrentPages()[0]) {
        const path = getCurrentPages()[0].route;
        nextTick(() => {
          RELAUNCH_TO(`/${path}`);
        });
      }
    }
    // console.log(iconList, "iconList");
  } catch (error) {
    console.log(error, "error");
  }
}

export function GET_ICON(code) {
  return (GET_GLOBAL("jcode_icon_list") || []).find((item) => item.code == code);
}
export function GET_SVG_DATAURL(type, color = "#333333") {
  const icon = GET_ICON(type);
  if (icon) {
    const iconBody = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img"  viewBox="0 0 ${
      icon.width
    } ${icon.height}" >${icon.body.replace(
      /currentColor/g,
      color
    )}</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(iconBody)}`;
  } else {
    return "";
  }
}

// 判断用户登录状态
// 验证登录状态
export async function CHECK_LOGIN_STATE() {
  // 判断 token 字段，没有 token 则必定无登录态
  const token = GET_GLOBAL("token") || GET_STORAGE("token");
  if (!token || token === "null" || token === "undefined") {
    HIDE_LOADING();
    return false;
  }
  SET_GLOBAL("token", token);

  // 判断是否有 loginUser 对象
  if (GET_GLOBAL("loginUser")) {
    return true;
  }

  LOADING("用户数据...");

  // 拉取用户信息以验证登录态
  const success = await FETCH_CURRENT_USERINFO();
  HIDE_LOADING();
  if (!success) {
    TOAST("获取用户/部门/公司信息时出现错误，登录失败");

    // 连同刷新令牌一起清掉，避免下个请求又拿旧会话续期
    CLEAR_AUTH_TOKEN();

    return false;
  }

  return true;
}

// 拉取数据字典
export async function FETCH_DATAITEM(code) {
  if (!code) {
    return [];
  }
  return await HTTP_GET({
    url: `/data/dataitem/details/${code}`,
  });
}

// 拉取数据源
export async function FETCH_DATASOURCE(code, param, params) {
  if (!code) {
    return [];
  }
  if (!param) {
    return await HTTP_POST({
      url: `/data/dbsource/${code}/list`,
      data: {
        ParamsJson: params ? JSON.stringify(params) : "",
      },
    });
  } else {
    return await HTTP_POST({
      url: `/data/dbsource/${code}/list`,
      data: {
        ParamsJson: JSON.stringify({
          param,
        }),
      },
    });
  }
}

// 拉取一个或多个用户信息
// 传入参数为 ID 字符串时拉取单个用户信息
// 传入参数为数组时拉取多个用户信息
export async function FETCH_USER(userId) {
  const isMultiple = Array.isArray(userId);

  if (!isMultiple) {
    if (!userId) {
      return null;
    }
    const result = await HTTP_POST({
      url: "/organization/users",
      data: {
        ids: userId,
      },
    });

    const res = result
      ? result.map((t) => ({
          ...t,
          value: t.f_UserId,
          label: t.f_RealName,
          account: t.f_Account,
        }))
      : [];

    return res.length > 0 ? res[0] : null;
  } else {
    if (userId.length <= 0) {
      return [];
    }
    const result = await HTTP_POST({
      url: "/organization/users",
      data: {
        ids: userId.join(","),
      },
    });
    return result
      ? result.map((t) => ({
          ...t,
          value: t.f_UserId,
          label: t.f_RealName,
          account: t.f_Account,
        }))
      : [];
  }
}

// 拉取一个或多个部门信息
// 传入参数为 ID 字符串时拉取单个部门信息
// 传入参数为数组时拉取多个部门信息
export async function FETCH_DEPARTMENT(departmentId) {
  const isMultiple = Array.isArray(departmentId);
  if (!isMultiple) {
    if (!departmentId) {
      return null;
    }
    const result = await HTTP_GET({
      url: `/organization/department/${departmentId}`,
    });

    return result
      ? {
          ...result,
          value: result.f_DepartmentId,
          label: result.f_FullName,
        }
      : null;
  } else {
    if (departmentId.length <= 0) {
      return [];
    }
    const result = await HTTP_POST({
      url: `/organization/departments`,
      data: {
        ids: departmentId.join(","),
      },
    });
    return result
      ? result.map((t) => ({
          ...t,
          value: t.f_DepartmentId,
          label: t.f_FullName,
        }))
      : [];
  }
}

// 拉取部门信息
export async function FETCH_DEPARTMENTS(companyId) {
  const list = await HTTP_GET({
    url: `/organization/departments/${companyId}`,
  });
  return list || [];
}

// 拉取公司信息
export async function FETCH_COMPANYS() {
  const list = await HTTP_GET({
    url: `/organization/companys`,
  });
  return (list || []).map((t) => ({
    ...t,
    value: t.f_CompanyId,
    label: t.f_FullName,
  }));
}

// 拉取行政区域信息
export async function FETCH_AREAS(pid) {
  const list = await HTTP_GET({
    url: `/data/areas/${pid}`,
  });
  return list || [];
}

// 拉取用户信息数据直接存入全局数据
// 用户信息拉取失败则直接返回 false
export async function FETCH_CURRENT_USERINFO() {
  // loginUser 中合并 role、post 两个字段
  const userInfo = await HTTP_GET({
    url: "/login/app",
  });
  if (!userInfo) {
    return false;
  }
  const user = userInfo;

  user.id = user.f_UserId;
  user.name = user.f_RealName;
  user.account = user.f_Account;
  user.postIds = user.postIds ? user.postIds?.split(",") : [];
  user.roles = [];

  // 加入角色信息
  if (user.roleIds) {
    user.roles = await HTTP_POST({
      url: `/organization/roles`,
      data: {
        ids: user.roleIds,
      },
    });
  }
  // 加入部门信息
  if (user.f_DepartmentId) {
    user.department = await FETCH_DEPARTMENT(user.f_DepartmentId);
  }

  // 岗位
  const postIds = user.postIds || [];
  const currentPost = GET_STORAGE("LOCALE_POST_KEY") || "";
  const type = currentPost;
  const typeList = type.split("|");
  let postId = "";
  if (typeList.length > 1) {
    postId = typeList[1];
    if (typeList[0] === user?.id && postIds.includes(typeList[1])) {
      userInfo.postId = typeList[1];
    }
  }

  if (!userInfo.postId && postIds.length > 0) {
    userInfo.postId = postIds[0];
  }

  if (!userInfo.postId && postId) {
    userInfo.postId = postId;
  }
  SET_GLOBAL("loginUser", user);

  return true;
}
export async function GET_USER_POSTS(ids) {
  if (VALIDATENULL(ids)) {
    return [];
  }
  const labelKey = "f_Name";
  const idList = ids.split(",");
  const list = [];
  const postList = await HTTP_POST({
    url: `/organization/posts`,
    data: { ids: ids },
  });
  const getPost = {};
  postList.forEach((item) => {
    getPost[item.f_PostId] = item;
  });
  idList.forEach((id) => {
    const post = getPost[id];
    if (post) {
      if (post.deptName) {
        list.push({
          value: id,
          label: `${post.deptName}-${post[labelKey]}`,
        });
      } else {
        list.push({
          value: id,
          label: `${post[labelKey]}`,
        });
      }
    }
  });
  return list;
}
export function SET_CURRENT_POST(postId) {
  const user = GET_GLOBAL("loginUser");
  const currentPost = `${user?.id}|${postId}`;
  SET_STORAGE("LOCALE_POST_KEY", currentPost);
}

export async function FETCH_POST_DATA() {
  await FETCH_CURRENT_USERINFO();
  if (getCurrentPages()[0]) {
    const path = getCurrentPages()[0].route;
    nextTick(() => {
      RELAUNCH_TO(`/${path}`);
    });
  }
}

export async function GET_CURRENT_COMPANY() {
  let company = GET_GLOBAL("currentCompany");
  if (!company) {
    const user = GET_GLOBAL("loginUser");
    company =
      user.f_CompanyId
        ? await HTTP_GET({
            url: `/organization/company/${user.f_CompanyId}`,
          })
        : {};
    SET_GLOBAL("currentCompany", company);
  }
  return company;
}

export async function GET_CURRENT_DEPARTMENT() {
  let department = GET_GLOBAL("currentDepartment");
  if (!department) {
    const user = GET_GLOBAL("loginUser");
    department = user.f_DepartmentId
      ? await HTTP_GET({
          url: `/organization/department/${user.f_DepartmentId}`,
        })
      : {};
    SET_GLOBAL("currentDepartment", department);
  }

  return department;
}

// 文件上传
export async function UPLOAD_FILE(fileList) {
  // 防御：非数组（undefined/null/对象/字符串）直接原样返回。
  // 上传组件在原版就未监听 uploadFiles/choose/delFile 事件（上传链断裂），
  // 表单保存时该字段可能不是数组；原版 typeof 判断漏放导致 for...of 崩溃。
  if (!Array.isArray(fileList)) {
    console.warn("UPLOAD_FILE: 传入值不是文件数组，已跳过上传", fileList);
    return fileList;
  }
  let folderId = GUID();
  for (const fileData of fileList) {
    if (fileData.folderId) {
      folderId = fileData.folderId;
    }
    if (fileData.uploadType == "add") {
      await HTTP_UPLOAD(`/system/annexesfile/${fileData.fileID}`, fileData.path, {
        fileName: fileData.name,
        folderId,
      });
    } else if (fileData.uploadType == "remove") {
      await HTTP_DELETE({
        url: `/system/annexesfile/${fileData.fileID}`,
      });
    }
  }

  const hasFile = fileList.filter((t) => t.uploadType != "remove").length > 0;

  return hasFile ? folderId : "";
}
// 文件下载
export async function DOWNLOAD_FILE(folderId) {
  let res = [];
  if (!VALIDATENULL(folderId)) {
    const list =
      (await HTTP_GET({
        url: `/system/annexesfile/${folderId}/list`,
      })) || [];

    res = list.map((t) => ({
      fileID: t.f_Id,
      folderId: t.f_FolderId,
      name: t.f_FileName,
      extname: t.f_FileExtensions,
      size: t.f_FileSize,
      uploadType: "old",
      url: `${API.value}/system/annexesfile/${t.f_Id}?token=${GET_GLOBAL(
        "token"
      )}`,
    }));

    //console.log(list,'file list')
  }

  return res;
}

// 获取表单数据
export function GET_FORMDATA(formData, tableName) {
  const res = {};
  for (var key in formData) {
    if (key.indexOf(tableName + "_") == 0) {
      let formProp = key.replace(tableName + "_", "");
      res[formProp] = formData[key];
    }
  }
  return res;
}

// 功能菜单跳转
export function TO_MODULE_URL(url, param) {
  const modules = GET_GLOBAL("jcode_modules") || [];
  const module = modules.find((t) => t.f_Url == url);
  TO_MODULE(module, param);
}
export function TO_MODULE_ID(id) {
  const modules = GET_GLOBAL("jcode_modules") || [];
  const module = modules.find((t) => t.f_Id == id);
  TO_MODULE(module);
}
export function TO_MODULE(module, param) {
  if (module != null) {
    if (IS_MODULE_OFFLINE(module)) {
      TOAST("该功能已下线");
      return;
    }
    NAV_TO(`${module.f_Url}`, param, true);
  } else {
    TOAST("你没有该功能权限！");
  }
}

export function GET_MODULEID() {
  const path = PATH();
  const modules = GET_GLOBAL("jcode_modules") || [];
  const module = modules.find((t) => t.f_Url == path);
  return module.f_Id;
}

// 加载功能页面的权限信息
export async function FETCH_AUTH(id) {
  const loginUser = GET_GLOBAL("loginUser");
  if (loginUser.f_SecurityLevel == 1 || loginUser.f_SecurityLevel == 5) {
    SET_DATA(`jcode_auth_${id}`, {
      isAuth: false,
    });
  } else {
    const data = await HTTP_GET({
      url: `/permission/module/app/${id}`,
    });
    const authData = {
      isAuth: true,
      buttons: data.buttons || [],
      columns: (data.columns || []).map((t) => t.toLowerCase()),
      forms: {},
    };
    const forms = data.forms || [];
    forms.forEach((item) => {
      const itemList = item.split(",");
      const propList = itemList[0].split("|");
      if (propList.length > 1) {
        // 表格
        authData.forms[propList[0].toLowerCase()] =
          authData.forms[propList[0].toLowerCase()] || {};
        authData.forms[propList[0].toLowerCase()][propList[1].toLowerCase()] =
          itemList[1];
      } else {
        // 表单字段
        authData.forms[itemList[0].toLowerCase()] = itemList[1];
      }
    });

    SET_DATA(`jcode_auth_${id}`, authData);
  }
}
// 列权限
export function GET_COLUMN_AUTH(columnId, moduleId) {
  if (!columnId) {
    return false;
  }

  const authData = GET_DATA(`jcode_auth_${moduleId}`);
  if (authData.isAuth) {
    // 全选处理
    if (authData.columns.includes("jcode_auth_all")) {
      return true;
    }
    if (authData.columns.indexOf(columnId.toLowerCase()) == -1) {
      return false;
    }
  }

  return true;
}
// 按钮权限
export function GET_BUTTON_AUTH(buttonId, moduleId) {
  if (!buttonId) {
    return false;
  }

  const authData = GET_DATA(`jcode_auth_${moduleId}`);
  if (authData.isAuth) {
    if (authData.buttons.includes("jcode_auth_all")) {
      return true;
    }
    if (authData.buttons.indexOf(buttonId) == -1) {
      return false;
    }
  }

  return true;
}
// 表单查看权限
export function GET_FORM_LOOK_AUTH(formId, moduleId) {
  let isWorkflow = false;
  if (!moduleId) {
    isWorkflow = true;
    moduleId = "wfform";
  }

  if (!formId) {
    return false;
  }

  const authData = GET_DATA(`jcode_auth_${moduleId}`);
  if (authData.isAuth) {
    if (isWorkflow) {
      if (
        authData.forms[formId.toLowerCase()] &&
        authData.forms[formId.toLowerCase()] == "3"
      ) {
        return false;
      }
    } else {
      // 全选处理
      const authForms = authData.forms;
      if (authForms["jcode_auth_all"]) {
        return true;
      }
      if (!authData.forms[formId.toLowerCase()]) {
        return false;
      }
    }
  }
  return true;
}
// 表单编辑权限
export function GET_FORM_EDIT_AUTH(formId, moduleId) {
  let isWorkflow = false;
  if (!moduleId) {
    isWorkflow = true;
    moduleId = "wfform";
  }

  if (!formId) {
    return false;
  }

  const authData = GET_DATA(`jcode_auth_${moduleId}`);
  if (authData.isAuth) {
    if (isWorkflow) {
      if (
        authData.forms[formId.toLowerCase()] &&
        authData.forms[formId.toLowerCase()] != "2"
      ) {
        return false;
      }
    } else {
      // 全选处理
      const authForms = authData.forms;
      if (authForms["jcode_auth_all"]) {
        return true;
      }
      if (authData.forms[formId.toLowerCase()] != "2") {
        return false;
      }
    }
  }
  return true;
}
// 子表查看权限
export function GET_FORMTABLE_LOOK_AUTH(formId, prop, moduleId) {
  let isWorkflow = false;
  if (!moduleId) {
    isWorkflow = true;
    moduleId = "wfform";
  }

  if (!formId || !prop) {
    return false;
  }
  const authData = GET_DATA(`jcode_auth_${moduleId}`);
  if (authData.isAuth) {
    if (isWorkflow) {
      if (
        authData.forms[formId.toLowerCase()] &&
        authData.forms[formId.toLowerCase()][prop.toLowerCase()] &&
        authData.forms[formId.toLowerCase()][prop.toLowerCase()] == "3"
      ) {
        return false;
      }
    } else {
      const authForms = authData.forms;
      if (authForms["jcode_auth_all"]) {
        return true;
      }
      if (
        !authData.forms[formId.toLowerCase()] ||
        !authData.forms[formId.toLowerCase()][prop.toLowerCase()]
      ) {
        return false;
      }
    }
  }
  return true;
}
