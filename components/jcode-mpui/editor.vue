<template>
  <view class="jcode-editor">
    <editor
      id="editor"
      class="ql-container"
      :placeholder="`${$t('开始输入')}...`"
      show-img-resize
      @statuschange="onStatusChange"
      :read-only="true"
      @ready="onEditorReady"
    >
    </editor>
    <button
      v-if="!disabled"
      type="primary"
      size="mini"
      style="width: 70px; margin-right: 0px; margin-top: 8px"
      @click="handleClick"
    >
      {{ $t('编辑') }}
    </button>
  </view>
</template>

<script setup>
import { $t, GET_GLOBAL, NAV_TO_LAYER, ONCE } from '@/utils/index';
import { useGlobalConfig } from '@/hooks/setting/useGlobalConfig';
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const props = defineProps({
  text: { default: '' },
  disabled: Boolean,
  modelValue: String,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-editor' });

const { API } = useGlobalConfig();

const readOnly = ref(false);
const formats = ref({});

const myValue = computed(function () {
  // 图片格式转化
  let value = props.modelValue || '';
  value = value
    .replace(/{jcode_img_api}/g, `${API.value}/system/annexesfile/`)
    .replace(/{jcode_img_token}/g, `token=${GET_GLOBAL('token')}`);
  return value;
});

const editorCtx = ref(null);

const onEditorReady = function () {
  // #ifdef MP-BAIDU
  editorCtx.value =
    requireDynamicLib('editorLib').createEditorContext('editor');
  editorCtx.value.setContents({
    html: myValue.value,
  });
  // #endif

  // #ifdef APP-PLUS || MP-WEIXIN || H5
  uni
    .createSelectorQuery()
    .select('#editor')
    .context((res) => {
      editorCtx.value = res.context;
      editorCtx.value.setContents({
        html: myValue.value,
      });
    })
    .exec();
  // #endif
};
const onStatusChange = function (e) {
  const formats__local = e.detail;
  formats.value = formats__local;
};
const handleClick = function () {
  // 编辑
  ONCE('edit-jcode-editor', (data) => {
    editorCtx.value.setContents({
      html: data.value,
    });
    // 转化
    const len = data.data?.delta?.ops?.length || 0;
    for (let i = 0; i < len; i++) {
      const deltaItem = data.data.delta.ops[i];
      if (
        deltaItem.insert &&
        deltaItem.insert.image &&
        deltaItem.insert.image.indexOf(API.value) > -1
      ) {
        const imageUrl = `${deltaItem.insert.image
          .replace(API.value + '/system/annexesfile/', '{jcode_img_api}')
          .replace(`token=${GET_GLOBAL('token')}`, '{jcode_img_token}')}`;
        data.value = data.value.replace(deltaItem.insert.image, imageUrl);
      }
    }
    emit('update:modelValue', data.value);
    emit('change', data);
  });
  NAV_TO_LAYER('/pages/common/jcode-editor-picker', {
    value: myValue.value,
  });
};

onLoad(() => {});
</script>

<style lang="scss" scoped>
@import '/static/editor/editor-icon.css';

.ql-container {
  box-sizing: border-box;
  padding: 12px 15px;
  width: 100%;
  min-height: 20px;
  height: auto;
  font-size: 16px;
  line-height: 1.5;
  border: 1px solid #f0f0f0;
}
.ql-container .ql-image-overlay .ql-image-toolbar {
  display: none;
}

.ql-active {
  color: #06c;
}
</style>
