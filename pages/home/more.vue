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
      <uni-card
        :title="$t('我的应用')"
        padding="8px"
        margin="8px"
        :border="false"
        :is-shadow="false"
        v-if="searchText.length <= 0"
      >
        <uni-grid
          :showBorder="false"
          :column="4"
          @change="funcListClick($event, myListDisplay)"
        >
          <uni-grid-item
            v-for="(listItem, listIndex) in myListDisplay"
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
            <view v-if="edit" class="ab-tr">
              <jcode-icon
                type="jcode-icon-circle-minus-base"
                size="16"
                color="#e43d33"
              ></jcode-icon>
            </view>
          </uni-grid-item>
        </uni-grid>

        <!-- 操作区按钮 -->
        <view class="padding-top" style="text-align: center">
          <button @click="editClick" :plain="true" type="primary">
            {{ edit ? $t('完成编辑') : $t('编辑“我的应用”列表') }}
          </button>
        </view>
        <view v-if="edit" class="padding-top" style="text-align: center">
          <button @click="cancelClick" :plain="true" type="warn">
            {{ $t('放弃编辑') }}
          </button>
        </view>
      </uni-card>

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
              <view v-if="edit" class="ab-tr">
                <jcode-icon
                  :color="
                    editList.includes(listItem.f_Id) ? '#e43d33' : '#3c9cff'
                  "
                  :type="
                    editList.includes(listItem.f_Id)
                      ? 'jcode-icon-circle-minus-base'
                      : 'jcode-icon-circle-add-base'
                  "
                  size="16"
                ></jcode-icon>
              </view>
            </uni-grid-item>
          </uni-grid>
        </uni-card>
      </template>
    </view>
  </view>
</template>

<script setup>
import without from 'lodash/without';
import concat from 'lodash/concat';
import keyBy from 'lodash/keyBy';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';
import values from 'lodash/values';
import { FETCH_DATAITEM, PAGE_LAUNCH, TO_MODULE } from '@/utils/jcodePlatform';
import {
  $t,
  EMIT,
  GET_GLOBAL,
  HIDE_LOADING,
  IS_MODULE_OFFLINE,
  LOADING,
  SET_ALL_DATA,
  SET_GLOBAL,
} from '@/utils/index';
import { HTTP_GET, HTTP_PUT } from '@/utils/http';
import { computed, ref } from 'vue';
import { onLoad, onShow, onBackPress } from '@dcloudio/uni-app';

const groupNames = ref({});
const groups = ref([]);
const myModules = ref([]);
const myList = ref([]);
const editList = ref([]);
const searchText = ref('');
const focus = ref(false);
const edit = ref(false);

const myListDisplay = computed(function () {
  const list = edit.value ? editList.value : myList.value;
  return list.reduce(
    (list, id) => [...list, myModules.value.find((t) => t.f_Id === id)],
    [],
  );
});
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
  // 同时发出请求，获取所有功能按钮、我的列表、数据字典中的功能名称表
  const [modules, myModuleIds, groups__local] = await Promise.all([
    HTTP_GET({ url: '/mapp/modules' }),
    HTTP_GET({ url: '/mapp/module/mylist' }),
    FETCH_DATAITEM('function'), // .then(result => mapValues(keyBy(values(result), 'f_ItemValue'), 'f_ItemName'))
  ]);
  groups.value = orderBy(groups__local, ['f_SortCode'], ['asc']);
  const groupNames__local2 = mapValues(
    keyBy(groups__local, 'f_ItemValue'),
    'f_ItemName',
  );
  initModule(modules, myModuleIds, groupNames__local2);
  HIDE_LOADING();
};
const initModule = function (modules, myModuleIds, groupNames__local3) {
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

  myList.value = myModuleIds.filter(
    (id) => myModules__local4.findIndex((t) => t.f_Id == id) > -1,
  );
  groupNames.value = groupNames__local3;
};
const editClick = async function () {
  if (!edit.value) {
    editList.value = [...myList.value];
    edit.value = true;
    return;
  }

  const success = await HTTP_PUT({
    url: `/mapp/module/mylist`,
    data: {
      ids: editList.value.join(','),
    },
    errorTips: '「我的应用」列表更新失败',
  });

  if (!success) {
    editList.value = [...myList.value];
    edit.value = false;
    return;
  }

  myList.value = [...editList.value];
  edit.value = false;
  EMIT('home-list-change');
};
const funcListIconColor = function (item) {
  const list = edit.value ? editList.value : myList.value;

  return list.includes(item.f_Id) ? '#fe955c' : '#62bbff';
};
const funcListClick = function (e, list) {
  const item = list[e.detail.index];
  if (edit.value) {
    itemClick(item.f_Id);
  } else {
    TO_MODULE(item, { f_Name: item.f_Name });
  }
};
const cancelClick = function () {
  edit.value = false;
};
const itemClick = function (id) {
  if (editList.value.includes(id)) {
    editList.value = without(editList.value, id);
    return;
  }

  editList.value = concat(editList.value, id);
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
