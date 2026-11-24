<template>
  <div class="l-count">
    <uni-easyinput :value="value2" :disabled="true" type="text">
    </uni-easyinput>
  </div>
</template>

<script setup>
import { COPY, VALIDATENULL } from '@/utils/index';
import { computed, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: [Number, String],
  formatJson: {
    type: Array,
    default: () => [],
  },
  formData: {
    type: Object,
    default: () => {
      return {};
    },
  },
  decimal: {},
  thousandSeparator: {},
  isChinese: {},
  tableIndex: {},
});
const emit = defineEmits(['change', 'update:modelValue']);

const value2 = computed({
  get() {
    let json = '';
    let formatJson = props.formatJson;
    formatJson.map((item) => {
      if (item.type == 'fun' && item.value !== '(' && item.value !== ')') {
        if (['abs', 'max', 'min', 'sqrt'].includes(item.value)) {
          json += `Math.${item.value}`;
        } else if (['int', 'power', 'rand'].includes(item.value)) {
          switch (item.value) {
            case 'int':
              json += 'Math.floor';
              break;
            case 'power':
              json += 'Math.pow';
              break;
            case 'rand':
              json += 'Math.random';
              break;
          }
        } else {
          // 自定义函数
          switch (item.value) {
            case 'average':
              json += 'this.averageFun';
              break;
            case 'ceiling':
              json += 'this.ceilingFun';
              break;
            case 'count':
              json += 'this.countFun';
              break;
            case 'countif':
              json += 'this.countifFun';
              break;
            case 'fixed':
              json += 'this.fixedFun';
              break;
            case 'floor':
              json += 'this.floorFun';
              break;
            case 'large':
              json += 'this.largeFun';
              break;
            case 'log':
              json += 'this.logFun';
              break;
            case 'mod':
              json += 'this.modFun';
              break;
            case 'product':
              json += 'this.productFun';
              break;
            case 'round':
              json += 'this.roundFun';
              break;
            case 'small':
              json += 'this.smallFun';
              break;
            case 'sum':
              json += 'this.sumFun';
              break;
            case 'sumproduct':
              json += 'this.sumproductFun';
              break;
          }
        }
      } else if (item.type === 'comp') {
        if (item.tableId) {
          let res = props.formData[item.tableId].map((t) => t[item.value]);
          json = `${json}[`;
          res.map((item, index) => {
            let newStr = COPY(item) || 0;

            let isString = /[\u4e00-\u9fa5a-zA-Z]/.test(COPY(newStr));
            if (isString) {
              if (index == 0) {
                json = `${json}"${newStr}"`;
              } else {
                json = `${json},"${newStr}"`;
              }
            } else {
              if (index == 0) json = `${json}${newStr}`;
              else json = `${json},${newStr}`;
            }
          });
          json = `${json}]`;
        } else {
          let newStr = COPY(props.formData[item.value]);
          if (!VALIDATENULL(newStr)) {
            if (/[\u4e00-\u9fa5a-zA-Z]/g.test(newStr)) {
              newStr = '"' + newStr + '"';
            }
          }
          json = json + (newStr || 0);
        }
      } else {
        if (item.value == 'i' && !VALIDATENULL(props.tableIndex)) {
          json += props.tableIndex;
        } else {
          json += item.value;
        }
      }
    });
    let val;
    try {
      val = eval(json);
    } catch (err) {
      console.log(err, '计算失败');
      return '';
    }
    if (Number.isNaN(val)) return '';

    if (props.decimal !== undefined) {
      val = val.toFixed(props.decimal);
    }
    if (props.thousandSeparator) {
      let arr = (val + '').split('.');
      let int = arr[0] + '';
      let fraction = arr[1] || '';
      let f = int.length % 3;
      let r = int.substring(0, f);
      for (let i = 0; i < Math.floor(int.length / 3); i++) {
        r += ',' + int.substring(f + i * 3, f + (i + 1) * 3);
      }
      if (f === 0) {
        r = r.substring(1);
      }
      val = r + (fraction ? '.' + fraction : '');
    }
    if (props.isChinese) {
      val = intToChinese(val);
    }
    return val;
  },
  set() {},
});

