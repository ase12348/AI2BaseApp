<template>
  <view class="page" style="padding-top: 56px">
    <!-- 顶部搜索栏 -->
    <view class="bg-white fixed">
      <uni-search-bar
        :placeholder="$t('搜索应用名')"
        :focus="focus"
        cancelButton="none"
        v-model="searchText"
      ></uni-search-bar>
    </view>
    <view style="padding-top: 8px">
      <!-- 分块显示功能区 -->
      <template v-for="(group, title) in groupList" :key="title">
        <uni-card
          :title="title"
          padding="8px"
          margin="8px"
          :border="false"
          :is-shadow="false"
        >
          <uni-grid
            :showBorder="false"
            :column="4"
            @change="funcListClick($event, group)"
          >
            <uni-grid-item
              v-for="(listItem, listIndex) in group"
              :key="listIndex"
              :index="listIndex"
            >
              <view class="jcode-grid-item">
                <view class="jcode-grid-icon">
                  <jcode-icon
                    :type="listItem.icon"
                    :color="listItem.f_Color"
                    size="24"
                  ></jcode-icon>
                </view>
                <view
                  ><text class="jcode-grid-text">{{
                    $t(listItem.f_Name)
                  }}</text></view
                >
              </view>
            </uni-grid-item>
          </uni-grid>
        </uni-card>
      </template>
    </view>
  </view>
</template>

<script setup>
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import { FETCH_DATAITEM, PAGE_LAUNCH, TO_MODULE } from '@/utils/jcodePlatform';
import {
  $t,
  GET_GLOBAL,
  HIDE_LOADING,
  IS_MODULE_OFFLINE,
  LOADING,
  SET_ALL_DATA,
  SET_GLOBAL,
} from '@/utils/index';
import { HTTP_GET } from '@/utils/http';
import { computed, ref } from 'vue';
import { onLoad, onShow, onBackPress } from '@dcloudio/uni-app';

const groupNames = ref({});
const groups = ref([]);
const myModules = ref([]);
const searchText = ref('');
const focus = ref(false);

const groupList = computed(function () {
  const modusDic = groupBy(
    myModules.value.filter((item) => item.f_Name.includes(searchText.value)),
    'f_Type',
  );
  const res = {};
  groups.value.forEach((group) => {
    if (modusDic[group.f_ItemValue] && modusDic[group.f_ItemValue].length > 0) {
      res[group.f_ItemName] = modusDic[group.f_ItemValue];
    }
  });
  return res;
});

const init = async function (search) {
  focus.value = !!search;
  LOADING('加载功能列表中…');
  // 同时发出请求，获取所有功能按钮、数据字典中的功能名称表
  const [modules, groups__local] = await Promise.all([
    HTTP_GET({ url: '/mapp/modules' }),
    FETCH_DATAITEM('function'), // .then(result => mapValues(keyBy(values(result), 'f_ItemValue'), 'f_ItemName'))
  ]);
  groups.value = orderBy(groups__local, ['f_SortCode'], ['asc']);
  const groupNames__local2 = mapValues(
    keyBy(groups__local, 'f_ItemValue'),
    'f_ItemName',
  );
  initModule(modules, groupNames__local2);
  HIDE_LOADING();
};
const initModule = function (modules, groupNames__local3) {
  const loginUser = GET_GLOBAL('loginUser');
  // 功能区按钮需要处理 icon
  const myModules__local4 = [];
  modules.forEach((item) => {
    if (
      item.f_EnabledMark == 1 &&
      item.f_IsSystem != 3 &&
      !IS_MODULE_OFFLINE(item) &&
      (loginUser.f_SecurityLevel == 1 ||
        loginUser.f_SecurityLevel == 5 ||
        (loginUser.moduleAuthIds || []).indexOf(item.f_Id) > -1)
    ) {
      const icon = item.f_Icon ? item.f_Icon : '';
      myModules__local4.push({ ...item, icon: icon });
    }
  });
  SET_GLOBAL('jcode_modules', myModules__local4);
  myModules.value = myModules__local4;
  groupNames.value = groupNames__local3;
};
const funcListClick = function (e, list) {
  const item = list[e.detail.index];
  TO_MODULE(item, { f_Name: item.f_Name });
};

onLoad(async ({ search }) => {
  if (await PAGE_LAUNCH()) {
    await init(search);
  }
});
onShow(() => {
  SET_ALL_DATA({}); // 清空页面数据
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
