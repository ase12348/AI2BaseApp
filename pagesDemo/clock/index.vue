<template>
  <view
    :key="pageKey"
    v-if="ready"
    class="page bg-white"
    :style="{ 'min-height': SCREENHEIGHT() + 'px' }"
  >
    <jcode-timeline-wraper>
      <jcode-timeline-item
        v-for="(timeItem, index) in nowRule.times"
        :key="index"
        :isFirst="index == 0"
        :isLast="index == nowRule.times.length - 1"
        :color="timeItem.need ? '#00CACF' : ''"
      >
        <view style="font-size: 12px">
          <text>{{ timeItem.label }}:</text><text>{{ timeItem.time }}</text>
          <text
            v-if="!timeItem.need && timeItem.clockIn && !timeItem.clockInTime"
            >【{{ $t('未打卡') }}】</text
          >
        </view>
        <view v-if="!timeItem.need && timeItem.clockIn && timeItem.clockInTime">
          <view style="font-size: 17px; color: #333; margin-top: 8px">
            {{ $t('打卡时间') }}:{{ timeItem.clockInTime }}
            <text v-if="timeItem.clockInLater">【{{ $t('迟到') }}】</text>
            <text v-if="timeItem.clockInEarlier">【{{ $t('早退') }}】</text>
          </view>
          <view style="font-size: 12px; color: #6a6a6a; margin-top: 8px">
            <uni-icons type="location-filled" size="16" color="#0FC979" />{{
              nowRule.address
            }}</view
          >
        </view>

        <view
          class="clockContent"
          v-if="timeItem.need && nowRule.distance < 300"
        >
          <view @click.stop="clockIn(timeItem)" class="clockBtn active">
            <view style="font-size: 16px">{{ timeItem.btnName }}</view>
            <view style="font-size: 12px; margin-top: 4px"
              ><jcode-time-now
            /></view>
          </view>
          <view style="font-size: 12px; color: #6a6a6a; margin-top: 16px">
            <uni-icons type="location-filled" size="16" color="#0FC979" />{{
              nowRule.address
            }}</view
          >
        </view>
        <view class="clockContent" v-else-if="timeItem.need">
          <view class="clockBtn">
            <view style="font-size: 16px">{{ timeItem.btnName }}</view>
            <view style="font-size: 12px; margin-top: 4px"
              ><jcode-time-now
            /></view>
          </view>
          <view style="font-size: 12px; color: #6a6a6a; margin-top: 16px">
            <uni-icons
              type="info-filled"
              size="16"
              color="#FFC31E"
            />{{ $t('当前不在考勤范围内') }}<text
              style="color: #00cacf; padding-left: 4px"
              @click.stop="lookMap(timeItem)"
              >{{ $t('查看考勤范围') }}</text
            ></view
          >
        </view>
      </jcode-timeline-item>
    </jcode-timeline-wraper>
  </view>
</template>

<script setup>
import { PAGE_LAUNCH } from '@/utils/jcodePlatform';
import {
  $t,
  DATENOW,
  DATENOW_DIFF,
  DATE_DIFF,
  GET_GLOBAL,
  GET_LOCATION,
  HIDE_LOADING,
  LOADING,
  NAV_TO_LAYER,
  ONCE,
  SCREENHEIGHT,
  TABLEITEM_DATEFORMAT,
} from '@/utils/index';
import { HTTP_GET, HTTP_POST, HTTP_PUT } from '@/utils/http';
import { ref } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';

const loginUser = ref(null);
const rules = ref([]);
const clockInList = ref([]);
const nowRule = ref(null);
const time = ref('');
const lat = ref(0);
const lng = ref(0);
const getLoactionTime = ref(1);
const ready = ref(false);
const timer = ref(null);
const pageKey = ref(1);

