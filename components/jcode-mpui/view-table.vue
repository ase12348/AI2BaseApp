<template>
  <view class="jcode-view-table">
    <view v-if="title" class="jcode-view-table__title">
      <text>{{ $t(title) }}</text>
    </view>
    <view class="jcode-view-table__body">
      <jcode-view-table-item
        v-for="(row, index) in dataSource"
        :key="index"
        :num="index + 1"
        :rowData="row"
        :columns="columns"
      />
    </view>
  </view>
</template>

<script setup>
import { FETCH_DATASOURCE } from '@/utils/jcodePlatform';
import { $t } from '@/utils/index';
import { watch, ref } from 'vue';

const props = defineProps({
  title: String,
  columns: {
    type: Array,
    default: () => [],
  },
  code: String,
  paramFiled: [String, Number],
});
defineOptions({ name: 'jcode-view-table' });

const dataSource = ref([]);

const viewTableData = async function () {
  if (props.paramFiled && props.code) {
    const data = await FETCH_DATASOURCE(props.code, props.paramFiled);
    dataSource.value = data || [];
  } else {
    dataSource.value = [];
  }
};

watch(
  () => props.paramFiled,
  function () {
    viewTableData();
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
.jcode-view-table {
  &__title {
    font-size: 13px;
    color: #666666;
    display: flex;
    align-items: center;
    width: 100%;
    height: 32px;
  }
  margin-bottom: 16px;
}
</style>
