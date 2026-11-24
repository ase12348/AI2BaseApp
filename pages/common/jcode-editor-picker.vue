<template>
  <view class="jcode-editor-picker">
    <view class="jcode-editor-picker-body">
      <view class="toolbar" @tap="format" style="height: 156px">
        <view
          :class="formats.bold ? 'ql-active' : ''"
          class="iconfont icon-zitijiacu"
          data-name="bold"
        >
        </view>
        <view
          :class="formats.italic ? 'ql-active' : ''"
          class="iconfont icon-zitixieti"
          data-name="italic"
        >
        </view>
        <view
          :class="formats.underline ? 'ql-active' : ''"
          class="iconfont icon-zitixiahuaxian"
          data-name="underline"
        ></view>
        <view
          :class="formats.strike ? 'ql-active' : ''"
          class="iconfont icon-zitishanchuxian"
          data-name="strike"
        ></view>
        <!-- #ifndef MP-BAIDU -->
        <view
          :class="formats.align === 'left' ? 'ql-active' : ''"
          class="iconfont icon-zuoduiqi"
          data-name="align"
          data-value="left"
        ></view>
        <!-- #endif -->
        <view
          :class="formats.align === 'center' ? 'ql-active' : ''"
          class="iconfont icon-juzhongduiqi"
          data-name="align"
          data-value="center"
        ></view>
        <view
          :class="formats.align === 'right' ? 'ql-active' : ''"
          class="iconfont icon-youduiqi"
          data-name="align"
          data-value="right"
        ></view>
        <view
          :class="formats.align === 'justify' ? 'ql-active' : ''"
          class="iconfont icon-zuoyouduiqi"
          data-name="align"
          data-value="justify"
        ></view>
        <!-- #ifndef MP-BAIDU -->
        <view
          :class="formats.lineHeight ? 'ql-active' : ''"
          class="iconfont icon-line-height"
          data-name="lineHeight"
          data-value="2"
        ></view>
        <view
          :class="formats.letterSpacing ? 'ql-active' : ''"
          class="iconfont icon-Character-Spacing"
          data-name="letterSpacing"
          data-value="2em"
        ></view>
        <view
          :class="formats.marginTop ? 'ql-active' : ''"
          class="iconfont icon-722bianjiqi_duanqianju"
          data-name="marginTop"
          data-value="20px"
        ></view>
        <view
          :class="formats.marginBottom ? 'ql-active' : ''"
          class="iconfont icon-723bianjiqi_duanhouju"
          data-name="marginBottom"
          data-value="20px"
        ></view>
        <!-- #endif -->

        <view class="iconfont icon-clearedformat" @tap="removeFormat"></view>

        <!-- #ifndef MP-BAIDU -->
        <view
          :class="formats.fontFamily ? 'ql-active' : ''"
          class="iconfont icon-font"
          data-name="fontFamily"
          data-value="Pacifico"
        ></view>
        <view
          :class="formats.fontSize === '24px' ? 'ql-active' : ''"
          class="iconfont icon-fontsize"
          data-name="fontSize"
          data-value="24px"
        ></view>
        <!-- #endif -->
        <view
          :class="formats.color === '#0000ff' ? 'ql-active' : ''"
          class="iconfont icon-text_color"
          data-name="color"
          data-value="#0000ff"
        ></view>
        <view
          :class="formats.backgroundColor === '#00ff00' ? 'ql-active' : ''"
          class="iconfont icon-fontbgcolor"
          data-name="backgroundColor"
          data-value="#00ff00"
        ></view>
        <view class="iconfont icon-date" @tap="insertDate"></view>
        <view
          class="iconfont icon--checklist"
          data-name="list"
          data-value="check"
        ></view>
        <view
          :class="formats.list === 'ordered' ? 'ql-active' : ''"
          class="iconfont icon-youxupailie"
          data-name="list"
          data-value="ordered"
        ></view>
        <view
          :class="formats.list === 'bullet' ? 'ql-active' : ''"
          class="iconfont icon-wuxupailie"
          data-name="list"
          data-value="bullet"
        ></view>

        <view class="iconfont icon-undo" @tap="undo"></view>
        <view class="iconfont icon-redo" @tap="redo"></view>

        <view
          class="iconfont icon-outdent"
          data-name="indent"
          data-value="-1"
        ></view>
        <view
          class="iconfont icon-indent"
          data-name="indent"
          data-value="+1"
        ></view>
        <view class="iconfont icon-fengexian" @tap="insertDivider"></view>
        <view class="iconfont icon-charutupian" @tap="insertImage"></view>
        <view
          :class="formats.header === 1 ? 'ql-active' : ''"
          class="iconfont icon-format-header-1"
          data-name="header"
          :data-value="1"
        ></view>
        <view
          :class="formats.script === 'sub' ? 'ql-active' : ''"
          class="iconfont icon-zitixiabiao"
          data-name="script"
          data-value="sub"
        ></view>
        <view
          :class="formats.script === 'super' ? 'ql-active' : ''"
          class="iconfont icon-zitishangbiao"
          data-name="script"
          data-value="super"
        ></view>

        <view class="iconfont icon-shanchu" @tap="clear"></view>

        <view
          :class="formats.direction === 'rtl' ? 'ql-active' : ''"
          class="iconfont icon-direction-rtl"
          data-name="direction"
          data-value="rtl"
        ></view>
      </view>

      <view class="jcode-editor-picker-wrapper">
        <editor
          id="editor"
          class="ql-container"
          :placeholder="`${$t('开始输入')}...`"
          show-img-resize
          @statuschange="onStatusChange"
          :read-only="readOnly"
          @ready="onEditorReady"
        >
        </editor>
      </view>
    </view>
    <button
      type="primary"
      size="mini"
      class="jcode-editor-picker-btn"
      @click="handleOk"
    >
      {{ $t('保存') }}
    </button>
  </view>
