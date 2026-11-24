<template>
  <view
    v-if="ready"
    class="page"
    :style="{ 'min-height': SCREENHEIGHT() + 'px' }"
  >
    <map
      id="map"
      :style="{ height: SCREENHEIGHT() - 48 + 'px', width: '100%' }"
      :latitude="latitude"
      :longitude="longitude"
      :circles="circles"
      show-location
    ></map>
    <view
      @click="handleClick(distance < 300)"
      :class="['jcode-bottom-btns', 'clockBtn', { active: distance < 300 }]"
    >
      <jcode-time-now /><text style="margin-left: 8px">{{ $t('正常打卡') }}</text>
    </view>
  </view>
</template>

<script setup>
import {
  $t,
  EMIT,
  GET_LOCATION,
  GET_PARAM,
  HIDE_LOADING,
  LOADING,
  NAV_BACK,
  OFF,
  SCREENHEIGHT,
} from '@/utils/index';
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import { HTTP_POST, HTTP_PUT } from '@/utils/http';
import { ref } from 'vue';
import { onBackPress, onUnload, onLoad } from '@dcloudio/uni-app';

const isLayer = ref(true);
const ready = ref(false);
const latitude = ref(0);
const longitude = ref(0);
const circles = ref([]);
const myLat = ref(0);
const myLng = ref(0);
const lat = ref(0);
const lng = ref(0);
const distance = ref(0);
const clockData = ref({});

const setLocation = async function () {
  const res = await GET_LOCATION();
  if (res) {
    myLat.value = res.lat;
    myLng.value = res.lng;

    distance.value = getDistance(
      lat.value,
      lng.value,
      myLat.value,
      myLng.value,
    );
  }

  setTimeout(() => {
    setLocation();
  }, 10000);
};
const handleClick = function (flag) {
  if (flag) {
    clockIn();
  }
};
const clockIn = async function () {
  LOADING('打卡中...');
  let res;
  if (!clockData.value.f_Id) {
    res = await HTTP_POST({
      url: '/demoApp/apppunch',
      data: clockData.value,
    });
  } else {
    res = await HTTP_PUT({
      url: `/demoApp/apppunch/${clockData.value.f_Id}`,
      data: clockData.value,
    });
  }

  HIDE_LOADING();
  if (res) {
    uni.showToast({
      title: $t('打卡成功'),
    });
  }

  EMIT('jcode-clockIn-refresh');
  NAV_BACK();
};
const toQQ = function (lng__local7, lat__local8) {
  if (
    lng__local7 == null ||
    lng__local7 == '' ||
    lat__local8 == null ||
    lat__local8 == ''
  )
    return { lng: lng__local7, lat: lat__local8 };
  let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
  let x = lng__local7 - 0.0065;
  let y = lat__local8 - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  let lngs = z * Math.cos(theta);
  let lats = z * Math.sin(theta);
  return { lng: lngs, lat: lats };
};
const getDistance = function (lat1, lng1, lat2, lng2) {
  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;

  let rad1 = (lat1 * Math.PI) / 180.0;
  let rad2 = (lat2 * Math.PI) / 180.0;
  let a = rad1 - rad2;
  let b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
  let r = 6378137;
  let distance__local9 =
    r *
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2),
      ),
    );

  return distance__local9;
};

onBackPress(() => {
  // #ifdef APP-VUE || APP-HARMONY
  HIDE_LOADING();
  // #endif

  OFF('jcode-clockIn-refresh');
});
onUnload(() => {
  OFF('jcode-clockIn-refresh');
});
onLoad(async () => {
  const isload = await PAGE_LAUNCH();
  if (!isload) return;
  ready.value = false;
  const {
    lng: lng__local,
    lat: lat__local2,
    myLat: myLat__local3,
    myLng: myLng__local4,
    distance: distance__local5,
    clockData: clockData__local6,
  } = GET_PARAM();

  distance.value = distance__local5;
  clockData.value = clockData__local6;

  const qqLngAndLat = toQQ(lng__local, lat__local2);
  const qqMyLngAndLat = toQQ(myLng__local4, myLat__local3);
  circles.value.push({
    longitude: qqLngAndLat.lng,
    latitude: qqLngAndLat.lat,
    color: '#fff',
    // 填充颜色
    fillColor: '#00CACF26',
    // 圆半径
    radius: 300,
    // 边
    strokeWidth: 1,
  });
  latitude.value = qqLngAndLat.lat;
  longitude.value = qqLngAndLat.lng;

  lat.value = lat__local2;
  lng.value = lng__local;
  myLat.value = myLat__local3;
  myLng.value = myLng__local4;

  setLocation();

  ready.value = true;
});
</script>
<style lang="scss" scoped>
.clockBtn {
  text-align: center;
  line-height: 48px;
  height: 48px;
  background-color: #e5e5e5;
  color: #fff;
  display: block;
  font-size: 20px;

  &.active {
    background-color: #00cacf;
  }
}
</style>
