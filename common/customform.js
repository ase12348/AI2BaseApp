/**
 * 表单数据处理相关方法（极简搭版）
 */
import {
  DEEPCLONE,
  GET_DATA,
  SET_DATA,
  TREE_TO_ARRAY,
  FORMAT_NAME,
  VALIDATENULL,
  DATEFORMAT,
  GET_GLOBAL,
  DATENOW,
  GET_VALUE,
  lr_getObjType,
  GUID,
} from "@/utils/index";
import {
  FETCH_DEPARTMENT,
  FETCH_USER,
  FETCH_DATAITEM,
  FETCH_DATASOURCE,
  FETCH_COMPANYS,
  FETCH_AREAS,
  UPLOAD_FILE,
  DOWNLOAD_FILE,
  GET_FORM_LOOK_AUTH,
} from "@/utils/jcodePlatform";

// 根据组件模板加载数据值
export async function jcode_form_fetchDataSource(
  schemeItem,
  formData,
  allFormData
) {
  const config = schemeItem.config || {};
  switch (config.dataType) {
    case "options": // 静态数据
      SET_DATA(schemeItem.id, config.options);
      break;
    case "dataItem": // 数据字典
      if (config.dataCode && !GET_DATA(config.dataCode)) {
        const dataItems = (await FETCH_DATAITEM(config.dataCode)) || [];
        SET_DATA(
          config.dataCode,
          dataItems.map((t) => ({
            ...t,
            value: t.f_ItemValue,
            label: t.f_ItemName,
          }))
        );
      }
      break;
    case "dataSource": // 远端数据(数据源)
      if (config.dataCode && config.upCtrl && formData) {
        let upCtrlVal = "";
        if (formData[config.upCtrl]) {
          upCtrlVal = formData[config.upCtrl];
        } else if (allFormData && allFormData[config.upCtrl]) {
          upCtrlVal = allFormData[config.upCtrl];
        }

        if (upCtrlVal) {
          upCtrlVal += "";
          const upCtrlValList = upCtrlVal.split(","); // 考虑数据多选的问题
          for (let v of upCtrlValList) {
            if (!GET_DATA(`${config.dataCode}_${v}`)) {
              SET_DATA(
                `${config.dataCode}_${v}`,
                (await FETCH_DATASOURCE(config.dataCode, v)) || []
              );
            }
          }
        } else if (config.upShowAll !== false) {
          if (config.dataCode && !GET_DATA(config.dataCode)) {
            SET_DATA(
              config.dataCode,
              (await FETCH_DATASOURCE(config.dataCode)) || []
            );
          }
        }
      } else if (config.params) {
        if (
          !GET_DATA(`${config.dataCode}_${JSON.stringify(config.params)}`)
        ) {
          SET_DATA(
            `${config.dataCode}_${JSON.stringify(config.params)}`,
            (await FETCH_DATASOURCE(config.dataCode, undefined, config.params)) ||
              []
          );
        }
      } else {
        if (config.dataCode && !GET_DATA(config.dataCode)) {
          SET_DATA(
            config.dataCode,
            (await FETCH_DATASOURCE(config.dataCode)) || []
          );
        }
      }
      break;
  }
  if (
    ["companySelect", "company", "departmentSelect"].includes(schemeItem.type)
  ) {
    if (!GET_DATA("jcode_company_list")) {
      SET_DATA("jcode_company_list", await FETCH_COMPANYS());
    }
  } else if (["areaSelect"].includes(schemeItem.type)) {
    let areas = GET_DATA("jcode_areas_0");
    if (!areas) {
      areas = (await FETCH_AREAS("0")).map((t) => ({
        value: t.f_AreaCode,
        label: t.f_AreaName,
      }));
      SET_DATA("jcode_areas_0", areas);
    }

    if (formData && formData[schemeItem.id]) {
      const areaValues = formData[schemeItem.id].split(",");
      if (!GET_DATA(`jcode_areas_${areaValues[0]}`)) {
        SET_DATA(
          `jcode_areas_${areaValues[0]}`,
          (await FETCH_AREAS(areaValues[0])).map((t) => ({
            value: t.f_AreaCode,
            label: t.f_AreaName,
          }))
        );
      }
      if (!GET_DATA(`jcode_areas_${areaValues[1]}`)) {
        SET_DATA(
          `jcode_areas_${areaValues[1]}`,
          (await FETCH_AREAS(areaValues[1])).map((t) => ({
            value: t.f_AreaCode,
            label: t.f_AreaName,
          }))
        );
      }
    } else {
      let areaPid = areas[0].value;
      areas = GET_DATA(`jcode_areas_${areaPid}`);
      if (!areas) {
        areas = (await FETCH_AREAS(areaPid)).map((t) => ({
          value: t.f_AreaCode,
          label: t.f_AreaName,
        }));
        SET_DATA(`jcode_areas_${areaPid}`, areas);
      }
      areaPid = areas[0].value;
      areas = GET_DATA(`jcode_areas_${areaPid}`);
      if (!areas) {
        areas = (await FETCH_AREAS(areaPid)).map((t) => ({
          value: t.f_AreaCode,
          label: t.f_AreaName,
        }));
        SET_DATA(`jcode_areas_${areaPid}`, areas);
      }
    }
  }
}

