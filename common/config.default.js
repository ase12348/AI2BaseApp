// 本页是框架的默认配置页
// 请不要修改本页的任何内容

// 如需定制相关配置项，请修改项目根目录下的 config.js 文件内的相应条目

export default {
  // 登录页显示的公司名称
  "company": "苏州极简搭信息技术有限公司",
  // App 版本号
  "appVersion": "0.0.1",
  // 是否允许用户注册
  "enableSignUp": false,
  // 请求数据的接口地址；可以配置多个，开发环境下登录页会出现选择菜单供您选择
  "apiHost": [
    "http://localhost:5000",
  ],
  // 开发环境下自动填充登录账号密码，与接口地址一一对应，只在开发环境下显示
  "devAccount": [
    { username: "System", password: "0000" },
  ],
  // 开发环境使用的接口地址（数组索引）
  "devApiHostIndex": 0,
  // 生产环境使用的接口地址（数组索引）
  "prodApiHostIndex": 0,

  // 小程序绑定登录等配置（login=登录，bind=绑定，unbind=解绑）
  "miniProgramAccount": {
    // 微信小程序 
    "weixin": [],
    // 支付宝小程序
    "alipay": [],
    // 钉钉小程序
    "dingtalk": []
  },

  // 页面相关配置
  "pageConfig": {
    // 全局设置是否使用圆形头像
    "roundAvatar": false,
		
    // 「消息」页
    "msg": {
      // 周期轮询消息的时间间隔，单位是毫秒
      "fetchMsg": 3000
    },

    // 「聊天消息」页
    "chat": {
      // 周期轮询消息的时间间隔，单位是毫秒
      "fetchMsg": 1500
    }
  }
}
