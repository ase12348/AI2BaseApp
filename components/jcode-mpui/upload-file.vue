<template>
  <view class="jcode-file-picker">
    <upload-image
      v-if="showType === 'grid'"
      :readonly="disabled"
      :image-styles="imageStyles"
      :files-list="fileList"
      :limit="limitLength"
      :disablePreview="disablePreview"
      :delIcon="delIcon"
      @choose="choose"
      @delFile="delFile"
    >
      <slot>
        <view class="is-add">
          <view class="icon-add"></view>
          <view class="icon-add rotate"></view>
        </view>
      </slot>
    </upload-image>
    <upload-file
      v-if="showType !== 'grid'"
      :readonly="disabled"
      :list-styles="listStyles"
      :files-list="fileList"
      :showType="showType"
      :delIcon="delIcon"
      @choose="choose"
      @delFile="delFile"
    >
      <slot>
        <button type="primary" size="mini">{{ $t('选择文件') }}</button>
      </slot>
    </upload-file>
  </view>
</template>

<script setup>
import uploadImage from './file-picker/upload-image.vue';
import uploadFile from './file-picker/upload-file.vue';
import { chooseAndUploadFile } from './file-picker/choose-and-upload-file.js';
import {
  get_extname,
  get_files_and_is_max,
  get_file_data,
} from './file-picker/utils.js';
import { $t, GUID } from '@/utils/index';
import { computed, watch, ref } from 'vue';