// 加载行政区域信息
export async function jcode_form_fetchAreaInfo(list) {
  for (const item of list) {
    const items = item.split(",");
    if (!GET_DATA(`jcode_areas_${items[0]}`)) {
      SET_DATA(
        `jcode_areas_${items[0]}`,
        (await FETCH_AREAS(items[0])).map((t) => ({
          value: t.f_AreaCode,
          label: t.f_AreaName,
        }))
      );
    }
    if (!GET_DATA(`jcode_areas_${items[1]}`)) {
      SET_DATA(
        `jcode_areas_${items[1]}`,
        (await FETCH_AREAS(items[1])).map((t) => ({
          value: t.f_AreaCode,
          label: t.f_AreaName,
        }))
      );
    }
  }
}

// 加载组织信息
export async function jcode_form_fetchOrganizeInfo(
  userIdList,
  departmentIdList
) {
  const userMap = GET_DATA("jcode_users_map") || {};
  const departmentMap = GET_DATA("jcode_departments_map") || {};

  const _userIdList = userIdList.filter((t) => !userMap[t]);
  const _departmentIdList = departmentIdList.filter((t) => !departmentMap[t]);

  await Promise.all([
    FETCH_USER(_userIdList).then((result) => {
      result.forEach((t) => {
        userMap[t.value] = t;
      });
    }),
    FETCH_DEPARTMENT(_departmentIdList).then((result) => {
      result.forEach((t) => {
        departmentMap[t.value] = t;
      });
    }),
  ]);

  SET_DATA("jcode_users_map", userMap);
  SET_DATA("jcode_departments_map", departmentMap);
}

// 获取表单数据源和数据字典数据
export function jcode_form_getDataSource(schemeItem, formData, allFormData) {
  if (["companySelect", "company"].includes(schemeItem.type)) {
    return GET_DATA("jcode_company_list");
  }
  const config = schemeItem.config;

  switch (config.dataType) {
    case "options": // 静态数据
      return GET_DATA(schemeItem.id);
    case "dataItem": // 数据字典
      return GET_DATA(config.dataCode).filter((t) => {
        return t.f_EnabledMark == 1;
      });
    case "dataSource": // 远端数据(数据源)
      // 获取带参数值的数据源数据值
      if (config.upCtrl && formData) {
        let upCtrlVal = "";
        if (formData[config.upCtrl]) {
          upCtrlVal = formData[config.upCtrl];
        } else if (allFormData && allFormData[config.upCtrl]) {
          upCtrlVal = allFormData[config.upCtrl];
        }

        if (upCtrlVal) {
          upCtrlVal += "";
          const res = [];
          const upCtrlValList = upCtrlVal.split(","); // 考虑数据多选的问题
          upCtrlValList.forEach((v) => {
            const vList = GET_DATA(`${config.dataCode}_${v}`) || [];
            res.push(
              ...vList.filter(
                (t) =>
                  !res.some((t2) => t2[config.valueKey] === t[config.valueKey])
              )
            );
          });

          return res.map((t) => ({
            ...t,
            value: t[config.valueKey],
            label: t[config.labelKey],
          }));
        } else if (config.upShowAll !== false) {
          return (GET_DATA(config.dataCode) || []).map((t) => ({
            ...t,
            value: t[config.valueKey],
            label: t[config.labelKey],
          }));
        } else {
          return [];
        }
      } else if (config.params) {
        return (
          GET_DATA(`${config.dataCode}_${JSON.stringify(config.params)}`) || []
        ).map((t) => ({
          ...t,
          value: t[config.valueKey],
          label: t[config.labelKey],
        }));
      } else {
        return (GET_DATA(config.dataCode) || []).map((t) => ({
          ...t,
          value: t[config.valueKey],
          label: t[config.labelKey],
        }));
      }
  }

  return [];
}

