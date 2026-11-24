<template>
  <view>
    <view
      class="jcode-box jcode-input jcode-input-border"
      :class="{ 'jcode-input-placeholder': VALIDATENULL(modelValue) }"
      @tap.stop="handleOpen"
    >
      <view class="jcode-input__content"
        ><text>{{ $t(text) }}</text></view
      >

      <view
        v-if="VALIDATENULL(modelValue)"
        class="jcode-input-icon-right jcode-input-icon-right-bottom"
      >
        <uni-icons type="bottom" size="14" color="#c0c4cc"></uni-icons>
      </view>
      <view v-else-if="!disabled && clearable" class="jcode-input-icon-right">
        <view @tap.stop="handleClear">
          <uni-icons type="clear" size="14" color="#c0c4cc"></uni-icons>
        </view>
      </view>
    </view>

    <uni-popup ref="popup" type="bottom">
      <view class="jcode-picker-popup">
        <view class="jcode-popup-button-close" @click.stop="handleCancel">
          <jcode-icon
            type="jcode-icon-error"
            :size="14"
            color="#737987"
          ></jcode-icon>
        </view>

        <view class="jcode-box jcode-picker-popup__box">
          <scroll-view scroll-with-animation scroll-y style="height: 100%">
            <view class="jcode-select-list">
              <checkbox-group @change="checkboxChange">
                <label
                  class="jcode-select-list-item"
                  v-for="(item, index) in myOptions"
                  :key="index"
                >
                  <view>
                    <checkbox
                      style="transform: scale(0.8)"
                      :value="item.value"
                      :checked="midValue.indexOf(item.value) != -1"
                    />
                  </view>
                  <view>{{ item.text }}</view>
                  <view class="jcode-popup-line"></view>
                </label>
              </checkbox-group>
            </view>
          </scroll-view>
        </view>

        <view class="jcode-popup-button-wraper">
          <view class="jcode-popup-button-ok" @click="handleSave">{{ $t('确认') }}</view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { $t, VALIDATENULL } from '@/utils/index';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    default: null,
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  labelKey: {
    type: String,
    default: 'label',
  },
  valueKey: {
    type: String,
    default: 'value',
  },
  options: {
    type: Array,
    default: () => [],
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: Boolean,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-multiple-picker' });

const midValue = ref([]);

const myValue = computed({
  get() {
    if (VALIDATENULL(props.modelValue)) {
      return [];
    }
    return props.modelValue.split(',');
  },
  set(val) {
    if (val.length == 0) {
      emit('update:modelValue', '');
      emit('change', undefined);
    } else {
      emit('update:modelValue', String(val));
      emit(
        'change',
        props.options.filter((t) => val.indexOf(t[props.valueKey]) != -1),
      );
    }
  },
});
const myOptions = computed(function () {
  return props.options.map((t) => ({
    value: t[props.valueKey],
    text: t[props.labelKey],
  }));
});
const text = computed(function () {
  if (myValue.value.length == 0) {
    return props.placeholder || '';
  } else {
    const list = myOptions.value
      .filter((t) => myValue.value.indexOf(t.value) != -1)
      .map((t) => t.text);
    return String(list);
  }
});

const popup = ref(null);

const handleOpen = function () {
  if (props.disabled) {
    return;
  }

  midValue.value = myValue.value;
  popup.value.open();
};
const handleCancel = function () {
  popup.value.close();
};
const handleSave = function () {
  myValue.value = midValue.value;
  popup.value.close();
};
const handleClear = function () {
  myValue.value = [];
};
const checkboxChange = function (e) {
  const value = e.detail.value;
  midValue.value = value;
};
</script>
<style lang="scss" scoped>
.jcode-select-list {
  .jcode-select-list-item {
    position: relative;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: 32px;
    padding: 8px 0 0 8px;
  }
}
</style>
