<template>
  <view
    class="page"
    :style="{
      'min-height': SCREENHEIGHT() + 'px',
      'padding-top': '56px',
      'padding-bottom': '40px',
    }"
  >
    <view class="bg-white fixed">
      <uni-search-bar
        v-model="keyword"
        @confirm="searchData"
        @cancel="cancelSearch"
        @clear="cancelSearch"
      />
    </view>
    <view>
      <uni-list>
        <uni-list-item
          clickable
          @click="itemClick(item)"
          :key="item.f_Id"
          v-for="item in list"
          direction="column"
        >
          <template v-slot:header>
            <view class="jcode-flex">
              <text class="jcode-list-item__title">
                {{ item.f_Name }}
              </text>
              <button
                @click.stop="handleDelete(item)"
                style="margin-left: 16px"
                type="warn"
                class="jcode-btn"
              >
                {{ $t('删除') }}
              </button>
            </view>
          </template>
          <template v-slot:body>
            <view class="jcode-list-item__content">
              <view
                ><text>{{ $t('成员') }}：{{ item.person }} </text></view
              >
              <view
                ><text>{{ $t('负责人') }}：{{ item.f_CreateUserName }}</text></view
              >
              <view
                ><text>{{ $t('打卡日期') }}：{{ item.date }}</text></view>
              >
              <view
                ><text
                  >{{ $t('打卡时间') }}：{{ item.f_Time.replace(/\|/g, ' ') }}</text
                ></view
              >
              <view
                ><text>{{ $t('打卡地点') }}：{{ item.f_Scope.split(',')[0] }}</text></view
              >
            </view>
          </template>
        </uni-list-item>
      </uni-list>
      <uni-load-more v-if="loading || status === 'noMore'" :status="status" />
    </view>

    <view class="jcode-bottom-btns">
      <button @click.stop="handleAdd" type="primary">{{ $t('新增考勤组') }}</button>
    </view>
  </view>
</template>

<script setup>
import { GET_MODULEID, PAGE_LAUNCH } from '@/utils/jcodePlatform';
import {
  $t,
  CONFIRM,
  GET_DATA,
  HIDE_LOADING,
  LOADING,
  NAV_BACK,
  NAV_TO_LAYER,
  ON,
  SCREENHEIGHT,
  TOAST,
} from '@/utils/index';
import { HTTP_DELETE, HTTP_GET } from '@/utils/http';
import { jcode_form_fetchOrganizeInfo } from '@/common/customform.js';
import { ref } from 'vue';
import {
  onLoad,
  onPullDownRefresh,
  onReachBottom,
  onBackPress,
} from '@dcloudio/uni-app';

const showSearch = ref(false);
const loading = ref(true);
const status = ref('loading');
const rows = ref(20);
const page = ref(1);
const total = ref(1);
const list = ref([]);
const keyword = ref('');
const moduleId = ref('');
const dayOptions = ref([
  {
    label: $t('星期一'),
    value: '1',
  },
  {
    label: $t('星期二'),
    value: '2',
  },
  {
    label: $t('星期三'),
    value: '3',
  },
  {
    label: $t('星期四'),
    value: '4',
  },
  {
    label: $t('星期五'),
    value: '5',
  },
  {
    label: $t('星期六'),
    value: '6',
  },
  {
    label: $t('星期天'),
    value: '7',
  },
]);
const options = ref([
  {
    value: '1',
    label: $t('一天一班'),
  },
  {
    value: '2',
    label: $t('一天两班'),
  },
  {
    value: '3',
    label: $t('一天三班'),
  },
]);

const closePage = function () {
  NAV_BACK();
};
const init = async function () {
  moduleId.value = GET_MODULEID();
  await refreshList();
  ON(`custom-list-change-${moduleId.value}`, refreshList);
};
const fetchList = async function () {
  if (page.value > total.value) {
    return;
  }
  loading.value = true;

  const result = await HTTP_GET({
    url: '/demoApp/apprule/page',
    params: {
      page: page.value,
      rows: rows.value,
      sidx: 'f_CreateDate DESC',
      f_Name: keyword.value,
    },
  });

  if (!result) {
    return;
  }

  const newList = result.rows.filter(
    (t) => !list.value.some((t2) => t2.f_Id === t.f_Id),
  );

  /*数据转化加载*/
  await fetchOrganizeInfo(newList);
  for (const item of newList) {
    item.person = '';
    const users = item.f_Person.split(',');
    for (const userid of users) {
      const user = GET_DATA('jcode_users_map')[userid];
      if (user) {
        if (item.person) {
          item.person += ',';
        }
        item.person += user.label || '';
      }
    }
    const dateList = [];
    const dates = item.f_Date.split(',');
    for (const dateid of dates) {
      const dataItem = dayOptions.value.find((t) => t.value == dateid);
      if (dataItem) {
        dateList.push(dataItem.label);
      }
    }
    item.date = String(dateList);
  }

  total.value = result.total;
  list.value = list.value.concat(newList);
  page.value++;

  loading.value = false;
  if (page.value > total.value) {
    status.value = 'noMore';
  }

  console.log(result, 'result');
};
const fetchOrganizeInfo = async function (list__local) {
  const userIdList = [];

  for (const row of list__local) {
    const users = row.f_Person.split(',');
    for (const userid of users) {
      if (userIdList.findIndex((t) => t == userid) == -1) {
        userIdList.push(userid);
      }
    }
  }

  await jcode_form_fetchOrganizeInfo(userIdList, []);
};
const refreshList = async function () {
  loading.value = true;
  status.value = 'loading';
  list.value = [];
  page.value = 1;
  total.value = 1;
  await fetchList();
};
const searchData = async function () {
  await refreshList();
};
const cancelSearch = async function () {
  keyword.value = '';
  await refreshList();
};
const itemClick = function (row) {
  NAV_TO_LAYER(
    '/pagesDemo/clock/addSetting?type=edit',
    {
      keyValue: row.f_Id,
      moduleId: moduleId.value,
      title: row.f_Name,
    },
    true,
  );
};
const handleAdd = function () {
  NAV_TO_LAYER(
    '/pagesDemo/clock/addSetting?type=create',
    {
      moduleId: moduleId.value,
      title: $t('添加考勤组'),
    },
    true,
  );
};
const handleDelete = async function (row) {
  if (!(await CONFIRM('删除项目', '确定要删除该项吗？', true))) {
    return;
  }

  LOADING('提交删除中…');

  const success = await HTTP_DELETE({
    url: '/demoApp/apprule/' + row.f_Id,
    errorTips: '删除失败',
  });
  HIDE_LOADING();
  if (success) {
    TOAST('删除成功', 'success');
    const list__local2 = list.value;
    const index = list__local2.findIndex((item) => item.f_Id === row.f_Id);
    list__local2.splice(index, 1);
  }
};
const toggleSearch = function () {
  showSearch.value = !showSearch.value;
};

onLoad(async () => {
  if (await PAGE_LAUNCH()) {
    await init();
  }
});
onPullDownRefresh(async () => {
  keyword.value = '';
  await refreshList();
  uni.stopPullDownRefresh();
});
onReachBottom(() => {
  fetchList();
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
