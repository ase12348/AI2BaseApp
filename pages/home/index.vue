<template>
  <view class="dash" :style="{ 'min-height': SCREENHEIGHT() + 'px' }">
    <!-- 统计卡片（数据为静态示例，与 PC 端首页一致） -->
    <view class="stat-grid">
      <view v-for="(item, index) in statList" :key="index" class="stat-card">
        <view class="stat-icon" :style="{ backgroundColor: item.bgColor }">
          <jcode-icon :type="item.icon" :color="item.color" size="22" />
        </view>
        <view class="stat-num" :style="{ color: item.color }">
          {{ item.value }}
        </view>
        <view class="stat-label">{{ $t(item.label) }}</view>
      </view>
    </view>

    <!-- 订单数据 -->
    <view class="dash-card">
      <view class="card-head">
        <view class="card-title">
          <view class="card-title-bar"></view>
          <text>{{ $t('订单数据') }}</text>
        </view>
        <text class="card-extra">{{ $t('近7天') }}</text>
      </view>
      <view class="chart">
        <view class="chart-main" :style="{ height: CHART_HEIGHT + 'px' }">
          <!-- Y 轴刻度 -->
          <view class="chart-axis" :style="{ width: AXIS_WIDTH + 'px' }">
            <text
              v-for="tick in yTicks"
              :key="tick.value"
              class="chart-axis-text"
              :style="{ top: tick.top + 'px' }"
            >
              {{ tick.label }}
            </text>
          </view>
          <!-- 绘图区 -->
          <view
            class="chart-plot"
            :style="{ width: plotWidth + 'px', height: CHART_HEIGHT + 'px' }"
          >
            <view
              v-for="(line, index) in gridLines"
              :key="'g' + index"
              class="grid-line"
              :style="{ top: line + 'px' }"
            ></view>
            <view
              v-for="(col, index) in areaColumns"
              :key="'a' + index"
              class="area-col"
              :style="{
                left: col.x + 'px',
                top: col.y + 'px',
                width: col.w + 'px',
                height: col.h + 'px',
              }"
            ></view>
            <view
              v-for="(seg, index) in segments"
              :key="'s' + index"
              class="line-seg"
              :style="{
                left: seg.x + 'px',
                top: seg.y + 'px',
                width: seg.len + 'px',
                transform: 'rotate(' + seg.angle + 'deg)',
              }"
            ></view>
            <view
              v-for="(point, index) in points"
              :key="'p' + index"
              class="dot"
              :style="{ left: point.x - 3 + 'px', top: point.y - 3 + 'px' }"
            ></view>
          </view>
        </view>
        <!-- X 轴刻度 -->
        <view
          class="chart-x"
          :style="{ marginLeft: AXIS_WIDTH + 'px', width: plotWidth + 'px' }"
        >
          <text
            v-for="(label, index) in xLabels"
            :key="index"
            class="chart-x-text"
            :style="{ left: points[index].x + 'px' }"
          >
            {{ $t(label) }}
          </text>
        </view>
      </view>
    </view>

    <!-- 新闻列表 -->
    <view class="dash-card">
      <view class="card-head">
        <view class="card-title">
          <view class="card-title-bar"></view>
          <text>{{ $t('新闻列表') }}</text>
        </view>
      </view>
      <view class="msg-list">
        <view v-for="(item, index) in newsList" :key="index" class="msg-line">
          <text class="msg-tag">[{{ $t(item.tag) }}]</text>
          <text class="msg-title">{{ $t(item.title) }}</text>
          <text class="msg-date">{{ item.date }}</text>
        </view>
      </view>
    </view>

    <!-- 通知公告 -->
    <view class="dash-card">
      <view class="card-head">
        <view class="card-title">
          <view class="card-title-bar"></view>
          <text>{{ $t('通知公告') }}</text>
        </view>
      </view>
      <view class="msg-list">
        <view v-for="(item, index) in noticeList" :key="index" class="msg-line">
          <text class="msg-tag">[{{ $t(item.tag) }}]</text>
          <text class="msg-title">{{ $t(item.title) }}</text>
          <text class="msg-date">{{ item.date }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import {
  $t,
  GET_GLOBAL,
  GET_STORAGE,
  RELAUNCH_TO,
  SCREENHEIGHT,
  SET_GLOBAL,
} from '@/utils/index';
import { FETCH_CURRENT_USERINFO } from '@/utils/jcodePlatform';
import { CLEAR_AUTH_TOKEN } from '@/utils/http';

// 统计卡片：数值与 PC 端首页保持一致，全部为静态示例数据
const statList = ref([
  {
    label: '最新商机量',
    value: '300',
    icon: 'form-outlined',
    color: '#67c23a',
    bgColor: '#e1f3d7',
  },
  {
    label: '最新客户量',
    value: '100',
    icon: 'user-outlined',
    color: '#409eff',
    bgColor: '#ecf5ff',
  },
  {
    label: '新签订单量',
    value: '200',
    icon: 'file-done-outlined',
    color: '#e6a23c',
    bgColor: '#faecd8',
  },
  {
    label: '销售额',
    value: '3,000,000',
    icon: 'money-collect-outlined',
    color: '#f56c6c',
    bgColor: '#fde2e2',
  },
]);
const newsList = ref([
  { tag: '新闻', title: '极简搭AI开发底座社区版本发布', date: '2020-11-01' },
  { tag: '新闻', title: '极简搭AI开发底座java版本发布', date: '2020-05-01' },
  { tag: '新闻', title: '极简搭AI开发底座最新更新', date: '2020-04-01' },
  { tag: '新闻', title: '极简搭集成新的报表插件', date: '2020-03-01' },
  { tag: '新闻', title: '极简搭成立新的研发团队', date: '2020-02-01' },
]);
const noticeList = ref([
  { tag: '公告', title: '国庆节放假安排', date: '2020-06-01' },
  { tag: '通知', title: '苏州分公司总经理任命书', date: '2020-05-21' },
  { tag: '通知', title: '公司开票信息更新通知', date: '2020-04-21' },
  { tag: '公告', title: '全体员工体验通知', date: '2020-03-01' },
  { tag: '通知', title: '华东区营销总监任命书', date: '2020-02-01' },
]);

// 折线图：用普通 view 拼接折线 + 面积柱，不依赖图表库，H5/App/小程序通用
const CHART_VALUES = [300, 932, 901, 934, 1290, 2000, 800];
const X_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const CHART_MAX = 2000;
const CHART_HEIGHT = 160;
const AXIS_WIDTH = 32;
const PADDING_TB = 8;
const AREA_COLUMNS = 48;

const windowWidth = uni.getSystemInfoSync().windowWidth || 375;
// 页面左右各 12px + 卡片左右各 12px + Y 轴宽度
const plotWidth = ref(Math.max(180, windowWidth - 24 - 24 - AXIS_WIDTH));

const yOf = function (value) {
  const inner = CHART_HEIGHT - PADDING_TB * 2;
  return CHART_HEIGHT - PADDING_TB - (value / CHART_MAX) * inner;
};

const points = ref(
  CHART_VALUES.map((value, index) => ({
    x: +((plotWidth.value / (CHART_VALUES.length - 1)) * index).toFixed(2),
    y: +yOf(value).toFixed(2),
  })),
);
const segments = ref(
  points.value.slice(1).map((point, index) => {
    const prev = points.value[index];
    const dx = point.x - prev.x;
    const dy = point.y - prev.y;
    return {
      x: prev.x,
      y: +(prev.y - 1).toFixed(2),
      len: +Math.sqrt(dx * dx + dy * dy).toFixed(2),
      angle: +((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(2),
    };
  }),
);
// 面积：横向切 48 列，按折线高度铺色，近似 PC 端的 areaStyle
const areaColumns = ref(
  Array.from({ length: AREA_COLUMNS }, (_, index) => {
    const colWidth = plotWidth.value / AREA_COLUMNS;
    const pos = (index / (AREA_COLUMNS - 1)) * (CHART_VALUES.length - 1);
    const low = Math.min(Math.floor(pos), CHART_VALUES.length - 2);
    const ratio = pos - low;
    const value =
      CHART_VALUES[low] + (CHART_VALUES[low + 1] - CHART_VALUES[low]) * ratio;
    const y = yOf(value);
    return {
      x: +(index * colWidth).toFixed(2),
      y: +y.toFixed(2),
      w: +(colWidth + 0.6).toFixed(2),
      h: +(CHART_HEIGHT - y).toFixed(2),
    };
  }),
);
const gridLines = ref(
  [0, 1000, 2000].map((value) => +yOf(value).toFixed(2)),
);
const yTicks = ref(
  [2000, 1000, 0].map((value) => ({
    value,
    label: String(value),
    top: +(yOf(value) - 7).toFixed(2),
  })),
);
const xLabels = ref(X_LABELS);

onLoad(async () => {
  // 静态首页同样需要登录态，未登录直接回登录页
  const token = GET_GLOBAL('token') || GET_STORAGE('token');
  if (!token || token === 'null' || token === 'undefined') {
    RELAUNCH_TO('/pages/login');
    return;
  }
  SET_GLOBAL('token', token);

  if (GET_GLOBAL('loginUser')) {
    return;
  }
  const success = await FETCH_CURRENT_USERINFO();
  if (!success) {
    CLEAR_AUTH_TOKEN();
    RELAUNCH_TO('/pages/login');
  }
});
</script>

<style lang="scss" scoped>
.dash {
  padding: 12px;
  box-sizing: border-box;
  background-color: #f3f3f3;
}

/* 统计卡片 */
.stat-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.stat-card {
  position: relative;
  box-sizing: border-box;
  width: 48.6%;
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 6px;
  background-color: #fff;
  background-image: url('/static/img/home/target.png');
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 100% auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.stat-num {
  margin-top: 10px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
}

.stat-label {
  margin-top: 2px;
  color: #666;
  font-size: 12px;
}

/* 卡片通用 */
.dash-card {
  box-sizing: border-box;
  margin-bottom: 10px;
  padding: 12px;
  border-radius: 6px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.card-title-bar {
  width: 3px;
  height: 14px;
  margin-right: 6px;
  border-radius: 2px;
  background-color: #0c86d8;
}

.card-extra {
  color: #999;
  font-size: 12px;
}

/* 折线图 */
.chart-main {
  display: flex;
}

.chart-axis {
  position: relative;
  flex: none;
}

.chart-axis-text {
  position: absolute;
  right: 6px;
  color: #999;
  font-size: 10px;
  line-height: 14px;
}

.chart-plot {
  position: relative;
  overflow: hidden;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 0;
  border-top: 1px dashed #e8eaee;
}

.area-col {
  position: absolute;
  background-color: #ecf5ff;
}

.line-seg {
  position: absolute;
  height: 2px;
  border-radius: 1px;
  background-color: #409eff;
  transform-origin: 0 50%;
}

.dot {
  position: absolute;
  box-sizing: border-box;
  width: 6px;
  height: 6px;
  border: 1.5px solid #409eff;
  border-radius: 50%;
  background-color: #fff;
}

.chart-x {
  position: relative;
  height: 14px;
  margin-top: 6px;
}

.chart-x-text {
  position: absolute;
  top: 0;
  color: #999;
  font-size: 10px;
  line-height: 14px;
  white-space: nowrap;
  transform: translateX(-50%);
}

/* 新闻 / 公告列表 */
.msg-list {
  margin: 0 -12px -12px;
}

.msg-line {
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 40px;
  border-top: 1px solid #f0f0f0;
}

.msg-tag {
  flex: none;
  color: #0c86d8;
  font-size: 12px;
}

.msg-title {
  flex: 1;
  overflow: hidden;
  margin: 0 8px;
  color: #333;
  font-size: 13px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.msg-date {
  flex: none;
  color: #999;
  font-size: 11px;
}
</style>
