<template>
  <view class="l-tree-item">
    <view @tap.stop="handleClick" class="l-tree-item__content">
      <uni-icons
        v-if="hasChildren() || data.isLoad == false"
        class="l-tree-item__lefticon"
        :type="isOpen ? 'bottom' : 'right'"
        size="14"
        color="#c0c4cc"
      ></uni-icons>
      <view
        v-else
        class="l-tree-item__lefticon_empty"
        size="14"
        color="#c0c4cc"
      ></view>
      <view class="l-tree-item__text">{{ data.label }}</view>
      <view
        v-if="!data.disabled"
        class="l-tree-item__btn"
        @tap.stop="handleSelect"
        >{{ $t('选择') }}</view
      >
      <view class="jcode-popup-line"></view>
    </view>

    <view style="padding-left: 16px" v-if="isOpen && hasChildren()">
      <jcode-tree-item
        :loadData="loadData"
        @select="handleChildrenSelect"
        :data="item"
        v-for="(item, index) in getChildren()"
        :key="index"
      ></jcode-tree-item>
    </view>
  </view>
</template>

<script setup>
import { $t, HIDE_LOADING, LOADING, VALIDATENULL } from '@/utils/index';
import { nextTick, ref } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  loadData: Function,
});
const emit = defineEmits(['select']);
defineOptions({ name: 'jcode-tree-item' });

const isOpen = ref(false);
const isLoading = ref(false);
const isLoad = ref(false);

const handleClick = async function () {
  if (props.data.isLoad == false && props.loadData) {
    // 数据懒加载
    if (!isLoading.value) {
      LOADING('加载数据');
      isLoading.value = true;
      const list = await props.loadData(props.data.value, props.data);

      props.data.isLoad = true;
      const children = props.data.children || [];
      children.push(...list);
      props.data['children'] = children;

      nextTick(() => {
        isOpen.value = true;
        isLoading.value = false;
        HIDE_LOADING();
      });
    }
  } else if (hasChildren()) {
    isOpen.value = !isOpen.value;
  }
};
const hasChildren = function () {
  console.log(props.data.children);
  return !VALIDATENULL(props.data.children);
};
const getChildren = function () {
  return props.data.children;
};
const handleSelect = function () {
  emit('select', props.data);
};
const handleChildrenSelect = function (e) {
  emit('select', e);
};
</script>
<style lang="scss" scoped>
.l-tree-item {
  &__content {
    height: 40px;
    display: flex;
    align-items: center;
    position: relative;
  }

  &__lefticon {
    margin-right: 4px;
  }
  &__lefticon_empty {
    height: 14px;
    width: 22px;
  }
  &__text {
    width: 100%;
  }
  &__btn {
    color: #2979ff;
    font-size: 14px;
    width: 40px;
  }
}
</style>
