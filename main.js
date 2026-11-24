import { createSSRApp } from 'vue'
import App from '@/App.vue'
import moment from 'moment'
import { $t } from '@/utils/index'

moment.locale('zh-cn')

// 全局数据对象（对应原 Vue2 的 uni.$jcode）
uni.$jcode = {
  data: {
    jcode_datasource: {}
  }
}

const app = createSSRApp(App)

app.config.globalProperties.$t = $t

export function createApp() {
  return {
    app
  }
}
