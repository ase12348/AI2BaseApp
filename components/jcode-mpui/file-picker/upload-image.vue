<template>
  <view class="uni-file-picker__container">
    <view
      class="file-picker__box"
      v-for="(item, index) in filesList"
      :key="index"
      :style="boxStyle"
    >
      <view class="file-picker__box-content" :style="borderStyle">
        <image
          class="file-image"
          :src="item.url"
          mode="aspectFill"
          @click.stop="prviewImage(item, index)"
        ></image>
        <view
          v-if="delIcon && !readonly"
          class="icon-del-box"
          @click.stop="delFile(item.fileID)"
        >
          <view class="icon-del"></view>
          <view class="icon-del rotate"></view>
        </view>
        <view
          v-if="(item.progress && item.progress !== 100) || item.progress === 0"
          class="file-picker__progress"
        >
          <progress
            class="file-picker__progress-item"
            :percent="item.progress === -1 ? 0 : item.progress"
            stroke-width="4"
            :backgroundColor="item.errMsg ? '#ff5a5f' : '#EBEBEB'"
          />
        </view>
        <view
          v-if="item.errMsg"
          class="file-picker__mask"
          @click.stop="uploadFiles(item, index)"
        >
          {{ $t('点击重试') }}
        </view>
      </view>
    </view>
    <view
      v-if="filesList.length < limit && !readonly"
      class="file-picker__box"
      :style="boxStyle"
    >
      <view
        class="file-picker__box-content is-add"
        :style="borderStyle"
        @click="choose"
      >
        <slot>
          <view class="icon-add"></view>
          <view class="icon-add rotate"></view>
        </slot>
      </view>
    </view>
  </view>
</template>

<script setup>
import { $t } from '@/utils/index';
import { computed } from 'vue';

const props = defineProps({
  filesList: {
    type: Array,
    default() {
      return [];
    },
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  disablePreview: {
    type: Boolean,
    default: false,
  },
  limit: {
    type: [Number, String],
    default: 9,
  },
  imageStyles: {
    type: Object,
    default() {
      return {
        width: 'auto',
        height: 'auto',
        border: {},
      };
    },
  },
  delIcon: {
    type: Boolean,
    default: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['uploadFiles', 'choose', 'delFile']);
defineOptions({ name: 'uploadImage' });

const styles = computed(function () {
  let styles__local = {
    width: 'auto',
    height: 'auto',
    border: {},
  };
  return Object.assign(styles__local, props.imageStyles);
});
const boxStyle = computed(function () {
  const { width = 'auto', height = 'auto' } = styles.value;
  let obj = {};
  if (height === 'auto') {
    if (width !== 'auto') {
      obj.height = value2px(width);
      obj['padding-top'] = 0;
    } else {
      obj.height = 0;
    }
  } else {
    obj.height = value2px(height);
    obj['padding-top'] = 0;
  }

  if (width === 'auto') {
    if (height !== 'auto') {
      obj.width = value2px(height);
    } else {
      obj.width = '33.3%';
    }
  } else {
    obj.width = value2px(width);
  }

  let classles = '';
  for (let i in obj) {
    classles += `${i}:${obj[i]};`;
  }
  return classles;
});
const borderStyle = computed(function () {
  let { border } = styles.value;
  let obj = {};
  const widthDefaultValue = 1;
  const radiusDefaultValue = 3;
  if (typeof border === 'boolean') {
    obj.border = border ? '1px #eee solid' : 'none';
  } else {
    let width = (border && border.width) || widthDefaultValue;
    width = value2px(width);
    let radius = (border && border.radius) || radiusDefaultValue;
    radius = value2px(radius);
    obj = {
      'border-width': width,
      'border-style': (border && border.style) || 'solid',
      'border-color': (border && border.color) || '#eee',
      'border-radius': radius,
    };
  }
  let classles = '';
  for (let i in obj) {
    classles += `${i}:${obj[i]};`;
  }
  return classles;
});

const uploadFiles = function (item, index) {
  emit('uploadFiles', item);
};
const choose = function () {
  emit('choose');
};
const delFile = function (id) {
  emit('delFile', id);
};
const prviewImage = function (img, index) {
  let urls = [];
  if (Number(props.limit) === 1 && props.disablePreview && !props.disabled) {
    emit('choose');
  }
  if (props.disablePreview) return;
  props.filesList.forEach((i) => {
    urls.push(i.url);
  });

  uni.previewImage({
    urls: urls,
    current: index,
  });
};
const value2px = function (value) {
  if (typeof value === 'number') {
    value += 'px';
  } else {
    if (value.indexOf('%') === -1) {
      value = value.indexOf('px') !== -1 ? value : value + 'px';
    }
  }
  return value;
};
</script>

<style lang="scss">
.uni-file-picker__container {
  /* #ifndef APP-NVUE */
  display: flex;
  box-sizing: border-box;
  /* #endif */
  flex-wrap: wrap;
  margin: -5px;
}

.file-picker__box {
  position: relative;
  // flex: 0 0 33.3%;
  width: 33.3%;
  height: 0;
  padding-top: 33.33%;
  /* #ifndef APP-NVUE */
  box-sizing: border-box;
  /* #endif */
}

.file-picker__box-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 5px;
  border: 1px #eee solid;
  border-radius: 5px;
  overflow: hidden;
}

.file-picker__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* border: 1px red solid; */
  z-index: 2;
}

.file-picker__progress-item {
  width: 100%;
}

.file-picker__mask {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  left: 0;
  color: #fff;
  font-size: 12px;
  background-color: rgba(0, 0, 0, 0.4);
}

.file-image {
  width: 100%;
  height: 100%;
}

.is-add {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  align-items: center;
  justify-content: center;
}

.icon-add {
  width: 50px;
  height: 5px;
  background-color: #f1f1f1;
  border-radius: 2px;
}

.rotate {
  position: absolute;
  transform: rotate(90deg);
}

.icon-del-box {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 3px;
  right: 3px;
  height: 26px;
  width: 26px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
  transform: rotate(-45deg);
}

.icon-del {
  width: 15px;
  height: 2px;
  background-color: #fff;
  border-radius: 2px;
}
</style>
