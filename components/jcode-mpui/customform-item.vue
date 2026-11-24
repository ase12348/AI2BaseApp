<template>
  <jcode-layer-picker
    v-if="['buttonLayer'].includes(component.type) && config.display !== false"
    :options="getOptions(component)"
    :disabled="isNotEdit"
    :columns="config.columns"
    :onlyButton="true"
    :content="config.content"
    :type="config.type"
    :size="config.size"
    :danger="config.danger"
    :iconName="config.iconName"
    @change="handleChange"
  />
  <uni-forms-item
    v-else-if="config.display !== false"
    :label="$t(config.notLabel ? '' : config.label)"
    :name="component.id"
    :required="config.required"
    :key="component.key"
  >
    <view v-if="component.type == 'number'" class="jcode-flex-box">
      <uni-number-box
        :modelValue="modelValue"
        @update:modelValue="setValue(component.id, $event)"
        :min="VALIDATENULL(config.min) ? -10000000 : config.min"
        :max="VALIDATENULL(config.max) ? 10000000 : config.max"
        :step="config.step || 1"
        :width="config.width"
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
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-multiple-picker
      v-else-if="['selectMultiple'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :options="getOptions(component)"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-tree-picker
      v-else-if="['treeSelect'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :isTreeData="config.dataType == 'options'"
      :options="getOptions(component)"
      :idKey="config.dataType === 'dataSource' ? config.idKey : ''"
      :pIdKey="config.dataType === 'dataSource' ? config.pidKey : ''"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />
    <jcode-layer-picker
      v-else-if="['inputLayer'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :options="getOptions(component)"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      :columns="config.columns"
      @change="handleChange"
    />

    <jcode-time-picker
      v-else-if="['time'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :format="config.format"
      :disabled="isNotEdit"
      :clearable="config.clearable"
      :placeholder="config.placeholder"
      :selectableRange="config.selectableRange"
      @change="handleChange"
    />
    <jcode-time-picker
      v-else-if="['timeRange'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :format="config.format"
      :disabled="isNotEdit"
      :clearable="config.clearable"
      :startPlaceholder="config.startPlaceholder"
      :endPlaceholder="config.endPlaceholder"
      :isRange="true"
      @change="handleChange"
    />

    <jcode-datetime-picker
      v-else-if="['date', 'dateRange'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :type="`${config.picker}${component.type === 'dateRange' ? 'range' : ''}`"
      :format="config.format"
      :clearable="config.clearable"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-area-picker
      v-else-if="['areaSelect'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :clearable="config.clearable"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-map-picker
      v-else-if="['inputMap'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      :clearable="config.clearable"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      @change="handleChange"
    />

    <jcode-upload-file
      v-else-if="['upload', 'uploadimg'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
      :accept="config.accept"
      :limit="config.limit"
      :maxSize="config.maxSize"
      :sizeType="config.sizeType"
      :isTip="config.isTip"
      :listType="
        config.listType || component.type == 'uploadimg'
          ? 'picture-card'
          : undefined
      "
      :disabled="isNotEdit"
    />

    <jcode-company-picker
      :getDataSource="getDataSource"
      v-else-if="['companySelect'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      :placeholder="config.placeholder"
      @change="handleChange"
    />

    <jcode-department-picker
      :getDataSource="getDataSource"
      v-else-if="['departmentSelect'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="isNotEdit"
      :placeholder="config.placeholder"
      :companyId="limitsCompanyId"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />

    <jcode-user-picker
      v-else-if="['userSelect'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      :getDataSource="getDataSource"
      :placeholder="config.placeholder"
      :isMulti="config.isMultiSelect"
      :isNotSaveData="config.isNotSaveData"
      @change="handleChange"
    />
    <jcode-userid-fullnames
      v-else-if="['useridFullnames'].includes(component.type)"
      :modelValue="modelValue"
      :disabled="true"
      :userIds="config.userIds"
    />

    <jcode-code
      v-else-if="['encode'].includes(component.type)"
      :modelValue="modelValue"
      :code="config.code"
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

    <jcode-qrcode
      v-else-if="['qrcode'].includes(component.type) && config.bindingType == 1"
      :modelValue="formData[config.valueIdKey]"
      :size="config.size"
      :background="config.background"
      :color="config.color"
      :margin="config.margin"
    >
    </jcode-qrcode>
    <jcode-qrcode
      v-else-if="['qrcode'].includes(component.type) && config.bindingType == 2"
      :modelValue="modelValue"
      :size="config.size"
      :background="config.background"
      :color="config.color"
      :margin="config.margin"
    >
    </jcode-qrcode>

    <jcode-barcode
      v-else-if="
        ['barcode'].includes(component.type) && config.bindingType == 1
      "
      :modelValue="formData[config.valueIdKey]"
      :background="config.background"
      :color="config.color"
      :height="config.height"
      :type="config.format"
      :textAlign="config.textAlign"
      :fontOptions="config.fontOptions"
      :textPosition="config.textPosition"
      :displayValue="config.displayValue"
    >
    </jcode-barcode>
    <jcode-barcode
      v-else-if="
        ['barcode'].includes(component.type) && config.bindingType == 2
      "
      :modelValue="modelValue"
      :background="config.background"
      :color="config.color"
      :height="config.height"
      :type="config.format"
      :textAlign="config.textAlign"
      :fontOptions="config.fontOptions"
      :textPosition="config.textPosition"
      :displayValue="config.displayValue"
    >
    </jcode-barcode>
    <jcode-count
      v-else-if="['count'].includes(component.type)"
      :modelValue="modelValue"
      :decimal="config.decimal"
      :thousandSeparator="config.thousandSeparator"
      :isChinese="config.isChinese"
      :formData="formData"
      :formatJson="config.formatJson"
      :tableIndex="tableIndex"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    >
    </jcode-count>

    <jcode-switch
      v-else-if="['switch'].includes(component.type)"
      :modelValue="modelValue"
      :valueType="config.valueType"
      :activeValue="config.checkedValue"
      :inactiveValue="config.unCheckedValue"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />
    <jcode-slider
      v-else-if="['slider'].includes(component.type)"
      :modelValue="modelValue"
      :min="config.min"
      :max="config.max"
      :step="config.step"
      :showTooltip="config.showTooltip"
      :disabled="isNotEdit"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />

    <jcode-color-picker
      v-else-if="['inputColor'].includes(component.type)"
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
      :placeholder="config.placeholder"
      :prefixIcon="config.prefixIcon"
      :suffixIcon="config.suffixIcon"
      :maxlength="config.maxlength ? config.maxlength : -1"
      :disabled="isNotEdit"
      @blur="handleChange($event.detail.value)"
    />

    <uni-easyinput
      v-else-if="['textarea'].includes(component.type)"
      type="textarea"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      @blur="handleChange($event.detail.value)"
      :placeholder="config.placeholder || ''"
      :maxlength="config.maxlength ? config.maxlength : -1"
      :disabled="isNotEdit"
      autoHeight
    />
    <jcode-editor
      v-else-if="['textEditor'].includes(component.type)"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
      :placeholder="config.placeholder || ''"
      :disabled="isNotEdit"
      autoHeight
    />
    <jcode-auto-complete
      v-else-if="['autoComplete'].includes(component.type)"
      :modelValue="modelValue"
      :options="getOptions(component)"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      :labelKey="config.labelKey"
      :valueKey="config.valueKey"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />
    <jcode-input-tag
      v-else-if="['inputTag'].includes(component.type)"
      :modelValue="modelValue"
      :options="getOptions(component)"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      :labelKey="config.labelKey"
      :valueKey="config.valueKey"
      :colors="config.colors"
      :isStyleLoop="config.isStyleLoop"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />
    <jcode-data-picker
      v-else-if="['cascaderSelect'].includes(component.type)"
      :modelValue="modelValue"
      :options="getOptions(component)"
      :placeholder="config.placeholder"
      :disabled="isNotEdit"
      :labelKey="config.labelKey"
      :valueKey="config.valueKey"
      :isTreeData="config.dataType == 'options'"
      :idKey="config.dataType === 'dataSource' ? config.idKey : ''"
      :pIdKey="config.dataType === 'dataSource' ? config.pidKey : ''"
      :showFormat="config.showFormat"
      :separator="config.separator"
      :changeOnSelect="config.changeOnSelect"
      @update:modelValue="setValue(component.id, $event)"
      @change="handleChange"
    />

    <uni-easyinput
      v-else-if="!['viewTable'].includes(component.type)"
      type="text"
      :modelValue="modelValue"
      @update:modelValue="setValue(component.id, $event)"
      @blur="handleChange($event.detail.value)"
      :placeholder="config.placeholder || ''"
      :prefixIcon="config.prefixIcon || ''"
      :suffixIcon="config.suffixIcon || ''"
      :maxlength="config.maxlength ? config.maxlength : -1"
      :disabled="isNotEdit"
    />
  </uni-forms-item>
