<template>
  <view class="jcode-user-fullname">
    <jcode-icon
      :type="
        isFull ? 'jcode-icon-circle-minus-base' : 'jcode-icon-circle-add-base'
      "
      size="16"
      color="#2979ff"
      @click="handleClick"
    ></jcode-icon>
    <text>{{ fullName }}</text>
  </view>
</template>

<script setup>
import { FETCH_COMPANYS, FETCH_USER } from '@/utils/jcodePlatform';
import { GET_DATA, SET_DATA, VALIDATENULL } from '@/utils/index';
import { HTTP_GET, HTTP_POST } from '@/utils/http';
import { watch, ref } from 'vue';

const props = defineProps({
  modelValue: {
    default: null,
  },
});
defineOptions({ name: 'jcode-user-picker' });

const isFull = ref(false);
const loading = ref(false);
const fullName = ref('');

const handleClick = async function () {
  if (loading.value) {
    return;
  }
  if (!isFull.value) {
    loading.value = true;
    isFull.value = true;
    loading.value = false;
  } else {
    isFull.value = false;
  }
  await getUserFullName(props.modelValue, isFull.value);
};
const getUserFullName = async function (
  userIdAndPostId,
  isFull__local = false,
) {
  if (!userIdAndPostId) {
    return '';
  }
  const values = userIdAndPostId.split('|');
  const userValue = values[0];
  let postId = values.length > 1 ? values[1] : '';

  const user = await loadUser(userValue);
  if (user) {
    let res = user.f_RealName;

    postId = postId || user.f_Post;

    if (postId) {
      const postName = await getPostName(postId, '', isFull__local);
      if (postName) {
        res = `${postName}-${res}`;
      }
    } else {
      if (user.f_DepartmentId) {
        const departmentname = await loadDepartmentFullName(
          user.f_DepartmentId,
        );
        if (departmentname) {
          res = `${departmentname}-${res}`;
        }
      }
      if (isFull__local && user.f_CompanyId) {
        const getCompanyList = await FETCH_COMPANYS();
        let companyName = '';
        for (let i = 0; i < getCompanyList.length; i++) {
          if (getCompanyList[i].f_CompanyId == user.f_CompanyId) {
            companyName = getCompanyList[i].f_FullName;
            break;
          }
        }
        if (companyName) {
          res = `${companyName}-${res}`;
        }
      }
    }

    fullName.value = res;
  } else {
    fullName.value = ' ';
  }
};
const getPostName = async function (id, labelKey, isFull__local2) {
  if (VALIDATENULL(id)) {
    return '';
  }
  labelKey = labelKey || 'f_Name';
  const postList = await HTTP_POST({
    url: `/organization/posts`,
    data: { ids: id },
  });
  const post = postList ? postList[0] : undefined;
  if (post) {
    if (labelKey == 'f_CompanyId') {
      return `${post.companyName}`;
    } else if (labelKey == 'f_Name' && post.deptName) {
      const deptFullName =
        (await loadDepartmentFullName(post.f_DepartmentId)) || '';
      if (isFull__local2 && deptFullName) {
        return `${post.companyName}-${deptFullName}-${post[labelKey]}`;
      } else {
        return `${post.deptName}-${post[labelKey]}`;
      }
    } else {
      return `${post[labelKey]}`;
    }
  } else {
    return id;
  }
};
const loadUser = async function (value) {
  if (!VALIDATENULL(value)) {
    const userMap = GET_DATA('jcode_users_map') || {};
    let userObj = userMap[value];
    if (!userObj) {
      userObj = await FETCH_USER(value);
      if (userObj) {
        userMap[userObj.value] = userObj;
        SET_DATA('jcode_users_map', userMap);
      }
    }
    return userObj;
  }
};
const loadUserDepartmentFullName = async function (userIdAndPostId) {
  if (!userIdAndPostId) {
    return;
  }
  const values = userIdAndPostId.split('|');
  const userValue = values[0];
  let postId = values.length > 1 ? values[1] : '';
  const userMap = GET_DATA('jcode_users_map') || {};
  const user = userMap[userValue];
  if (user) {
    postId = postId || user.f_Post;
    if (postId) {
      const getPost = GET_DATA('jcode_post_map') || {};
      const post = getPost[postId];
      if (post) {
        await loadDepartmentFullName(post.f_DepartmentId);
        return;
      }
    }
    if (user.f_DepartmentId) {
      await loadDepartmentFullName(user.f_DepartmentId);
    }
  }
};
const loadDepartmentFullName = async function (departmentId) {
  if (!VALIDATENULL(departmentId)) {
    const departmentFullNameMap =
      GET_DATA('jcode_departments_fullname_map') || {};
    let name = departmentFullNameMap[departmentId];
    if (!name) {
      name = await HTTP_GET({
        url: `/organization/department/name/${departmentId}`,
      });
      if (name) {
        departmentFullNameMap[departmentId] = name;
        SET_DATA('jcode_departments_fullname_map', departmentFullNameMap);
      }
    }
    return name;
  } else {
    return '';
  }
};

watch(
  () => props.modelValue,
  function (val) {
    if (!props.modelValue) {
      return;
    }
    getUserFullName(props.modelValue, isFull.value);
  },
  { immediate: true },
);
</script>
<style>
.jcode-user-fullname {
  padding-right: 4px;
  color: #2979ff;
  display: inline-block;
}
</style>
