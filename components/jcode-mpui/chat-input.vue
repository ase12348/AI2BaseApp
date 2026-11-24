<template>
  <view :style="[{ bottom: inputBottom + 'px' }]" class="jcode-chat-input-bar">
    <input
      @focus="inputFocus"
      @blur="inputBlur"
      @input="input"
      @confirm="sendClick"
      :value="modelValue"
      :adjust-position="false"
      :enableNative="false"
      :focus="false"
      :placeholder="$t(placeholder)"
      :disabled="inputDisabled"
      :confirm-hold="confirmHold"
      cursor-spacing="10"
      class="jcode-chat-input"
      confirm-type="send"
      type="text"
    />
    <button
      class="jcode-chat-input-btn"
      type="primary"
      @click="sendClick"
      :disabled="buttonDisabled"
    >
      {{ $t('发送') }}
    </button>
  </view>
</template>

<script setup>
import { $t } from '@/utils/index';
import { ref } from 'vue';

const props = defineProps({
  modelValue: {},
  placeholder: {},
  inputDisabled: {},
  buttonDisabled: {},
  confirmHold: {},
});
const emit = defineEmits([
  'blur',
  'change',
  'focus',
  'sendMsg',
  'update:modelValue',
]);
defineOptions({ name: 'jcode-chat-input' });

const inputBottom = ref(0);

const input = function (e) {
  emit('update:modelValue', e.detail.value);
  emit('change', e.detail.value);
};
const inputFocus = function (e) {
  inputBottom.value = e.detail.height;
  emit('focus');
};
const inputBlur = function (e) {
  inputBottom.value = 0;
  emit('blur');
};
const sendClick = function (e) {
  emit('sendMsg', props.modelValue);
};
</script>
<style lang="scss">
.jcode-chat-input-bar {
  display: flex;
  align-items: center;
  min-height: 48px;
  justify-content: space-between;

  position: fixed;
  width: 100%;
  bottom: constant(safe-area-inset-bottom);
  bottom: env(safe-area-inset-bottom);
  z-index: 1024;

  background-color: #fff;

  box-sizing: border-box;

  padding: 0 16px;
}

.jcode-chat-input {
  flex-grow: 1;
  border-bottom: 1px solid $uni-border-1;
}

.jcode-chat-input-btn {
  width: 64px;
  margin-left: 16px;
}
</style>
