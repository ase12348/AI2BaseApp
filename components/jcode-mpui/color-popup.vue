<template>
  <uni-popup ref="popup" @change="popupchange" type="bottom">
    <view class="jcode-color-view__wraper">
      <view class="close" @click.stop="close">
        <jcode-icon type="jcode-icon-error"></jcode-icon>
      </view>

      <view
        class="jcode-color-view__panel"
        :style="{
          background:
            'rgb(' + bgcolor.r + ',' + bgcolor.g + ',' + bgcolor.b + ')',
        }"
      >
        <view
          class="background boxs"
          @touchstart.stop="touchstart($event, 0)"
          @touchmove.stop="touchmove($event, 0)"
        >
          <view class="mask"></view>
          <view
            class="pointer"
            :style="{
              top: site[0].top - 8 + 'px',
              left: site[0].left - 8 + 'px',
            }"
          ></view>
        </view>
      </view>
      <view class="jcode-color-view__control-panel">
        <view class="color-wraper">
          <view
            class="color-content"
            :style="{
              background:
                'rgba(' +
                rgba.r +
                ',' +
                rgba.g +
                ',' +
                rgba.b +
                ',' +
                rgba.a +
                ')',
            }"
          ></view>
        </view>
        <view class="control-wraper">
          <view
            class="controller boxs"
            @touchstart.stop="touchstart($event, 1)"
            @touchmove.stop="touchmove($event, 1)"
          >
            <view class="hue">
              <view
                class="circle"
                :style="{ left: site[1].left - 12 + 'px' }"
              ></view>
            </view>
          </view>
          <view
            class="controller boxs"
            @touchstart.stop="touchstart($event, 2)"
            @touchmove.stop="touchmove($event, 2)"
          >
            <view class="transparency">
              <view
                class="circle"
                :style="{ left: site[2].left - 12 + 'px' }"
              ></view>
            </view>
          </view>
        </view>
      </view>
      <view class="alternative">
        <view
          class="alternative__item"
          v-for="(item, index) in colorList"
          :key="index"
        >
          <view
            class="alternative__item-content"
            :style="{
              background:
                'rgba(' +
                item.r +
                ',' +
                item.g +
                ',' +
                item.b +
                ',' +
                item.a +
                ')',
            }"
            @click="selectColor(item)"
          >
          </view>
        </view>
      </view>
      <view class="result-wraper">
        <view class="result-wraper__input">{{
          'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a + ')'
        }}</view>
      </view>
      <view class="jcode-popup-button-wraper">
        <view class="jcode-popup-button-ok" @click="confirm">{{
          $t('确认')
        }}</view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { $t, VALIDATENULL } from '@/utils/index';
import { ref, onBeforeMount } from 'vue';
import { getCurrentInstance } from 'vue';

const props = defineProps({
  color: {
    type: Object,
    default() {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      };
    },
  },
  spareColor: {
    type: Array,
    default() {
      return [];
    },
  },
});
const emit = defineEmits(['confirm']);
defineOptions({ name: 'jcode-color-popup' });

const { proxy } = getCurrentInstance();

