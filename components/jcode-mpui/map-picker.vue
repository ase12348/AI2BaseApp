<template>
  <view>
    <view
      @click.stop="handleClick"
      class="jcode-input jcode-input-border"
      :class="{ 'jcode-input-placeholder': VALIDATENULL(modelValue) }"
    >
      <view class="jcode-input__content"
        ><text>{{ midValue.address }}</text></view
      >

      <view
        v-if="VALIDATENULL(modelValue)"
        class="jcode-input-icon-right jcode-input-icon-right-bottom"
      >
        <uni-icons type="bottom" size="14" color="#c0c4cc"></uni-icons>
      </view>
      <view v-else-if="!disabled" class="jcode-input-icon-right">
        <view @tap.stop="handleClear">
          <uni-icons type="clear" size="14" color="#c0c4cc"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { $t, VALIDATENULL } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  modelValue: [String],
  placeholder: {
    type: String,
    default: '请选择',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-map-picker' });

const midValue = computed(function () {
  if (VALIDATENULL(props.modelValue)) {
    return {
      address: $t(props.placeholder),
      lng: 0,
      lat: 0,
    };
  }
  let lng = parseFloat(props.modelValue.split(',')[1]);
  let lat = parseFloat(props.modelValue.split(',')[2]);
  // #ifdef MP-WEIXIN || H5
  const qqData = toQQ(lng, lat);
  lng = qqData.lng;
  lat = qqData.lat;
  // #endif

  return {
    address: props.modelValue.split(',')[0],
    lng: lng,
    lat: lat,
  };
});
const displayPlaceholder = computed(function () {
  if (props.disabled) {
    return '';
  }

  if (props.placeholder) {
    return $t(props.placeholder);
  }
});

const handleClick = function () {
  if (props.disabled) {
    return;
  }
  uni.chooseLocation({
    latitude: midValue.value.lat == 0 ? undefined : midValue.value.lat,
    longitude: midValue.value.lng == 0 ? undefined : midValue.value.lng,
    success: (res) => {
      let lng = res.longitude;
      let lat = res.latitude;

      // #ifdef MP-WEIXIN || H5
      const baiduData = toBaiDu(lng, lat);
      lng = baiduData.lng;
      lat = baiduData.lat;
      // #endif

      const value = `${res.address}${res.name},${lng},${lat}`;
      emit('update:modelValue', value);
      emit('change', {
        address: `${res.address}${res.name}`,
        lng: lng,
        lat: lat,
      });
    },
  });
};
const handleClear = function () {
  emit('update:modelValue', undefined);
  emit('change', undefined);
};
const toBaiDu = function (lng, lat) {
  if (lng == null || lng == '' || lat == null || lat == '')
    return { lng: lng, lat: lat };
  let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
  let x = lng;
  let y = lat;
  let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  let lngs = z * Math.cos(theta) + 0.0065;
  let lats = z * Math.sin(theta) + 0.006;
  return { lng: lngs, lat: lats };
};
const toQQ = function (lng, lat) {
  if (lng == null || lng == '' || lat == null || lat == '')
    return { lng: lng, lat: lat };
  let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
  let x = lng - 0.0065;
  let y = lat - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  let lngs = z * Math.cos(theta);
  let lats = z * Math.sin(theta);
  return { lng: lngs, lat: lats };
};
</script>
