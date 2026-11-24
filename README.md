# 极简搭 AI 应用开发基座 · 移动端（Vue3）

版本：3.3.0（社区版）

许可：[Apache License 2.0](LICENSE)

[官方网站](https://www.jcodesoft.com) · [Web 前端](https://gitee.com/program_cat/ai2-base-web) · [后端服务](https://gitee.com/program_cat/ai2-base-api)

| 组成 | 仓库 | 技术栈 | 说明 |
| --- | --- | --- | --- |
| Web 前端 | [AI2BaseWeb](https://gitee.com/program_cat/ai2-base-web) | Vue 3 / Vite / TS | PC 端管理界面 |
| 后端服务 | [AI2BaseApi](https://gitee.com/program_cat/ai2-base-api) | .NET 10 / ASP.NET Core | API 宿主、ORM、权限、缓存、任务调度 |
| 移动端 | 当前仓库 | uni-app / Vue 3 | 同一套表单渲染到小程序 / App / 鸿蒙 |

> 官网与产品介绍：**<https://www.jcodesoft.com>**

---

## 一、环境要求

| 项 | 要求 |
|---|---|
| HBuilderX | 4.0 及以上（建议用最新版） |
| Node.js | 不需要，依赖已内置 |
| npm 安装 | **不需要执行**，`node_modules` 已随包提供 |

本项目是 **HBuilderX 项目**，不是 npm CLI 项目（`package.json` 中没有 `scripts`，也没有 `@dcloudio` 系列依赖）。
因此**无法**用 `npm run dev` 之类的命令启动，必须通过 HBuilderX 打开并运行。

---

## 二、快速开始

1. 解压项目到本地目录。
   路径建议不含中文、空格和过深层级，例如 `D:\work\uni-app-v3`。
2. HBuilderX → 菜单「文件」→「导入」→「从本地目录导入」，选中解压出来的 `uni-app-v3` 目录。
3. 按下面第三节修改 `config.js` 中的配置项。
4. 菜单「运行」→「运行到浏览器」，或「运行到小程序模拟器」。

首次编译需要一点时间，属正常现象。

---

## 三、必改配置：`config.js`

项目根目录下的 `config.js` 是唯一的业务配置入口。

| 配置项 | 说明 | 是否必须改 |
|---|---|---|
| `apiHost` | 后端服务地址数组。**生产环境取 `prodApiHostIndex` 指定的那一项**，开发环境取 `devApiHostIndex` 指定的那一项 | **必须** |
| `prodApiHostIndex` / `devApiHostIndex` | 指定上面数组用第几个（从 0 开始） | 视情况 |
| `company` | 登录页与「我的」页底部显示的版权名称 | 建议 |
| `mapKey` | 腾讯位置服务 Key，需自行申请 | **必须** |
| `appVersion` | 应用版本号，仅用于界面展示 | 可选 |
| `enableSignUp` | 是否允许用户自助注册 | 视需求 |
| `isTenant` | 是否开启多租户 | 视后端 |
| `devAccount` | 仅在开发环境登录页自动填充账号密码，生产包不生效 | 建议清空 |
| `language` | 界面语言 | 可选 |
| `miniProgramAccount` | 各小程序的登录/绑定开关，数组元素为 `login` / `bind` / `unbind` | 视需求 |
| `pageConfig` | 消息轮询间隔、头像样式等页面级配置 | 可选 |

> 注意：`common/config.default.js` 是框架默认值文件，**不要修改**。所有定制都写在 `config.js` 里。

---

## 四、必改配置：`manifest.json`

如果用你自己的账号发布，以下几项必须换成你自己的：

| 位置 | 字段 | 用途 |
|---|---|---|
| 顶部 | `appid` | DCloud 账号下的应用标识，打包 App 时需要 |
| `mp-weixin.appid` | — | 微信小程序 AppID |
| `mp-alipay.appid` | — | 支付宝小程序 AppID |
| `mp-dingtalk.appid` | — | 钉钉小程序 AppID |
| `harmony.packageName` | — | HarmonyOS 应用包名 |
| `h5.sdkConfigs.maps.qqmap.key` | — | H5 端腾讯地图 Key，需与 `config.js` 的 `mapKey` 一致 |

只跑 H5 或只在本地调试小程序时，可以先不改；正式发布前必须改。

---

## 五、目录结构

```
uni-app-v3/
├── config.js              业务配置（改这里）
├── manifest.json          各平台配置与图标启动图
├── pages.json             路由与分包注册
├── main.js / App.vue      入口
├── pages/                 主包页面（首页、登录、消息、工作流等）
├── pagesMy/               「我的」分包
├── components/            自定义组件（jcode-mpui 为 UI 组件库）
├── hooks/ utils/ common/  逻辑与工具
├── static/ res/           静态资源、图标、启动图
├── uni_modules/           uni-ui 组件库
└── node_modules/          已内置依赖（lodash、moment、@uni-plugs/uni-code）
```

---

## 六、常见问题

**打开就白屏 / 接口全部报错**
`config.js` 的 `apiHost` 还是 `localhost`，改成你的后端地址。确认 `prodApiHostIndex` 指向的那一项是正式地址。

**地图不出来 / 提示 Key 无效**
`config.js` 的 `mapKey` 和 `manifest.json` 里 H5 的 `qqmap.key` 换成你自己申请的腾讯位置服务 Key，并在腾讯控制台为对应域名/包名配置白名单。

**小程序提示 AppID 无效或无权限**
`manifest.json` 里对应平台的 `appid` 不是你名下的，换成自己的。

**H5 部署后刷新 404**
路由是 hash 模式，基础路径为 `/webapp/`（见 `manifest.json` 的 `h5.router.base`）。部署目录或反代路径不一致时需要调整。

**依赖报错、提示找不到 lodash / moment**
正常情况不会出现（已内置）。若被误删，在项目根目录执行：

```
npm ci
```

`npm ci` 会按 `package-lock.json` 精确还原。不建议用 `npm i`，版本可能漂移。

**编译报错找不到 vue**
`vue` 由 HBuilderX 内置运行时提供，不需要装在 `node_modules` 里。请确认 HBuilderX 版本为 4.0 及以上，并已安装 uni-app 编译插件（HBuilderX → 工具 → 插件安装）。

---

## 七、其他说明

- 图标与启动图在 `res/icons/` 和 `res/startup/`，路径已在 `manifest.json` 中配好，替换同名文件即可。
- 本项目支持编译到 H5、微信小程序、支付宝小程序、钉钉小程序、App（Android/iOS）与 HarmonyOS。

---

## 八、开源协议

本项目基于 **Apache License 2.0** 开源，版权归苏州极简搭信息技术有限公司所有，许可证全文见根目录 [LICENSE](LICENSE)。

**你可以：**

- 商用、私有化部署、二次开发
- 修改源码后以源码或二进制形式分发，包括闭源分发
- 获得贡献者授予的明确专利许可（贡献者发起专利诉讼时该许可自动终止）

**你需要：**

- 分发时附带一份 Apache License 2.0 副本
- 保留原作品的版权、专利、商标与署名声明
- 对被修改过的文件加显著说明，标明你改动过
- 不得使用「极简搭」名称与商标为你的衍生作品背书（合理描述来源除外）

**免责：** 本软件按「现状」提供，不附带任何明示或默示担保；因使用本软件产生的风险与损失由使用者自行承担。

**第三方组件：** `uni_modules/` 下的 uni-ui 等组件、`components/tki-qrcode/`、`components/jcode-mpui/` 中引入的第三方脚本（如 Apache-2.0 的 ECharts）、`node_modules/` 内置依赖，均遵循其各自的许可协议，不在本项目许可范围内，分发前请自行核对。
