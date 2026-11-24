<template>
  <view class="jcode-edit-table-item">
    <view class="jcode-edit-table-item__title" @click.stop="handleClickTitle">
      <view>
        <uni-icons
          class="lefticon"
          :type="isOpen ? 'bottom' : 'right'"
          size="14"
          color="#c0c4cc"
        ></uni-icons>
        <text>{{ $t('第') }}{{ num }}{{ $t('行') }}</text>
      </view>
    </view>
    <view class="jcode-edit-table-item__content" v-if="isOpen">
      <view v-for="(col, index) in columns" :key="index" class="row">
        <view class="label">{{ $t(col.label) }}</view>
        <view class="content">{{ rowData[col.prop] || '' }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { $t } from '@/utils/index';
import { ref } from 'vue';

const props = defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  num: Number,
  rowData: {},
});
defineOptions({ name: 'jcode-view-table-item' });

const isOpen = ref(true);

const handleClickTitle = function () {
  isOpen.value = !isOpen.value;
};
</script>

<style lang="scss" scoped>
.jcode-edit-table-item {
  &__title {
    padding: 0 8px;
    font-size: 12px;
    color: $uni-base-color;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 32px;
    background-color: $uni-info-light;
    box-sizing: border-box;

    .lefticon {
      margin-right: 4px;
    }
  }

  &__content {
    padding: 16px 8px 0 8px;
    background-color: #fdfdfd;
    position: relative;
    .row {
      position: relative;
      width: 100%;
      height: 32px;
    }

    .label {
      float: left;
    }

    .content {
      float: right;
    }
  }
}
</style>