// 显示数据
export function jcode_form_displayText(
  value,
  schemeItem,
  formData,
  allFormData
) {
  if (VALIDATENULL(value)) {
    return "";
  }
  const config = schemeItem.config;
  let name = value;
  switch (schemeItem.type) {
    case "radio":
    case "checkbox":
    case "select":
    case "selectMultiple":
    case "treeSelect":
    case "inputLayer":
    case "buttonLayer":
      if (config.dataType == "options") {
        // 静态数据
        const data = [];
        const options = DEEPCLONE(config.options);
        TREE_TO_ARRAY(options, data); //静态数据
        name = FORMAT_NAME(data, value, "value", "label");
      } else if (config.dataType == "dataItem") {
        // 数据字典
        name = FORMAT_NAME(
          GET_DATA(config.dataCode),
          value,
          "f_ItemValue",
          "f_ItemName"
        );
      } else {
        if (config.upCtrl && formData) {
          let upCtrlVal = "";
          if (formData[config.upCtrl]) {
            upCtrlVal = formData[config.upCtrl];
          } else if (allFormData && allFormData[config.upCtrl]) {
            upCtrlVal = allFormData[config.upCtrl];
          }

          if (upCtrlVal) {
            const res = [];

            const upCtrlValList = upCtrlVal.split(","); // 考虑数据多选的问题
            upCtrlValList.forEach((v) => {
              const vList = GET_DATA(`${config.dataCode}_${v}`) || [];
              res.push(
                ...vList.filter(
                  (t) =>
                    !res.some(
                      (t2) => t2[config.valueKey] === t[config.valueKey]
                    )
                )
              );
            });
            name = FORMAT_NAME(res, value, config.valueKey, config.labelKey);
          } else {
            name = value;
          }
        } else {
          name = FORMAT_NAME(
            GET_DATA(config.dataCode),
            value,
            config.valueKey,
            config.labelKey
          );
        }
      }
      break;
    case "date":
    case "createTime":
    case "modifyTime":
      name = DATEFORMAT(value, config.format);
      break;
    case "companySelect":
    case "company":
      name = FORMAT_NAME(
        GET_DATA("jcode_company_list"),
        value,
        "f_CompanyId",
        "f_FullName"
      );
      break;
    case "departmentSelect":
    case "department":
      const department = GET_DATA("jcode_departments_map")[value];
      name = department ? department.label : "";
      break;
    case "userSelect":
      if (value) {
        const userList = value.split(",");
        const nameList = [];
        for (const userValue of userList) {
          const userEntity = GET_DATA("jcode_users_map")[userValue];
          if (userEntity) {
            nameList.push(userEntity.label);
          } else {
            nameList.push(userValue);
          }
        }
        name = String(nameList);
      }
      break;

    case "createUser":
    case "modifyUser":
      const user = GET_DATA("jcode_users_map")[value];
      name = user ? user.label : "";
      break;
    case "areaSelect":
      const valueList = value.split(",");
      const nameList2 = [];
      const obj1 = GET_DATA(`jcode_areas_0`).find(
        (t) => t.value == valueList[0]
      );
      if (obj1) {
        nameList2.push(obj1.label);
        const obj2 = GET_DATA(`jcode_areas_${valueList[0]}`).find(
          (t) => t.value == valueList[1]
        );
        if (obj2) {
          nameList2.push(obj2.label);
          const obj3 = GET_DATA(`jcode_areas_${valueList[1]}`).find(
            (t) => t.value == valueList[2]
          );
          if (obj3) {
            nameList2.push(obj3.label);
          }
        }
      }
      name = nameList2.join(",");
      break;
  }

  return name;
}

