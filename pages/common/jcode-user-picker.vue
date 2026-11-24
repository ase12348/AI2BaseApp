<template>
  <view
    class="page"
    :style="{
      'min-height': SCREENHEIGHT() + 'px',
      'padding-top': '86px',
      'padding-bottom': isMulti ? '40px' : '',
    }"
  >
    <view class="bg-white fixed">
      <view class="jcode-flex" style="padding-right: 10px">
        <uni-search-bar
          :placeholder="`${$t('搜索用户名')}/${$t('账号')}`"
          cancelButton="none"
          @confirm="searchChange(false)"
          @clear="searchChange(true)"
          v-model="searchText"
        ></uni-search-bar>
        <jcode-icon
          type="jcode-icon-department"
          color="#2979ff"
          @click="searchClick"
        ></jcode-icon>
      </view>

      <view style="padding: 0 0 8px 10px">
        <uni-tag
          customStyle="margin-right:8px;"
          size="small"
          inverted
          :text="departmentName"
        ></uni-tag>
        <uni-tag size="small" type="primary" :text="`${$t('共')}${records}${$t('条')}`"></uni-tag>
        <uni-tag
          customStyle="margin-left:8px;"
          v-if="isMulti"
          size="small"
          type="success"
          :text="`${$t('已选')}${values.length}${$t('条')}`"
        ></uni-tag>
      </view>
    </view>

    <uni-list>
      <uni-list-item
        clickable
        @click="itemClick(item)"
        v-for="(item, index) in list"
        :key="item.f_UserId"
        :title="item.f_RealName"
        :note="item.f_Account"
        :thumb="avatarSrc(item)"
        thumb-size="lg"
      >
        <template v-slot:footer>
          <view v-if="isMulti" style="display: flex; align-items: center">
            <jcode-icon
              v-if="values.indexOf(item.f_UserId) > -1"
              type="jcode-icon-circle-correct"
              size="20"
              color="#2979ff"
            />
          </view>
        </template>
      </uni-list-item>
    </uni-list>
    <uni-load-more v-if="loading || status === 'noMore'" :status="status" />

    <uni-drawer ref="showRight" mode="right">
      <view class="jcode-box padding-top-win">
        <view class="jcode-title jcode-ab">{{ $t('搜索条件') }}</view>
        <view class="jcode-box">
          <scroll-view style="height: 100%" scroll-with-animation scroll-y>
            <jcode-tree-view
              :options="companyOptions()"
              :isTreeData="true"
              :loadData="loadDepartments"
              @change="handleDepartmentChange"
            >
            </jcode-tree-view>
          </scroll-view>
        </view>
      </view>
    </uni-drawer>

    <view v-if="isMulti" class="jcode-bottom-btns">
      <button @click.stop="handleOk" type="primary">{{ $t('确定') }}</button>
    </view>
  </view>
</template>

<script setup>
import {
  $t,
  EMIT,
  GET_DATA,
  GET_GLOBAL,
  GET_PARAM,
  HIDE_LOADING,
  NAV_BACK,
  OFF,
  SCREENHEIGHT,
  SET_TITLE,
  TOTREE,
} from '@/utils/index';
import { FETCH_DEPARTMENTS, PAGE_LAUNCH } from '@/utils/jcodePlatform';
import { HTTP_GET } from '@/utils/http';
import { useGlobalConfig } from '@/hooks/setting/useGlobalConfig';
import { ref } from 'vue';
import {
  onBackPress,
  onUnload,
  onLoad,
  onPullDownRefresh,
  onReachBottom,
} from '@dcloudio/uni-app';

const { API } = useGlobalConfig();

const isLayer = ref(true);
const searchText = ref('');
const departmentName = ref('');
const loading = ref(true);
const status = ref('loading');
const page = ref(1);
const total = ref(1);
const records = ref(1);
const list = ref([]);
const companyList = ref([]);
const companyId = ref('');
const departmentId = ref('');
const isMulti = ref(false);
const values = ref([]);

const showRight = ref(null);