</template>

<script setup>
import {
  $t,
  EMIT,
  GET_GLOBAL,
  GET_PARAM,
  GUID,
  HIDE_LOADING,
  NAV_BACK,
  OFF,
} from '@/utils/index';
import { HTTP_DELETE, HTTP_UPLOAD } from '@/utils/http';
import { useGlobalConfig } from '@/hooks/setting/useGlobalConfig';
import { ref } from 'vue';
import { onLoad, onBackPress, onUnload } from '@dcloudio/uni-app';

const props = defineProps({
  disabled: Boolean,
});
defineOptions({ name: 'jcode-editor-picker' });

const { API } = useGlobalConfig();

const readOnly = ref(false);
const formats = ref({});
const value = ref('');
const oldFildIdList = ref([]);

const editorCtx = ref(null);

const readOnlyChange = function () {
  readOnly.value = !readOnly.value;
};
const onEditorReady = function () {
  // #ifdef MP-BAIDU
  editorCtx.value =
    requireDynamicLib('editorLib').createEditorContext('editor');
  // #endif

  // #ifdef APP-PLUS || MP-WEIXIN || H5
  uni
    .createSelectorQuery()
    .select('#editor')
    .context((res) => {
      editorCtx.value = res.context;
      editorCtx.value.setContents({
        html: value.value,
      });
    })
    .exec();
  // #endif
};
const undo = function () {
  editorCtx.value.undo();
};
const redo = function () {
  editorCtx.value.redo();
};
const format = function (e) {
  let { name, value: value__local2 } = e.target.dataset;
  if (!name) return;
  editorCtx.value.format(name, value__local2);
};
const onStatusChange = function (e) {
  const formats__local3 = e.detail;
  formats.value = formats__local3;
};
const insertDivider = function () {
  editorCtx.value.insertDivider({
    success: function () {
      console.log('insert divider success');
    },
  });
};
const clear = function () {
  uni.showModal({
    title: '清空编辑器',
    content: '确定清空编辑器全部内容？',
    success: (res) => {
      if (res.confirm) {
        editorCtx.value.clear({
          success: function (res) {
            console.log('clear success');
          },
        });
      }
    },
  });
};
const removeFormat = function () {
  editorCtx.value.removeFormat();
};
const insertDate = function () {
  const date = new Date();
  const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  editorCtx.value.insertText({
    text: formatDate,
  });
};
const insertImage = function () {
  uni.chooseImage({
    count: 1,
    success: async (res) => {
      await getImgSrc(res.tempFiles[0]);
    },
  });
};
const getImgSrc = async function (tempFile) {
  const fileID = GUID();
  const tempSrc = await HTTP_UPLOAD(
    `/system/annexesfile/${fileID}`,
    tempFile.path,
    {
      fileName: tempFile.name,
    },
  );
  editorCtx.value.insertImage({
    //插入图片的地址
    src: `${API.value}/system/annexesfile/${fileID}?token=${GET_GLOBAL('token')}`,
    alt: '图像',
    success: function () {
      console.log('insert image success');
    },
  });
};
const getFieldId = function (value__local4) {
  const regex = /system\/annexesfile\/([a-f0-9-]+)(?=\?token=)/g;
  let matches;
  const fildIdList = [];
  while ((matches = regex.exec(value__local4)) !== null) {
    if (matches.index === regex.lastIndex) {
      regex.lastIndex++;
    }
    fildIdList.push(matches[1]);
  }
  return fildIdList;
};
const handleOk = async function () {
  let value__local5 = '';
  let data;
  editorCtx.value.getContents({
    success: (res) => {
      value__local5 = res.html;
      data = res;
    },
  });

  const fildIdList = getFieldId(value__local5);
  for (const fileID of oldFildIdList.value) {
    if (!fildIdList.includes(fileID)) {
      // 删除图片
      await HTTP_DELETE({
        url: `/system/annexesfile/${fileID}`,
      });
    }
  }
  EMIT('edit-jcode-editor', {
    value: value__local5,
    data: data,
  });
  NAV_BACK();
};

onLoad(() => {
  const { value: value__local } = GET_PARAM();
  value.value = value__local;

  oldFildIdList.value = getFieldId(value.value);
});
onBackPress(() => {
  // #ifdef APP-VUE || APP-HARMONY
  HIDE_LOADING();
  // #endif

  OFF('edit-jcode-editor');
});
onUnload(() => {
  OFF('edit-jcode-editor');
});
</script>

<style lang="scss" scoped>
@import '/static/editor/editor-icon.css';

.jcode-editor-picker {
  position: relative;
  height: calc(100vh - var(--window-top) - var(--status-bar-height));
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.jcode-editor-picker-body {
  position: relative;
  height: 0;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.jcode-editor-picker-wrapper {
  height: 100%;
  background: #fff;
  position: relative;
  height: 0;
  width: 100%;
  flex: 1;
}

.iconfont {
  display: inline-block;
  padding: 8px 8px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 20px;
}

.toolbar {
  box-sizing: border-box;
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  position: relative;
  width: 100%;
  border-bottom: 1px solid #f0f0f0;
}

.ql-container {
  box-sizing: border-box;
  padding: 12px 15px;
  width: 100%;
  min-height: 30vh;
  height: 100%;
  font-size: 16px;
  line-height: 1.5;
}

.ql-active {
  color: #06c;
}
.jcode-editor-picker-btn {
  position: relative;
  min-height: 48px;
  width: 100%;
}
</style>