const init = async function () {
  LOADING('加载中...');
  ready.value = false;
  loginUser.value = GET_GLOBAL('loginUser');
  rules.value = await getClockRules();
  if (rules.value.length == 0) {
    HIDE_LOADING();
    return;
  }
  clockInList.value = await getClockInList();
  setNowRule();
  ready.value = true;
  HIDE_LOADING();
  setLocation();
};
const getClockRules = async function () {
  let list = await HTTP_GET({
    url: '/demoApp/apprules',
    params: {
      f_Person: loginUser.value.f_UserId,
      page: 1,
      rows: 1,
    },
  });

  // 过滤星期
  let date = new Date();
  const week = date.getDay();

  list = list.filter((t) => t.f_Date.indexOf(week) > -1);
  return list;
};
const setNowRule = function () {
  for (let item of rules.value) {
    const scopeList = item.f_Scope.split(',');
    const timeList = item.f_Time.split(',');
    const ruleItem = {
      id: item.f_Id,
      name: item.f_Name,
      address: scopeList[0],
      lng: scopeList[1],
      lat: scopeList[2],
      times: [],
    };

    for (let time__local of timeList) {
      let timeItems = time__local.split('|');
      let timeItems2 = timeItems[1].split(' - ');

      const startNode = {
        label: timeList.length > 1 ? `${timeItems[0]}${$t('上班时间')}` : $t('上班时间'),
        btnName: $t('上班打卡'),
        time: timeItems2[0],
        need: false,
        type: 1, // 上班
        timeDiff: DATENOW_DIFF(`${DATENOW('YYYY-MM-DD')} ${timeItems2[0]}`),
      };
      if (startNode.timeDiff < 0) {
        startNode.timeDiff = -startNode.timeDiff;
      }
      let clockInLog = clockInList.value.find(
        (t) => t.f_RuleId == ruleItem.id && t.f_OfficeTime == timeItems2[0],
      );
      if (clockInLog) {
        startNode.clockId = clockInLog.f_Id;
        startNode.clockIn = true;
        startNode.clockInTime = TABLEITEM_DATEFORMAT(
          clockInLog.f_OfficeTimePunch,
          'YYYY-MM-DD HH:mm:ss',
        ).toString();

        startNode.clockInLater =
          DATE_DIFF(
            clockInLog.f_OfficeTimePunch,
            `${DATENOW('YYYY-MM-DD')} ${timeItems2[0]}`,
          ) > 60000;

        //console.log('test',this.DATE_DIFF(`${this.DATENOW('YYYY-MM-DD')} ${timeItems2[0]}`,clockInLog.f_OfficeTimePunch) )
      }
      ruleItem.times.push(startNode);

      const endNode = {
        label: timeList.length > 1 ? `${timeItems[0]}${$t('下班时间')}` : $t('下班时间'),
        btnName: $t('下班打卡'),
        time: timeItems2[1],
        need: false,
        type: 2, // 下班,
        timeDiff: DATENOW_DIFF(`${DATENOW('YYYY-MM-DD')} ${timeItems2[1]}`),
      };
      if (endNode.timeDiff < 0) {
        endNode.timeDiff = -endNode.timeDiff;
      }
      let clockInLog2 = clockInList.value.find(
        (t) => t.f_RuleId == ruleItem.id && t.f_ClosingTime == timeItems2[1],
      );
      if (clockInLog2) {
        endNode.clockId = clockInLog2.f_Id;
        endNode.clockIn = true;
        endNode.clockInTime = TABLEITEM_DATEFORMAT(
          clockInLog2.f_ClosingTimePunch,
          'YYYY-MM-DD HH:mm:ss',
        ).toString();

        if (!startNode.clockIn) {
          startNode.clockId = endNode.clockId;
          startNode.clockIn = true;
        }

        endNode.clockInEarlier =
          DATE_DIFF(
            clockInLog2.f_ClosingTimePunch,
            `${DATENOW('YYYY-MM-DD')} ${timeItems2[1]}`,
          ) < -60000;
      } else if (startNode.clockIn) {
        endNode.clockId = startNode.clockId;
      }

      ruleItem.times.push(endNode);
    }

    let clockTimes = ruleItem.times.filter((t) => t.clockIn != true);

    if (clockTimes.length > 0) {
      let minClockTimeItem = clockTimes[0];
      for (let clockTimeItem of clockTimes) {
        if (minClockTimeItem.timeDiff > clockTimeItem.timeDiff) {
          minClockTimeItem = clockTimeItem;
        }
      }

      minClockTimeItem.need = true;

      for (let clockTimeItem of clockTimes) {
        const timeDiff = DATE_DIFF(
          `${DATENOW('YYYY-MM-DD')} ${clockTimeItem.time}`,
          `${DATENOW('YYYY-MM-DD')} ${minClockTimeItem.time}`,
        );
        if (!clockTimeItem.need && timeDiff < 0) {
          clockTimeItem.clockIn = true;
          //console.log(clockTimeItem,"clockTimeItem");
        }
      }
    }

    //console.log(ruleItem,'ruleItem');
    //this.nowRule = ruleItem;
    //alert(JSON.stringify(ruleItem))

    //console.log(ruleItem);

    if (lng.value == 0) {
      nowRule.value = ruleItem;
      break;
    } else {
      ruleItem.distance = getDistance(
        ruleItem.lat,
        ruleItem.lng,
        lat.value,
        lng.value,
      );
      if (
        nowRule.value == null ||
        nowRule.value.distance == undefined ||
        nowRule.value.distance > ruleItem.distance ||
        nowRule.value.id == ruleItem.id
      ) {
        nowRule.value = ruleItem;
      }
    }
  }
};
const setLocation = async function () {
  const res = await GET_LOCATION();
  if (res) {
    lat.value = res.lat;
    lng.value = res.lng;
  }
  setNowRule();
  pageKey.value++;

  timer.value = setTimeout(async () => {
    await setLocation();
  }, getLoactionTime.value * 1000);

  getLoactionTime.value++;
  if (getLoactionTime.value > 10) {
    getLoactionTime.value == 10;
  }
};
const refresh = async function () {
  LOADING('刷新中...');
  clearTimeout(timer.value);
  setTimeout(async () => {
    clearTimeout(timer.value);
    clockInList.value = await getClockInList();

    await setLocation();
    //this.HIDE_LOADING()
    uni.showToast({
      title: $t('打卡成功'),
    });
  }, 100);
};
const getDistance = function (lat1, lng1, lat2, lng2) {
  lat1 = lat1 || 0;
  lng1 = lng1 || 0;
  lat2 = lat2 || 0;
  lng2 = lng2 || 0;

  let rad1 = (lat1 * Math.PI) / 180.0;
  let rad2 = (lat2 * Math.PI) / 180.0;
  let a = rad1 - rad2;
  let b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
  let r = 6378137;
  let distance =
    r *
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2),
      ),
    );

  return distance;
};
const lookMap = function (timeItem) {
  let clockData = {
    type: timeItem.type,
    f_RuleId: nowRule.value.id,
    f_Id: timeItem.clockId,
  };
  if (timeItem.type == 1) // 上班
  {
    clockData.f_OfficeTime = timeItem.time;
  } else {
    clockData.f_ClosingTime = timeItem.time;
  }

  ONCE('jcode-clockIn-refresh', () => {
    setTimeout(() => {
      refresh();
    }, 100);
  });

  NAV_TO_LAYER(
    `./selectScope`,
    {
      lng: nowRule.value.lng,
      lat: nowRule.value.lat,
      distance: nowRule.value.distance,

      myLat: lat.value,
      myLng: lng.value,
      clockData,
    },
    true,
  );
};
const getClockInList = async function () {
  let list = await HTTP_GET({
    url: '/demoApp/apppunchs',
    params: {
      f_CreateUserId: loginUser.value.f_UserId,
      f_CreateDate: DATENOW(),
    },
  });
  return list;
};
const clockIn = async function (timeItem) {
  if (nowRule.value.distance < 300) {
    //
    LOADING('打卡中...');
    let clockData = {
      type: timeItem.type,
      f_RuleId: nowRule.value.id,
    };

    if (timeItem.type == 1) // 上班
    {
      clockData.f_OfficeTime = timeItem.time;
    } else {
      clockData.f_ClosingTime = timeItem.time;
    }

    let res;
    if (!timeItem.clockId) {
      res = await HTTP_POST({
        url: '/demoApp/apppunch',
        data: clockData,
      });
    } else {
      res = await HTTP_PUT({
        url: `/demoApp/apppunch/${timeItem.clockId}`,
        data: clockData,
      });
    }

    //this.HIDE_LOADING()
    if (res) {
      await refresh();
    }
  } else {
    uni.showToast({
      title: $t('当前未在打卡范围'),
      icon: 'error',
    });
  }
};

onLoad(async () => {
  if (await PAGE_LAUNCH()) {
    await init();
  }
});
// #ifdef APP-VUE || APP-HARMONY
onBackPress(() => {
  HIDE_LOADING();
});
// #endif
</script>
<style lang="scss" scoped>
.clockContent {
  position: relative;
  width: 100%;
  text-align: center;
}

.clockBtn {
  width: 100px;
  height: 100px;
  background: linear-gradient(180deg, #bfe9eb 0%, #4e6b6b 100%);
  box-shadow: 0px 2.5px 4px 0.5px rgba(68, 79, 80, 0.3);
  border-radius: 50%;
  text-align: center;
  margin: auto;
  margin-top: 30px;
  color: #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  &.active {
    background: linear-gradient(180deg, #01f8ff 0%, #00a3a8 100%);
  }
}
</style>
