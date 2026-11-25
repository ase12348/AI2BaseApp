<template>
  <view class="demo-page">
    <!-- 功能概览 -->
    <view class="demo-hero">
      <view class="demo-hero-badge">DEMO</view>
      <view class="demo-hero-name">{{ name }}</view>
      <view class="demo-hero-desc">移动端演示功能 · 用于验证「功能分类 + 功能方案」配置</view>
    </view>

    <!-- 基本信息 -->
    <view class="demo-card">
      <view class="demo-card-title">基本信息</view>
      <view class="demo-row" v-for="r in baseRows" :key="r.label">
        <text class="demo-row-k">{{ r.label }}</text>
        <text class="demo-row-v">{{ r.value || '-' }}</text>
      </view>
    </view>

    <!-- 功能方案：按钮 / 列表字段 / 表单字段 -->
    <view class="demo-card" v-for="g in groups" :key="g.title">
      <view class="demo-card-title">
        {{ g.title }}<text class="demo-count">{{ g.items.length }}</text>
      </view>
      <view v-if="!g.items.length" class="demo-empty">未配置</view>
      <view v-else class="demo-tags">
        <view class="demo-tag" v-for="(it, i) in g.items" :key="i">
          <text class="demo-tag-label">{{ it.label }}</text>
          <text class="demo-tag-prop">{{ it.prop }}</text>
        </view>
      </view>
    </view>

    <view class="demo-foot">该页面由「菜单管理 → 移动端」的功能地址直接跳转</view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { GET_GLOBAL, PATH } from '@/utils/index';

const name = ref('移动端演示');
const moduleId = ref('');
const moduleType = ref('');
const moduleUrl = ref('');
const groups = ref([
  { title: '按钮', key: 'btns', items: [] },
  { title: '列表字段', key: 'columns', items: [] },
  { title: '表单字段', key: 'formFields', items: [] },
]);

const baseRows = computed(() => [
  { label: '功能ID', value: moduleId.value },
  { label: '分类编码', value: moduleType.value },
  { label: '页面地址', value: moduleUrl.value },
]);

const load = () => {
  const path = PATH();
  const list = GET_GLOBAL('jcode_modules') || [];
  const cur =
    list.find(
      (m) =>
        m.f_Url === path ||
        m.f_Url === `/${path}` ||
        m.f_Url === path.replace(/^\//, ''),
    ) || list.find((m) => (m.f_Url || '').indexOf('pages/demo/list') > -1);
  if (!cur) {
    return;
  }
  name.value = cur.f_Name || name.value;
  moduleId.value = cur.f_Id || '';
  moduleType.value = cur.f_Type || '';
  moduleUrl.value = cur.f_Url || '';
  let scheme = cur.scheme || cur.f_Scheme || {};
  if (typeof scheme === 'string') {
    try {
      scheme = JSON.parse(scheme);
    } catch (e) {
      scheme = {};
    }
  }
  groups.value = groups.value.map((g) => ({
    ...g,
    items: Array.isArray(scheme[g.key]) ? scheme[g.key] : [],
  }));
};

onLoad(() => {
  load();
});
</script>

<style scoped>
.demo-page {
  min-height: 100vh;
  padding: 12px;
  box-sizing: border-box;
  background: #f3f5f7;
}
.demo-hero {
  padding: 22px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0c86d8, #37a5e8);
  color: #fff;
  margin-bottom: 12px;
}
.demo-hero-badge {
  display: inline-block;
  font-size: 10px;
  letter-spacing: 1px;
  padding: 2px 7px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  opacity: 0.9;
  margin-bottom: 10px;
}
.demo-hero-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
}
.demo-hero-desc {
  font-size: 12px;
  opacity: 0.85;
}
.demo-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px 14px 6px;
  margin-bottom: 12px;
}
.demo-card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 6px;
}
.demo-count {
  display: inline-block;
  margin-left: 6px;
  font-size: 11px;
  font-weight: 400;
  color: #0c86d8;
  background: #eaf4fc;
  border-radius: 10px;
  padding: 0 7px;
}
.demo-row {
  display: flex;
  align-items: flex-start;
  padding: 7px 0;
  font-size: 13px;
  border-bottom: 1px solid #fafafa;
}
.demo-row-k {
  width: 78px;
  flex: none;
  color: #888;
}
.demo-row-v {
  flex: 1;
  color: #333;
  word-break: break-all;
}
.demo-empty {
  font-size: 12px;
  color: #bbb;
  padding: 10px 0 14px;
}
.demo-tags {
  display: flex;
  flex-wrap: wrap;
  padding: 4px 0 8px;
}
.demo-tag {
  display: flex;
  align-items: center;
  border: 1px solid #d9e9f7;
  background: #f4f9fe;
  border-radius: 6px;
  padding: 6px 9px;
  margin: 0 8px 8px 0;
}
.demo-tag-label {
  font-size: 13px;
  color: #333;
}
.demo-tag-prop {
  font-size: 11px;
  color: #8aa6bd;
  margin-left: 6px;
}
.demo-foot {
  text-align: center;
  font-size: 11px;
  color: #aaa;
  padding: 8px 0 20px;
}
</style>