const position = ref(null);
const flag = ref(false);
const rgba = ref({
  r: 0,
  g: 0,
  b: 0,
  a: 1,
});
const hsb = ref({
  h: 0,
  s: 0,
  b: 0,
});
const site = ref([
  {
    top: 0,
    left: 0,
  },
  {
    left: 0,
  },
  {
    left: 0,
  },
]);
const index = ref(0);
const bgcolor = ref({
  r: 255,
  g: 0,
  b: 0,
  a: 1,
});
const hex = ref('#000000');
const mode = ref(true);
const colorList = ref([
  {
    r: 244,
    g: 67,
    b: 54,
    a: 1,
  },
  {
    r: 233,
    g: 30,
    b: 99,
    a: 1,
  },
  {
    r: 156,
    g: 39,
    b: 176,
    a: 1,
  },
  {
    r: 103,
    g: 58,
    b: 183,
    a: 1,
  },
  {
    r: 63,
    g: 81,
    b: 181,
    a: 1,
  },
  {
    r: 33,
    g: 150,
    b: 243,
    a: 1,
  },
  {
    r: 3,
    g: 169,
    b: 244,
    a: 1,
  },
  {
    r: 0,
    g: 188,
    b: 212,
    a: 1,
  },
  {
    r: 0,
    g: 150,
    b: 136,
    a: 1,
  },
  {
    r: 76,
    g: 175,
    b: 80,
    a: 1,
  },
  {
    r: 139,
    g: 195,
    b: 74,
    a: 1,
  },
  {
    r: 205,
    g: 220,
    b: 57,
    a: 1,
  },
  {
    r: 255,
    g: 235,
    b: 59,
    a: 1,
  },
  {
    r: 255,
    g: 193,
    b: 7,
    a: 1,
  },
  {
    r: 255,
    g: 152,
    b: 0,
    a: 1,
  },
  {
    r: 255,
    g: 87,
    b: 34,
    a: 1,
  },
  {
    r: 121,
    g: 85,
    b: 72,
    a: 1,
  },
  {
    r: 158,
    g: 158,
    b: 158,
    a: 1,
  },
  {
    r: 0,
    g: 0,
    b: 0,
    a: 0.5,
  },
  {
    r: 0,
    g: 0,
    b: 0,
    a: 0,
  },
]);

const popup = ref(null);

const moveX = ref(null);
const moveY = ref(null);
const pageX = ref(null);
const pageY = ref(null);