const intToChinese = function (num) {
  if (!/^\d*(\.\d*)?$/.test(num)) {
    return 'Number is wrong!';
  }
  let AA = new Array(
    '零',
    '壹',
    '贰',
    '叁',
    '肆',
    '伍',
    '陆',
    '柒',
    '捌',
    '玖',
  );
  let BB = new Array('', '十', '百', '千', '万', '亿', '点', '');
  let a = ('' + num).replace(/(^0*)/g, '').split('.'),
    k = 0,
    re = '';
  for (let i = a[0].length - 1; i >= 0; i--) {
    switch (k) {
      case 0:
        re = BB[7] + re;
        break;
      case 4:
        if (!new RegExp('0{4}\\d{' + (a[0].length - i - 1) + '}$').test(a[0]))
          re = BB[4] + re;
        break;
      case 8:
        re = BB[5] + re;
        BB[7] = BB[5];
        k = 0;
        break;
    }
    if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0)
      re = AA[0] + re;
    if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re;
    k++;
  }
  if (a.length > 1) {
    re += BB[6];
    for (let i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
  }
  return re;
};
const averageFun = function (...val) {
  val = val.flat();
  let res = 0;
  val.map((t) => {
    res += t;
  });
  return res / val.length;
};
const ceilingFun = function (num, significance) {
  if (significance < 0)
    return -Math.ceil(num / Math.abs(significance)) * significance || 0;
  else return Math.ceil(num / significance) * significance || 0;
};
const countFun = function (...val) {
  val = val.flat();
  return val.length;
};
const countifFun = function (arr, condition) {
  let count = 0;
  if (Array.isArray(arr)) {
    if (/[><=]/.test(condition)) {
      for (let i = 0; i < arr.length; i++) {
        try {
          if (eval(arr[i] + condition)) count++;
        } catch {
          break;
        }
      }
    } else {
      arr.map((item) => {
        if (item == condition) count++;
      });
    }
  }
  return count;
};
const fixedFun = function (num, n) {
  let res = num.toFixed(n);
  return res;
};
const floorFun = function (number, significance) {
  if (significance < 0)
    return -Math.floor(number / Math.abs(significance)) * significance || 0;
  else return Math.floor(number / significance) * significance || 0;
};
const largeFun = function (arr, n) {
  if (Array.isArray(arr)) {
    arr.sort((a, b) => b - a);
    return arr[n - 1];
  }
};
const smallFun = function (arr, n) {
  if (Array.isArray(arr)) {
    arr.sort((a, b) => a - b);
    return arr[n - 1];
  }
};
const logFun = function (num, n) {
  return Math.log(num) / Math.log(n);
};
const modFun = function (a, b) {
  return a % b;
};
const productFun = function (...arr) {
  arr = arr.flat();
  let res = 1;
  arr.map((val) => {
    res = res * val;
  });
  return res;
};
const roundFun = function (num, n) {
  let res = num.toFixed(n);
  return Number(res);
};
const sumFun = function (...arr) {
  arr = arr.flat();
  let res = 0;
  arr.map((t) => {
    res = res + Number(t);
  });
  return res;
};
const sumproductFun = function (...arr) {
  let combined = arr[0].map((value, index) => {
    let n = value;
    for (let i = 1; i < arr.length; i++) {
      n = n * (arr[i][index] || 0);
    }
    return n;
  });
  let sum = combined.reduce((a, b) => a + b, 0);
  return sum;
};

onMounted(() => {});

watch(
  () => value2.value,
  function (val) {
    emit('update:modelValue', val);
    emit('change', val);
  },
  { immediate: true },
);
</script>
