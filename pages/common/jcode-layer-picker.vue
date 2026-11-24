<template>
  <view class="page" style="padding-top: 56px">
    <view class="bg-white fixed">
      <uni-search-bar
        :placeholder="$t('搜索关键字')"
        cancelButton="none"
        @confirm="searchChange(false)"
        @clear="searchChange(true)"
        v-model="searchText"
      ></uni-search-bar>
    </view>
    <uni-list v-if="ready">
      <uni-list-item
        clickable
        @click="itemClick(item)"
        :key="index"
        v-for="(item, index) in showOptions"
        direction="column"
      >
        <template v-slot:body>
          <view>
            <view
              v-for="(col, index2) in columns"
              :key="index2"
              class="jcode-list-item__content jcode-flex"
            >
              <text>{{ col.label }}</text>
              <text>{{ item[col.prop] }}</text>
            </view>
          </view>
        </template>
      </uni-list-item>
    </uni-list>
  </view>
</template>

<script setup>
import {
  $t,
  EMIT,
  GET_PARAM,
  HIDE_LOADING,
  NAV_BACK,
  OFF,
  PAGINATION,
} from '@/utils/index';
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import { ref } from 'vue';
import {
  onBackPress,
  onUnload,
  onLoad,
  onReachBottom,
} from '@dcloudio/uni-app';

const isLayer = ref(true);
const options = ref([]);
const showOptions = ref([]);
const columns = ref([]);
const searchText = ref('');
const page = ref(1);
const total = ref(1);
const ready = ref(false);

const init = function () {
  const { columns: columns__local, options: options__local2 } = GET_PARAM();
  options.value = options__local2;
  showOptions.value = [];
  columns.value = columns__local;
  fetchList();
  ready.value = true;
};
const itemClick = function (item) {
  EMIT('jcode-layer-picker', item);
  NAV_BACK();
};
const searchChange = function (isClear) {
  if (isClear) {
    searchText.value = '';
    showOptions.value = options.value;
  }
  page.value = 1;
  total.value = 1;
  showOptions.value = [];
  fetchList();
};
const fetchList = function () {
  if (page.value > total.value) {
    return;
  }
  console.log();

  let options__local3 = [];
  if (searchText.value) {
    options__local3 = options.value.filter((t) => {
      let res = false;
      for (const col of columns.value) {
        const item = (t[col.prop] || '') + '';
        if (item.indexOf(searchText.value) != -1) {
          res = true;
          break;
        }
      }
      return res;
    });
  } else {
    options__local3 = options.value;
  }
  total.value = options__local3.length;
  const list = PAGINATION(page.value, 20, options__local3);

  showOptions.value = showOptions.value.concat(list);
  page.value++;
};

onBackPress(() => {
  // #ifdef APP-VUE || APP-HARMONY
  HIDE_LOADING();
  // #endif

  OFF('jcode-layer-picker');
});
onUnload(() => {
  OFF('jcode-layer-picker');
});
onLoad(async () => {
  if (await PAGE_LAUNCH()) {
    init();
  }
});
onReachBottom(() => {
  fetchList();
});
</script>