// 获取表单数据
export async function jcode_form_getFormData(
  formScheme,
  postData = {},
  isUpdate,
  isAuth = false,
  moduleId = null
) {
  const res = {};
  const loginUser = GET_GLOBAL("loginUser");
  for (
    let j = 0, jlen = formScheme.formInfo.components.length;
    j < jlen;
    j++
  ) {
    const component = formScheme.formInfo.components[j];
    switch (component.type) {
      case "guid":
        res[component.id] = await jcode_form_getComponentValue(
          component,
          postData,
          GUID(),
          isAuth,
          moduleId
        );
        break;
      case "input":
      case "textarea":
      case "textEditor":
      case "password":
        res[component.id] = await jcode_form_getComponentValue(
          component,
          postData,
          "",
          isAuth,
          moduleId
        );
        break;
      case "number":
        res[component.id] = await jcode_form_getComponentValue(
          component,
          postData,
          0,
          isAuth,
          moduleId
        );
        break;
      case "upload":
      case "uploadimg":
        res[component.id] = await DOWNLOAD_FILE(
          await jcode_form_getComponentValue(
            component,
            postData,
            "",
            isAuth,
            moduleId
          )
        );
        break;
      case "companySelect":
        let companySValue = "";
        if (!isUpdate && component.isLogin) {
          companySValue = loginUser?.f_CompanyId;
        } else {
          companySValue = await jcode_form_getComponentValue(
            component,
            postData,
            "",
            isAuth,
            moduleId
          );
        }
        if (companySValue != "") {
          if (!GET_DATA("jcode_company_list")) {
            SET_DATA("jcode_company_list", await FETCH_COMPANYS());
          }
        }
        res[component.id] = companySValue;
        break;
      case "company":
        let companyValue = "";
        if (!isUpdate) {
          companyValue = loginUser?.f_CompanyId;
        } else {
          companyValue = await jcode_form_getComponentValue(
            component,
            postData,
            "",
            isAuth,
            moduleId
          );
        }
        if (companyValue != "") {
          if (!GET_DATA("jcode_company_list")) {
            SET_DATA("jcode_company_list", await FETCH_COMPANYS());
          }
        }
        res[component.id] = companyValue;
        break;
      case "department":
      case "departmentSelect":
        let departmentValue = "";
        if (component.type == "department" && !isUpdate) {
          departmentValue = loginUser?.f_DepartmentId;
        } else if (
          component.type == "departmentSelect" &&
          !isUpdate &&
          component.isLogin
        ) {
          departmentValue = loginUser?.f_DepartmentId;
        } else {
          departmentValue = await jcode_form_getComponentValue(
            component,
            postData,
            "",
            isAuth,
            moduleId
          );
        }
        await jcode_form_getDepartment(departmentValue);
        res[component.id] = departmentValue;
        break;
      case "createUser":
      case "modifyUser":
      case "userSelect":
        let userValue = "";
        if (
          (component.type == "createUser" && !isUpdate) ||
          component.type == "modifyUser"
        ) {
          userValue = loginUser?.f_UserId;
        } else if (
          component.type == "userSelect" &&
          !isUpdate &&
          component.isLogin
        ) {
          userValue = loginUser?.f_UserId;
        } else {
          userValue = await jcode_form_getComponentValue(
            component,
            postData,
            "",
            isAuth,
            moduleId
          );
        }
        await jcode_form_getUser(userValue);
        res[component.id] = userValue;
        break;
      case "createTime":
      case "modifyTime":
        if (
          (component.type == "createTime" && !isUpdate) ||
          component.type == "modifyTime"
        ) {
          res[component.id] = DATENOW();
        } else {
          res[component.id] = await jcode_form_getComponentValue(
            component,
            postData,
            "",
            isAuth,
            moduleId
          );
          if (res[component.id] != "") {
            res[component.id] = DATEFORMAT(res[component.id]);
          }
        }
        break;
      case "gridtable":
        res[component.id] = await jcode_form_getComponentValue(
          component,
          postData,
          isAuth,
          moduleId
        );
        break;
      case "areaSelect":
        res[component.id] = await jcode_form_getComponentValue(
          component,
          postData,
          "",
          isAuth,
          moduleId
        );
        if (
          !res[component.id] ||
          !res[component.id].split ||
          res[component.id].split(",").length < 3
        ) {
          res[component.id] = "";
        }
        break;
      default:
        if (!["card", "divider", "btn", "viewTable"].includes(component.type)) {
          res[component.id] = await jcode_form_getComponentValue(
            component,
            postData,
            "",
            isAuth,
            moduleId
          );
        }
        break;
    }
  }
  return res;
}

