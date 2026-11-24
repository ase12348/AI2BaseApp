<template>
  <view class="l-tree-view">
    <jcode-tree-item
      :loadData="loadData"
      @select="handleSelect"
      :data="item"
      v-for="(item, index) in myOptions"
      :key="index"
    >
    </jcode-tree-item>
  </view>
</template>

<script setup>
import { TOTREE } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  idKey: {
    type: String,
    default: 'id',
  },
  pIdKey: {
    type: String,
    default: 'pid',
  },
  options: {
    type: Array,
    default: () => [],
  },
  isTreeData: Boolean,
  loadData: Function,
});
const emit = defineEmits(['change']);
defineOptions({ name: 'jcode-tree-view' });

const myOptions = computed(function () {
  if (props.isTreeData) {
    return props.options;
  } else {
    return TOTREE(
      props.options,
      props.idKey,
      props.pIdKey,
      props.valueKey,
      props.labelKey,
    );
  }
});

const handleSelect = function (item) {
  emit('change', item);
};
</script>
<style lang="scss" scoped>
.l-tree-view {
  padding: 8px 8px 0;
  background-color: #fff;
}
</style>
