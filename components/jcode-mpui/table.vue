<template>
  <view class="jcode-table">
    <scroll-view
      scroll-x
      style="width: 100%; height: 100%"
      :show-scrollbar="false"
      :scroll-with-animation="false"
    >
      <view class="jcode-table__wraper">
        <view
          class="jcode-table__header"
          :style="{ width: myWidth + 'px' }"
          v-if="showHeader"
        >
          <view
            class="jcode-table__header__wraper"
            :style="{ width: myWidth + 'px' }"
          >
            <view
              :style="{
                width: (col.width || 120) + 'px',
                flex: col.isMinWidth ? 1 : '',
                'justify-content': col.align || 'left',
              }"
              class="jcode-table__header__col"
              v-for="(col, index) in columns"
              :key="index"
            >
              <text>{{ $t(col.label) }}</text>
            </view>
          </view>
        </view>
        <view class="jcode-table__content" :style="{ width: myWidth + 'px' }">
          <scroll-view
            scroll-y
            style="width: 100%; height: 100%"
            :show-scrollbar="false"
            :scroll-top="scrollTop"
            :scroll-with-animation="false"
          >
            <view
              v-for="(row, index) in dataSource"
              :key="index"
              :class="[
                'jcode-table__content__row',
                (index + 1) % 2 == 0 ? 'jcode-table__content__row_stripe' : '',
              ]"
              :style="{ width: myWidth + 'px' }"
              @click.stop="rowClick(row, index)"
            >
              <view
                :class="[
                  'jcode-table__content__td',
                  { isEllipsis: col.isEllipsis },
                ]"
                v-for="(col, index2) in columns"
                :key="index2"
                :style="{
                  width: (col.width || 120) + 'px',
                  flex: col.isMinWidth ? 1 : '',
                }"
              >
                <jcode-table-item
                  v-if="col.myScheme"
                  :component="col.myScheme"
                  :getDataSource="getDataSource"
                  :modelValue="row[col.rowid]"
                  :rowData="row"
                  @update:modelValue="setValue($event.path, $event.value, row)"
                >
                </jcode-table-item>
                <template v-else>
                  {{ myDisplayText(row[col.rowid], col.scheme) }}
                </template>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </scroll-view>
    <view class="jcode-table__floor" v-if="isPage">
      <uni-pagination
        showIcon
        :pageSize="pageSize"
        :current="page"
        :total="total"
        @change="pageChange"
      ></uni-pagination>
    </view>
  </view>
</template>

<script setup>
import debounce from 'lodash/debounce';
import set from 'lodash/set';
import { $t } from '@/utils/index';
import { computed, nextTick, ref } from 'vue';

const props = defineProps({
  page: { default: 1 },
  pageSize: { default: 20 },
  total: { default: 0 },
  columns: { default: () => [] },
  dataSource: { default: () => [] },
  showHeader: { default: true },
  isPage: { default: true },
  displayText: Function,
  getDataSource: Function,
});
const emit = defineEmits(['pageChange', 'rowClick']);
defineOptions({ name: 'jcode-table' });

const scrollTop = ref(0);

const myWidth = computed(function () {
  let width = 0;
  props.columns.forEach((col) => {
    width += col.width || 120;
  });

  return width;
});

const myDisplayText = function (value, scheme) {
  // console.log(value,scheme,'myDisplayText')
  if (props.displayText && scheme) {
    return props.displayText(value, scheme);
  }
  return value;
};
const rowClick = function (row, index) {
  emit('rowClick', { row, index });
};
const pageChange = function (e) {
  scrollTop.value = 1000;
  nextTick(() => {
    scrollTop.value = 0;
  });
  emit('pageChange', e);
};
const setValue = function (prop, value, data) {
  set(data, prop, value);
};
</script>