</template>

<script setup>
import { $t, GET_DATA, GET_GLOBAL, OFF, ON, VALIDATENULL } from '@/utils/index';
import { computed, onBeforeMount } from 'vue';

const props = defineProps({
  modelValue: {},
  component: {},
  getDataSource: Function,
  editMode: { default: true },
  tableId: String,
  tableIndex: Number,
  formId: String,
  isEdit: Boolean,
});
const emit = defineEmits(['change', 'update:modelValue']);
defineOptions({ name: 'jcode-customform-item' });

const config = computed(function () {
  const myConfig = props.component.config;
  if (props.component.config.getUpConfig) {
    const _config = myConfig.getUpConfig({
      formData: formData.value,
      config: props.component.config,
    });
    if (_config) {
      Object.keys(_config).forEach((key) => {
        myConfig[key] = _config[key];
      });
    }
  }
  return myConfig;
  // return this.component.config;
});
const isNotEdit = computed(function () {
  if (props.isEdit) {
    return false;
  }
  return !(
    props.editMode &&
    !config.value.readonly &&
    !config.value.disabled &&
    config.value.edit != false
  );
});
const formData = computed(function () {
  return GET_DATA(`jcode_form_data_${props.formId}`);
});
const limitsCompanyId = computed(function () {
  const loginUser = GET_GLOBAL('loginUser');
  if (config.value.limits == '2') {
    return loginUser.f_CompanyId;
  } else if (config.value.limits == '4') {
    return config.value.companyId;
  } else {
    return '';
  }
});

const handleValueChange = function (value) {
  if (value == undefined) {
    handleChange();
  } else {
    const myOptions = getOptions(props.component);
    const changeData = myOptions.find((t) => t.value == value);
    handleChange(changeData);
  }
};
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
  const formData__local = GET_DATA(`jcode_form_data_${props.formId}`);
  let options = [];
  if (props.tableId) {
    options = props.getDataSource(
      component,
      formData__local[props.tableId][props.tableIndex],
      formData__local,
    );
  } else {
    options = props.getDataSource(component, formData__local);
  }
  // if (component.type == 'inputLayer') {
  // 	console.log(options, component, 'inputLayer')
  // }

  return options;
};

/* TODO: 未识别的生命周期 unmounted 请手动转换 */

onBeforeMount(() => {
  if (
    props.component.type == 'inputLayer' ||
    props.component.type == 'buttonLayer'
  ) {
    ON(`valueChange_${props.component.id}`, handleValueChange);
  }
});
</script>
