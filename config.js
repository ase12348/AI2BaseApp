export default {
	// 登录页显示的公司名称
	"company": "苏州极简搭信息技术有限公司",
	// App 版本号
	"appVersion": "3.3.0",
	// App 版本标识（跟随版本号展示，如：社区版），对应 Web 端 config/web.ts 的 edition
	"edition": "社区版",
	// 多语言设置
	"language": {
		mainType: 'chinese',
		type: 'chinese',
	},
	// 是否允许用户注册
	"enableSignUp": false,
	// 请求数据的接口地址；可以配置多个，开发环境下登录页会出现选择菜单供您选择
	"apiHost": [
		"http://localhost:5050",
		"http://localhost:5050"

	],
	// 开发环境下自动填充登录账号密码，与接口地址一一对应，只在开发环境下显示
	"devAccount": [
		{
			username: "System",
			password: "jianda123"
		},
		{
			username: "System",
			password: "jianda123"
		}
	],
	// 开发环境使用的接口地址（数组索引）
	"devApiHostIndex": 0,
	// 生产环境使用的接口地址（数组索引）
	"prodApiHostIndex": 1,
	
	// 地图相关
	"mapKey":'XZWBZ-JGFC3-2IS3K-YFWJ6-LAWIF-SBBTZ',
	
	// 小程序绑定登录等配置（login=登录，bind=绑定，unbind=解绑）
	"miniProgramAccount": {
		// 微信小程序 
		"weixin": ['login','bind','unbind'],
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
			"fetchMsg": 3000
		}
	}
}