const open = function (color) {
  if (!VALIDATENULL(color)) {
    if (color.indexOf('rgba') != -1) {
      const colorList__local = color
        .replace('rgba(', '')
        .replace(')', '')
        .split(',');
      if (colorList__local.length == 4) {
        rgba.value.r = colorList__local[0];
        rgba.value.g = colorList__local[1];
        rgba.value.b = colorList__local[2];
        rgba.value.a = colorList__local[3];
      }
    }
  }
  popup.value.open();
};
const close = function () {
  popup.value.close();
};
const init = function () {
  hsb.value = rgbToHsb(rgba.value);
  setValue(rgba.value);
  setTimeout(() => {
    getSelectorQuery();
  }, 100);
};
const popupchange = function ({ show }) {
  if (show) {
    init();
  } else {
    flag.value = false;
  }
};
const confirm = function () {
  close();
  emit('confirm', {
    rgba: rgba.value,
    hex: hex.value,
  });
};
const select = function () {
  mode.value = !mode.value;
};
const selectColor = function (item) {
  setColorBySelect(item);
};
const touchstart = function (e, index__local2) {
  if (!flag.value) {
    flag.value = true;
    getSelectorQuery();
  }

  const { pageX: pageX__local3, pageY: pageY__local4 } = e.touches[0];
  pageX.value = pageX__local3;
  pageY.value = pageY__local4;
  setPosition(pageX__local3, pageY__local4, index__local2);
};
const touchmove = function (e, index__local5) {
  const { pageX: pageX__local6, pageY: pageY__local7 } = e.touches[0];
  moveX.value = pageX__local6;
  moveY.value = pageY__local7;

  setPosition(pageX__local6, pageY__local7, index__local5);
};
const setPosition = function (x, y, index__local8) {
  index.value = index__local8;
  const { top, left, width, height } = position.value[index__local8];

  // 设置最大最小值

  site.value[index__local8].left = Math.max(
    0,
    Math.min(parseInt(x - left), width),
  );
  if (index__local8 === 0) {
    site.value[index__local8].top = Math.max(
      0,
      Math.min(parseInt(y - top), height),
    );
    // 设置颜色
    hsb.value.s = parseInt((100 * site.value[index__local8].left) / width);
    hsb.value.b = parseInt(
      100 - (100 * site.value[index__local8].top) / height,
    );
    setColor();
    //this.setValue(this.rgba);
  } else {
    setControl(index__local8, site.value[index__local8].left);
  }
};
const setColor = function () {
  const rgb = HSBToRGB(hsb.value);
  rgba.value.r = rgb.r;
  rgba.value.g = rgb.g;
  rgba.value.b = rgb.b;
};
const setValue = function (rgb) {
  hex.value = '#' + rgbToHex(rgb);
};
const setControl = function (index__local9, x) {
  const { top, left, width, height } = position.value[index__local9];

  if (index__local9 === 1) {
    hsb.value.h = parseInt((360 * x) / width);
    bgcolor.value = HSBToRGB({
      h: hsb.value.h,
      s: 100,
      b: 100,
    });
    setColor();
  } else {
    rgba.value.a = (x / width).toFixed(1);
  }
  //this.setValue(this.rgba);
};
const rgbToHex = function (rgb) {
  let hex__local10 = [
    rgb.r.toString(16),
    rgb.g.toString(16),
    rgb.b.toString(16),
  ];
  hex__local10.map(function (str, i) {
    if (str.length == 1) {
      hex__local10[i] = '0' + str;
    }
  });
  return hex__local10.join('');
};
const setColorBySelect = function (getrgb) {
  const { r, g, b, a } = getrgb;
  let rgb = {};
  rgb = {
    r: r ? parseInt(r) : 0,
    g: g ? parseInt(g) : 0,
    b: b ? parseInt(b) : 0,
    a: a ? a : 0,
  };
  rgba.value = rgb;
  hsb.value = rgbToHsb(rgb);
  changeViewByHsb();
};
const changeViewByHsb = function () {
  const [a, b, c] = position.value;
  site.value[0].left = parseInt((hsb.value.s * a.width) / 100);
  site.value[0].top = parseInt(((100 - hsb.value.b) * a.height) / 100);
  setColor(hsb.value.h);
  //this.setValue(this.rgba);
  bgcolor.value = HSBToRGB({
    h: hsb.value.h,
    s: 100,
    b: 100,
  });

  site.value[1].left = (hsb.value.h / 360) * b.width;
  site.value[2].left = rgba.value.a * c.width;
};
const HSBToRGB = function (hsb__local11) {
  let rgb = {};
  let h = Math.round(hsb__local11.h);
  let s = Math.round((hsb__local11.s * 255) / 100);
  let v = Math.round((hsb__local11.b * 255) / 100);
  if (s == 0) {
    rgb.r = rgb.g = rgb.b = v;
  } else {
    let t1 = v;
    let t2 = ((255 - s) * v) / 255;
    let t3 = ((t1 - t2) * (h % 60)) / 60;
    if (h == 360) h = 0;
    if (h < 60) {
      rgb.r = t1;
      rgb.b = t2;
      rgb.g = t2 + t3;
    } else if (h < 120) {
      rgb.g = t1;
      rgb.b = t2;
      rgb.r = t1 - t3;
    } else if (h < 180) {
      rgb.g = t1;
      rgb.r = t2;
      rgb.b = t2 + t3;
    } else if (h < 240) {
      rgb.b = t1;
      rgb.r = t2;
      rgb.g = t1 - t3;
    } else if (h < 300) {
      rgb.b = t1;
      rgb.g = t2;
      rgb.r = t2 + t3;
    } else if (h < 360) {
      rgb.r = t1;
      rgb.g = t2;
      rgb.b = t1 - t3;
    } else {
      rgb.r = 0;
      rgb.g = 0;
      rgb.b = 0;
    }
  }
  return {
    r: Math.round(rgb.r),
    g: Math.round(rgb.g),
    b: Math.round(rgb.b),
  };
};
const rgbToHsb = function (rgb) {
  let hsb__local12 = {
    h: 0,
    s: 0,
    b: 0,
  };
  let min = Math.min(rgb.r, rgb.g, rgb.b);
  let max = Math.max(rgb.r, rgb.g, rgb.b);
  let delta = max - min;
  hsb__local12.b = max;
  hsb__local12.s = max != 0 ? (255 * delta) / max : 0;
  if (hsb__local12.s != 0) {
    if (rgb.r == max) hsb__local12.h = (rgb.g - rgb.b) / delta;
    else if (rgb.g == max) hsb__local12.h = 2 + (rgb.b - rgb.r) / delta;
    else hsb__local12.h = 4 + (rgb.r - rgb.g) / delta;
  } else hsb__local12.h = -1;
  hsb__local12.h *= 60;
  if (hsb__local12.h < 0) hsb__local12.h = 0;
  hsb__local12.s *= 100 / 255;
  hsb__local12.b *= 100 / 255;
  return hsb__local12;
};
const getSelectorQuery = function () {
  const views = uni.createSelectorQuery().in(proxy);
  views
    .selectAll('.boxs')
    .boundingClientRect((data) => {
      if (!data || data.length === 0) {
        setTimeout(() => getSelectorQuery(), 20);
        return;
      }

      position.value = data;
      setColorBySelect(rgba.value);
    })
    .exec();
};

