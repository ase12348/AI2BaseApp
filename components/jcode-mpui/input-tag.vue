<template>
  <view class="input-tag">
    <jcode-auto-complete
      :value="inputValue"
      :options="myOptions"
      :labelKey="labelKey"
      :valueKey="valueKey"
      :placeholder="placeholder"
      :disabled="disabled"
      :isTag="true"
      @select="handleSelect"
    >
      <template v-slot:left>
        <view style="padding-bottom: 2px" v-if="tags.length > 0">
          <view
            v-for="(tag, index) in tags"
            :key="index"
            style="display: inline-block; margin-right: 2px"
          >
            <view class="input-tag-tag" :style="myColors[index]">
              <uni-text>{{ tag }}</uni-text>
              <uni-icons
                type="closeempty"
                :size="14"
                @click="handleClose(index)"
                style="margin-left: 2px"
                v-if="!disabled"
              />
            </view>
          </view>
        </view>
      </template>
    </jcode-auto-complete>
  </view>
</template>

<script setup>
import { VALIDATENULL } from '@/utils/index';
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
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
  disabled: Boolean,

  colors: {
    type: Array,
    default: () => [],
  },

  isStyleLoop: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['change', 'select', 'update:modelValue']);
defineOptions({ name: 'jcode-input-tag' });

const inputValue = ref('');

const myOptions = computed(function () {
  const res = props.options || [];
  return res;
});
const tags = computed(function () {
  if (VALIDATENULL(props.modelValue)) {
    return [];
  }
  return props.modelValue?.split(',') || [];
});
const myColors = computed(function () {
  if (props.isStyleLoop) {
    return (
      tags.value?.map((item, index) => {
        let styleItem = props.colors[index % props.colors.length] || {};
        styleItem = {
          ...styleItem,
          borderWidth: (styleItem.borderWidth || 0) + 'px',
        };
        return styleItem;
      }) || []
    );
  }
  return props.colors || [];
});

const handleClose = function (index) {
  tags.value.splice(index, 1);
  emit(
    'update:modelValue',
    !VALIDATENULL(tags.value) ? tags.value.join(',') : '',
  );
  emit('change', {
    value: VALIDATENULL(tags.value) ? tags.value.join(',') : '',
  });
};
const addTags = function (val) {
  if (val) {
    tags.value.push(val);
    inputValue.value = undefined;
    emit('update:modelValue', tags.value.join(','));
    emit('change', { value: tags.value.join(',') });
  } else if (inputValue.value) {
    tags.value.push(inputValue.value);
    inputValue.value = '';
    emit('update:modelValue', tags.value.join(','));
    emit('change', { value: tags.value.join(',') });
  }
};
const handleSelect = function (val) {
  addTags(val);
  setTimeout(() => {
    inputValue.value = '';
  }, 50);
  emit('select', val);
};
</script>
<style lang="scss" scoped>
.input-tag {
  &-tag {
    font-size: 12px;
    font-weight: 200;
    padding: 0px 2px;
    color: #fff;
    border-radius: 3px;
    background-color: #8f939c;
    border-width: 1px;
    border-style: solid;
    border-color: #8f939c;
    cursor: pointer;
    display: flex;
  }
}
</style>
