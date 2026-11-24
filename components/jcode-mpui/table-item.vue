<template>
  <view @click.stop="() => {}">
    <view v-if="component.type == 'number'" class="jcode-flex-box">
      <uni-number-box
        :modelValue="modelValue"
        @update:modelValue="setValue(component.id, $event)"
        :min="component.min || -10000000"
        :max="component.max || 10000000"
        :step="component.step || 1"
        :disabled="isNotEdit"
        @change="handleChange"
      />
    </view>

    <jcode-radio
      v-else-if="component.type == 'radio'"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :options="getOptions(component)"
      :disabled="isNotEdit"
      @change="handleChange"
    />
    <jcode-checkbox
      v-else-if="component.type == 'checkbox'"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :options="getOptions(component)"
      :disabled="isNotEdit"
      @change="handleChange"
    />
    <jcode-picker
      v-else-if="['select'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :options="getOptions(component)"
      :placeholder="component.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-multiple-picker
      v-else-if="['selectMultiple'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :options="getOptions(component)"
      :placeholder="component.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-tree-picker
      v-else-if="['treeSelect'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :isTreeData="component.dataType == 'options'"
      :options="getOptions(component)"
      :idKey="component.idKey"
      :pIdKey="component.pidKey"
      :placeholder="component.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />
    <jcode-layer-picker
      v-else-if="['inputLayer', 'buttonLayer'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :options="getOptions(component)"
      :placeholder="component.placeholder"
      :disabled="isNotEdit"
      :columns="component.columns"
      @change="handleChange"
    />

    <jcode-time-picker
      v-else-if="['time'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :format="component.format"
      :disabled="isNotEdit"
      :clearable="component.clearable"
      :placeholder="component.placeholder"
      :selectableRange="component.selectableRange"
      @change="handleChange"
    />
    <jcode-time-picker
      v-else-if="['timeRange'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :format="component.format"
      :disabled="isNotEdit"
      :clearable="component.clearable"
      :startPlaceholder="component.startPlaceholder"
      :endPlaceholder="component.endPlaceholder"
      :isRange="true"
      @change="handleChange"
    />

    <jcode-datetime-picker
      v-else-if="['date', 'dateRange'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :type="`${config.picker}${component.type === 'dateRange' ? 'range' : ''}`"
      :format="component.format"
      :clearable="component.clearable"
      :placeholder="component.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-area-picker
      v-else-if="['areaSelect'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :clearable="component.clearable"
      :placeholder="component.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-map-picker
      v-else-if="['inputMap'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :clearable="component.clearable"
      :placeholder="component.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-upload-file
      v-else-if="['upload', 'uploadimg'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
      :accept="component.accept"
      :limit="component.limit"
      :maxSize="component.maxSize"
      :sizeType="component.sizeType"
      :isTip="component.isTip"
      :listType="component.listType"
      :disabled="isNotEdit"
    />

    <jcode-company-picker
      :getDataSource="getDataSource"
      v-else-if="['companySelect'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      :placeholder="component.placeholder"
      @change="handleChange"
    />

    <jcode-department-picker
      :getDataSource="getDataSource"
      v-else-if="['departmentSelect'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="isNotEdit"
      :placeholder="component.placeholder"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />

    <jcode-user-picker
      v-else-if="['userSelect'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      :getDataSource="getDataSource"
      :placeholder="component.placeholder"
      @change="handleChange"
    />

    <jcode-code
      v-else-if="['encode'].includes(component.type)"
      :modelValue="modelValue"
      :code="component.code"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />

    <jcode-label
      v-else-if="
        ['company', 'department', 'createUser', 'modifyUser'].includes(
          component.type,
        )
      "
      :modelValue="modelValue"
      :type="component.type"
    />

    <jcode-icon-picker
      v-else-if="['icon'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />

    <view
      v-else-if="['rate'].includes(component.type)"
      style="padding-top: 4px"
    >
      <uni-rate
        :modelValue="modelValue"
        :disabled="isNotEdit"
        @update:modelValue="setValue(component.id, $event)"
        @change="handleChange($event.value)"
      />
    </view>

    <jcode-switch
      v-else-if="['switch'].includes(component.type)"
      :modelValue="modelValue"
      :valueType="component.valueType"
      :activeValue="component.checkedValue"
      :inactiveValue="component.unCheckedValue"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />
    <jcode-slider
      v-else-if="['slider'].includes(component.type)"
      :modelValue="modelValue"
      :min="component.min"
      :max="component.max"
      :step="component.step"
      :showTooltip="component.showTooltip"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />

    <jcode-color-picker
      v-else-if="['color'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />

    <uni-easyinput
      v-else-if="['createTime', 'modifyTime', 'guid'].includes(component.type)"
      :modelValue="modelValue"
      disabled
      :clearable="false"
    />

    <uni-easyinput
      v-else-if="component.type == 'password'"
      type="password"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :placeholder="component.placeholder"
      :prefixIcon="component.prefixIcon"
      :suffixIcon="component.suffixIcon"
      :maxlength="component.maxlength ? component.maxlength : -1"
      :disabled="isNotEdit"
      @blur="handleChange($event.detail.value)"
    />

    <uni-easyinput
      v-else-if="['textarea', 'textEditor'].includes(component.type)"
      type="textarea"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      @blur="handleChange($event.detail.value)"
      :placeholder="component.placeholder || ''"
      :maxlength="component.maxlength ? component.maxlength : -1"
      :disabled="isNotEdit"
      autoHeight
    />

    <uni-easyinput
      v-else-if="!['viewTable'].includes(component.type)"
      type="text"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      @blur="handleChange($event.detail.value)"
      :placeholder="component.placeholder || ''"
      :prefixIcon="component.prefixIcon || ''"
      :suffixIcon="component.suffixIcon || ''"
      :maxlength="component.maxlength ? component.maxlength : -1"
      :disabled="isNotEdit"
    />
  </view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {},
  component: {},
  rowData: {},
  getDataSource: Function,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-table-item' });

const isNotEdit = computed(function () {
  return false;
});

const handleChange = function (obj) {
  if (props.component.type != 'number') {
    emit('change', { data: obj, component: props.component });
  }
};
const setValue = function (path, value) {
  emit('update:modelValue', { path, value });
  if (props.component.type == 'number') {
    emit('change', { data: value, component: props.component });
  }
};
const getOptions = function (component) {
  const options = props.getDataSource(component, props.rowData);
  //console.log(options,component,'component');
  return options;
};
</script>