// 获取表单组件数据
export async function jcode_form_getComponentValue(
  component,
  data,
  defaultValue,
  isAuth = false,
  moduleId = null
) {
  if (component.type == "gridtable") {
    const tableData = data[component.config.table];
    const res = [];
    if (!VALIDATENULL(tableData)) {
      for (let row of tableData) {
        const rowTmp = {};
        for (let cell of component.children) {
          const cellData = GET_VALUE(row, cell.config.field);
          if (["createUser", "modifyUser", "userSelect"].includes(cell.type)) {
            await jcode_form_getUser(cellData);
            rowTmp[cell.id] = cellData;
          } else if (
            ["department", "departmentSelect"].includes(cell.type)
          ) {
            await jcode_form_getDepartment(cellData);
            rowTmp[cell.id] = cellData;
          } else if (
            ["createTime", "modifyTime"].includes(cell.type) &&
            !VALIDATENULL(cellData)
          ) {
            rowTmp[cell.id] = DATEFORMAT(cellData);
          } else if (
            ["upload", "uploadimg"].includes(cell.type) &&
            !VALIDATENULL(cellData)
          ) {
            rowTmp[cell.id] = await DOWNLOAD_FILE(cellData);
          } else {
            rowTmp[cell.id] = cellData;
          }
        }

        rowTmp.abledList = [];
        rowTmp.disabled = false;
        rowTmp.hasNoDeleteBtn = false;
        res.push(rowTmp);
      }
    }
    return res;
  } else {
    let _formdata = data[component.config.table];
    if (_formdata && lr_getObjType(_formdata) != "object") {
      _formdata = _formdata[0];
    }

    if (_formdata) {
      const value = GET_VALUE(_formdata, component.config.field);
      if (VALIDATENULL(value)) {
        return "";
      }
      return value;
    } else if (
      (isAuth && GET_FORM_LOOK_AUTH(component.id, moduleId)) ||
      !component.config.display ||
      !isAuth
    ) {
      return !VALIDATENULL(component.config.defaultValue)
        ? component.config.defaultValue
        : defaultValue;
    } else {
      return undefined;
    }
  }
}

// 获取提交表单数据
export async function jcode_form_convertToPostData(
  formData,
  components,
  isUpdate
) {
  /*需要进行一次数据转化，主要是针对文件上传组件*/
  for (const component of components) {
    if (!component.isSubTable) {
      if (["upload", "uploadimg"].includes(component.type)) {
        //如果是文件上传组件需要将文件进行上传
        const fileList = formData[component.id];
        // 原版用 typeof fileList !== "string" 判断，会把 undefined/null/对象也放过，
        // 导致 UPLOAD_FILE 里 for...of 抛 "fileList is not iterable"。
        // 正确语义：只有文件数组才需要上传（空数组也会走一遍以得到 "" 结果）。
        if (Array.isArray(fileList)) {
          formData[component.id] = await UPLOAD_FILE(fileList);
        }
      } else if (["modifyUser"].includes(component.type)) {
        const loginUser = GET_GLOBAL("loginUser");
        formData[component.id] = loginUser?.f_UserId;
      } else if (["modifyTime"].includes(component.type)) {
        formData[component.id] = DATENOW();
      } else if (["gridtable"].includes(component.type)) {
        for (let j = 0; j < component.children.length; j++) {
          let com = component.children[j];
          if (["upload", "uploadimg"].includes(com.type)) {
            let childData = formData[component.id];
            for (let i = 0; i < childData.length; i++) {
              let item = childData[i];
              let fileList = item[com.id];
              if (Array.isArray(fileList)) {
                item[com.id] = await UPLOAD_FILE(fileList);
              }
            }
          }
        }
        formData[component.id].forEach((row) => {
          delete row.hasNoDeleteBtn;
          delete row.disabled;
          delete row.abledList;
        });
      }
    }
  }

  // console.log(formData,'jcode_form_convertToPostData。formData')

  return formData;
}

// 获取部门数据
export async function jcode_form_getDepartment(value) {
  if (!VALIDATENULL(value)) {
    const departmentMap = GET_DATA("jcode_departments_map") || {};
    let department = departmentMap[value];
    if (!department) {
      department = await FETCH_DEPARTMENT(value);
      if (department) {
        departmentMap[department.value] = department;
        SET_DATA("jcode_departments_map", departmentMap);
      }
    }
    return department;
  } else {
    return null;
  }
}

// 获取用户数据
export async function jcode_form_getUser(value) {
  const loginUser = GET_GLOBAL("loginUser");
  const userMap = GET_DATA("jcode_users_map") || {};
  if (!userMap[loginUser?.f_UserId]) {
    const userInfo = DEEPCLONE(loginUser || {});
    delete userInfo.roleIds;
    delete userInfo.postIds;
    delete userInfo.moduleAuthIds;

    userInfo.value = userInfo.f_UserId;
    userInfo.label = userInfo.f_RealName;
    userInfo.account = userInfo.f_Account;

    userMap[userInfo.f_UserId] = userInfo;
    SET_DATA("jcode_users_map", userMap);
  }

  if (!VALIDATENULL(value)) {
    let userObj = userMap[value];
    if (!userObj) {
      userObj = await FETCH_USER(value);
      if (userObj) {
        userMap[userObj.value] = userObj;
        SET_DATA("jcode_users_map", userMap);
      }
    }
    // console.log(userObj,'userObj')
    return userObj;
  } else {
    return null;
  }
}