const props = defineProps({
  modelValue: {},

  listType: String,
  disabled: Boolean,
  accept: {
    type: String,
    default: '',
  },

  disablePreview: {
    type: Boolean,
    default: false,
  },
  delIcon: {
    type: Boolean,
    default: true,
  },
  // 最大选择个数 ，h5只能限制单选或是多选
  limit: {
    type: [Number, String],
    default: 9, // 文件限制数量
  },
  sizeType: String, // 文件大小单位
  maxSize: [String, Number], // 单个文件最大大小
  isTip: Boolean, // 是否显示提示语

  listStyles: {
    type: Object,
    default() {
      return {
        // 是否显示边框
        border: true,
        // 是否显示分隔线
        dividline: true,
        // 线条样式
        borderStyle: {},
      };
    },
  },
  imageStyles: {
    type: Object,
    default() {
      return {
        width: 'auto',
        height: 'auto',
      };
    },
  },

  isOne: Boolean,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-upload-file' });

const files = ref([]);
const localValue = ref([]);

const fileList = computed(function () {
  return localValue.value.filter((t) => t.uploadType != 'remove');
});
const fileMediatype = computed(function () {
  if (props.listType == 'picture-card') {
    return 'image';
  } else {
    return 'all';
  }
});
const showType = computed(function () {
  if (fileMediatype.value === 'image') {
    return 'grid';
  }
  return 'list';
});
const limitLength = computed(function () {
  if (!props.limit) {
    return 1;
  }
  if (props.limit >= 9) {
    return 9;
  }
  return props.limit;
});

const choose = function () {
  if (props.disabled) return;
  if (files.value.length >= Number(limitLength.value)) {
    uni.showToast({
      title: `${$t('您最多选择')} ${limitLength.value} ${$t('个文件')}`,
      icon: 'none',
    });
    return;
  }
  chooseFiles();
};
const delFile = function (id) {
  const fileItem = localValue.value.find((t) => t.fileID == id);
  if (fileItem) {
    if (fileItem.uploadType == 'old') {
      fileItem.uploadType = 'remove';
    } else {
      const index = localValue.value.findIndex((t) => t.fileID == id);
      if (index != -1) {
        localValue.value.splice(index, 1);
      }

      const index2 = files.value.findIndex((t) => t.uuid == fileItem.uuid);
      if (index2 != -1) {
        files.value.splice(index2, 1);
      }
    }
  }

  //console.log(this.localValue)
  emit('change', localValue.value);
  emit('update:modelValue', localValue.value);
};
const setEmit = function () {
  const data = backObject(files.value);
  if (!localValue.value) {
    localValue.value = [];
  }
  localValue.value = localValue.value.filter((t) => t.uploadType != 'add');
  localValue.value.push(...data);

  //console.log(this.localValue,this.files,'setEmit')

  emit('change', localValue.value);
  emit('update:modelValue', localValue.value);
};
const backObject = function (files__local) {
  let newFilesData = [];
  files__local.forEach((v) => {
    newFilesData.push({
      extname: v.extname,
      fileType: v.fileType,
      image: v.image,
      name: v.name,
      path: v.path,
      size: v.size,
      fileID: GUID(),
      uuid: v.uuid,
      url: v.url,
      uploadType: 'add',
    });
  });

  return newFilesData;
};
const chooseFiles = function () {
  const _extname = get_extname(props.accept); //
  // 获取后缀
  chooseAndUploadFile({
    type: fileMediatype.value,
    compressed: false,
    sizeType: ['original', 'compressed'],
    // TODO 如果为空，video 有问题
    extension: _extname.length > 0 ? _extname : undefined,
    count: limitLength.value - files.value.length, //默认9
    onChooseFile: chooseFileCallback,
    onUploadProgress: (progressEvent) => {
      //console.log(progressEvent,'progressEvent')
      //this.setProgress(progressEvent, progressEvent.index)
    },
  })
    .then((result) => {
      setEmit();
      //this.setSuccessAndError(result.tempFiles)
    })
    .catch((err) => {
      console.log('选择失败', err);
    });
};
const chooseFileCallback = async function (res) {
  const _extname = get_extname(props.accept);
  // 如果这有一个文件 ，需要清空本地缓存数据
  if (props.isOne) {
    files.value = [];
  }

  let { filePaths, files: files__local2 } = get_files_and_is_max(res, _extname);

  if (!(_extname && _extname.length > 0)) {
    filePaths = res.tempFilePaths;
    files__local2 = res.tempFiles;
  }

  let currentData = [];
  let errorNum = 0;
  for (let i = 0; i < files__local2.length; i++) {
    if (limitLength.value - files.value.length <= 0) break;

    files__local2[i].uuid = Date.now();
    let filedata = await get_file_data(files__local2[i], fileMediatype.value);
    filedata.progress = 100;
    filedata.status = 'ready';

    if (compareSize(filedata.size)) {
      files.value.push(filedata);
      currentData.push({
        ...filedata,
        file: files__local2[i],
      });
    } else {
      errorNum++;
    }
  }
  res.tempFiles = files__local2;

  if (errorNum > 0) {
    uni.showToast({
      title: `${errorNum} ${$t('个文件大小超出')}${props.maxSize}${props.sizeType}`,
      icon: 'none',
      duration: 5000,
    });
  }
};
const compareSize = function (fileSize) {
  if (props.maxSize && props.sizeType) {
    let size = fileSize;
    switch (props.sizeType) {
      case 'GB':
        size = 1024 * 1024 * 1024 * Number(props.maxSize);
        break;
      case 'MB':
        size = 1024 * 1024 * Number(props.maxSize);
        break;
      case 'KB':
        size = 1024 * Number(props.maxSize);
        break;
    }
    if (size < fileSize) {
      return false;
    }
  }
  return true;
};

watch(
  () => props.modelValue,
  function (val) {
    // 正常流程 formData 该字段已是文件数组（getFormData 经 DOWNLOAD_FILE 转换）；
    // 异常值（字符串/undefined/对象）统一按空数组处理，避免后续 filter/push 崩溃
    localValue.value = Array.isArray(val) ? val : [];
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.jcode-file-picker {
  box-sizing: border-box;
  overflow: hidden;

  uni-button[size='mini'],
  button[size='mini'] {
    height: 36px !important;
    width: 120px;
    margin-left: 0;
  }
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
</style>