const init = async function () {
  const { isMulti: isMulti__local, value, titleText } = GET_PARAM();

  SET_TITLE(titleText);
  isMulti.value = isMulti__local;
  if (value) {
    values.value = value.split(',');
  } else {
    values.value = [];
  }

  await fetchList();
  companyList.value =
    (await HTTP_GET({
      url: '/organization/companys',
    })) || [];
};
const itemClick = function (user) {
  if (isMulti.value) {
    const index = values.value.indexOf(user.f_UserId);
    if (index > -1) {
      values.value.splice(index, 1);
    } else {
      values.value.push(user.f_UserId);
    }
  } else {
    EMIT('select-jcode-user', {
      label: user.f_RealName,
      value: user.f_UserId,
      account: user.f_Account,
      data: user,
    });
    NAV_BACK();
  }
};
const fetchList = async function () {
  if (page.value > total.value) {
    return;
  }

  loading.value = true;

  // 加载用户信息
  const params = {
    rows: 20,
    page: page.value,
    sidx: 'F_CreateDate DESC',
    keyword: searchText.value,
    companyId: companyId.value,
    departmentId: departmentId.value,
  };

  const result = await HTTP_GET({
    url: '/organization/user/page',
    params,
    errorTips: '获取用户信息失败',
  });

  loading.value = false;

  if (!result) {
    return;
  }

  const newList = result.rows.filter(
    (t) => !list.value.some((t2) => t2.f_UserId === t.f_UserId),
  );
  total.value = result.total;
  records.value = result.records;
  list.value = list.value.concat(newList);
  page.value++;

  if (page.value > total.value) {
    status.value = 'noMore';
  }
  const userMap = GET_DATA('jcode_users_map') || {};
  const _userList = result.rows.filter((t) => !userMap[t.f_UserId]);
  _userList.forEach((t) => {
    userMap[t.f_UserId] = t;
  });
};
const avatarSrc = function (user) {
  const token = GET_GLOBAL('token');
  return user.f_HeadIcon
    ? `${API.value}/system/annexesfile/${user.f_HeadIcon}?token=${token}`
    : `/static/img-avatar/head.png`;
};
const searchChange = async function (isClear) {
  if (isClear) {
    searchText.value = '';
  }
  status.value = 'loading';
  list.value = [];
  page.value = 1;
  total.value = 1;
  await fetchList();
};
const searchClick = function () {
  showRight.value.open();
};
const handleDepartmentChange = async function ({ value, label, isCompany }) {
  departmentName.value = label;
  companyId.value = '';
  departmentId.value = '';

  status.value = 'loading';
  list.value = [];
  page.value = 1;
  total.value = 1;
  if (isCompany) {
    companyId.value = value;
  } else {
    departmentId.value = value;
  }

  await fetchList();

  showRight.value.close();
};
const loadDepartments = async function (companyId__local2) {
  const list__local3 = await FETCH_DEPARTMENTS(companyId__local2);
  const res = TOTREE(
    list__local3,
    'f_DepartmentId',
    'f_ParentId',
    'f_DepartmentId',
    'f_FullName',
  );
  return res;
};
const companyOptions = function () {
  return TOTREE(
    companyList.value.map((t) => ({
      ...t,
      isCompany: true,
      isLoad: false,
    })),
    'f_CompanyId',
    'f_ParentId',
    'f_CompanyId',
    'f_FullName',
  );
};
const handleOk = function () {
  EMIT('select-jcode-user', {
    values: values.value,
    data: list.value.filter((t) => values.value.indexOf(t.f_UserId) > -1),
  });
  NAV_BACK();
};

onBackPress(() => {
  // #ifdef APP-VUE || APP-HARMONY
  HIDE_LOADING();
  // #endif

  OFF('select-jcode-user');
});
onUnload(() => {
  OFF('select-jcode-user');
});
onLoad(async () => {
  if (await PAGE_LAUNCH()) {
    await init();
  }
});
onPullDownRefresh(async () => {
  departmentName.value = '';
  searchText.value = '';
  companyId.value = '';
  departmentId.value = '';

  status.value = 'loading';
  list.value = [];
  page.value = 1;
  total.value = 1;

  await fetchList();
  uni.stopPullDownRefresh();
});
onReachBottom(() => {
  fetchList();
});
</script>