onBeforeMount(() => {
  rgba.value = props.color;
  if (props.spareColor.length !== 0) {
    colorList.value = props.spareColor;
  }
});
defineExpose({ open, close });
</script>

<style lang="scss" scoped>
.jcode-color-view {
  &__wraper {
    width: 100%;
    position: relative;
    padding-top: 40px;
    background: #fff;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;

    .close {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .button-wraper {
      padding: 8px;
    }
  }

  &__panel {
    position: relative;
    height: 200px;
    background: rgb(255, 0, 0);
    overflow: hidden;
    box-sizing: border-box;
    margin: 0 8px 0 8px;
    .background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 200px;
      background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
    }
    .pointer {
      position: absolute;
      bottom: -8px;
      left: -8px;
      z-index: 2;
      width: 15px;
      height: 15px;
      border: 1px #fff solid;
      border-radius: 50%;
    }
  }

  &__control-panel {
    margin-top: 24px;
    width: 100%;
    display: flex;
    padding-left: 8px;
    box-sizing: border-box;

    .color-wraper {
      flex-shrink: 0;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #fff;
      background-image:
        linear-gradient(
          45deg,
          #eee 25%,
          transparent 25%,
          transparent 75%,
          #eee 75%,
          #eee
        ),
        linear-gradient(
          45deg,
          #eee 25%,
          transparent 25%,
          transparent 75%,
          #eee 75%,
          #eee
        );
      background-size: 18px 18px;
      background-position:
        0 0,
        9px 9px;
      border: 1px #eee solid;
      overflow: hidden;
    }
    .color-content {
      width: 100%;
      height: 100%;
    }
    .control-wraper {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      padding: 0 16px;
    }

    .controller {
      position: relative;
      width: 100%;
      height: 16px;
      background-color: #fff;
      background-image:
        linear-gradient(
          45deg,
          #eee 25%,
          transparent 25%,
          transparent 75%,
          #eee 75%,
          #eee
        ),
        linear-gradient(
          45deg,
          #eee 25%,
          transparent 25%,
          transparent 75%,
          #eee 75%,
          #eee
        );
      background-size: 16px 16px;
      background-position:
        0 0,
        8px 8px;
    }

    .hue {
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to right,
        #f00 0%,
        #ff0 17%,
        #0f0 33%,
        #0ff 50%,
        #00f 67%,
        #f0f 83%,
        #f00 100%
      );
    }
    .transparency {
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0));
    }

    .circle {
      position: absolute;
      /* right: -10px; */
      top: -2px;
      width: 20px;
      height: 20px;
      box-sizing: border-box;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.1);
    }
  }
}

.alternative {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding-right: 8px;
  box-sizing: border-box;
  margin-top: 24px;

  &__item {
    margin: 8px 0 0 8px;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background-color: #fff;
    background-image:
      linear-gradient(
        45deg,
        #eee 25%,
        transparent 25%,
        transparent 75%,
        #eee 75%,
        #eee
      ),
      linear-gradient(
        45deg,
        #eee 25%,
        transparent 25%,
        transparent 75%,
        #eee 75%,
        #eee
      );
    background-size: 16px 16px;
    background-position:
      0 0,
      9px 9px;
    border: 1px #eee solid;
    overflow: hidden;

    &-content {
      width: 32px;
      height: 32px;
      background: rgba(255, 0, 0, 0.5);
    }

    &:active {
      transition: all 0.3s;
      transform: scale(1.1);
    }
  }
}

.result-wraper {
  margin-top: 16px;
  padding: 10px;
  width: 100%;
  display: flex;
  box-sizing: border-box;

  &__input {
    padding: 8px 0;
    width: 100%;
    font-size: 14px;
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.1);
    color: #999;
    text-align: center;
    background: #fff;
  }
}
</style>
