# Monitoring & Event Tracking

一个用于**学习前端监控与埋点**的全栈演示项目。项目以「夏季会员大促」商城为业务场景，从零搭建了一套可运行的监控 SDK、Mock 上报服务与可视化后台，覆盖事件协议设计、多种埋点方式、性能/错误采集、会话回放等完整链路。

> 更详细的学习笔记见 [`book.md`](./book.md)。

---

## 项目简介

前端监控并不只是「发一个 HTTP 请求」。一个可用的监控系统需要先回答：**采什么、怎么标准化、怎么可靠上报、怎么存储与展示**。

本项目把这些问题拆成四层架构，并在真实页面交互中演示每一种能力：

| 层级 | 职责 | 典型模块 |
|------|------|----------|
| **采集层** | 发现行为、异常、性能、回放信号 | `collectors/*`、`replay/*` |
| **标准化层** | 统一事件格式与 TypeScript 类型约束 | `types/events.ts`、`core/monitor.ts` |
| **传输层** | 队列批量上报、页面离开兜底、像素上报 | `transport/queue.ts`、`transport/sender.ts` |
| **展示层** | Mock 服务接收、看板汇总、回放详情 | `server/`、`pages/DashboardPage.vue` |

**技术栈**

- 前端：Vue 3 · Vite · TypeScript · Vue Router · rrweb · web-vitals
- 后端：Express · TypeScript（内存 Mock 存储）

---

## 功能展示

### 1. 前台促销商城 `/`

真实电商场景，承载多种埋点练习：

- **手动埋点**：Hero 区「进入活动会场」按钮，代码内调用 `trackEvent`
- **声明式埋点**：商品卡片购买按钮使用 `data-track` / `data-track-key`
- **动态列表埋点**：商品列表携带 `data-product-id`、`data-product-name`、`data-position`，区分「点了购买」与「点了第几个商品的购买」
- **转化漏斗**：优惠券领取（含校验失败、请求成功/失败）、活动规则下载
- **营销像素**：`trackEventByImage` 模拟第三方渠道像素上报
- **曝光采集**：商品卡片进入视口时自动上报 `product_card_exposure`

**建议操作**：浏览商品 → 点击购买 → 领取优惠券 → 下载规则 → 打开「事件中心」刷新查看字段结构。

### 2. 监控看板 `/dashboard`

汇总 Mock 服务已接收的事件与 rrweb 回放状态：

- 事件总量、错误数、曝光数等核心指标
- 高频事件名称分布（条形图）
- 最新监控信号时间线
- 回放保留概览，可跳转最新 Replay 详情

### 3. 事件中心 `/events`

以表格形式展示后端已接收的全部监控事件，是观察**事件协议、payload 字段、业务属性**最直观的入口。

### 4. 可视化埋点配置 `/visual-tracking`

模拟真实系统中的「配置平台 → SDK 拉取 → 运行时命中」流程：

- 支持 **CSS Selector** 与 **稳定锚点 `data-track-key`** 两种配置模式
- 配置持久化到 Mock 后端，SDK 启动时拉取
- 预览区可验证 `source` 字段：`declarative` / `visual_selector` / `visual_track_key`

### 5. Replay 回放详情 `/replays/:replayId`

基于 **rrweb** 的会话录制与回放：

- 页面操作全程录制，监控事件作为 Timeline Marker 叠加在回放时间轴上
- 白屏、JS 错误、未捕获 Promise 等高价值事件触发**回放保留**并上传
- 看板可一键跳转最新保留的回放

### 6. 实验页面（Lab）

| 路由 | 用途 |
|------|------|
| `/tracking` | 手动埋点、声明式点击、页面停留时长实验 |
| `/errors` | 主动触发 JS 错误、Promise 异常、资源加载失败 |
| `/performance` | 展示 Navigation Timing、FCP、LCP、CLS、Long Task |
| `/study/:stageId` | 分阶段学习路径（如 `/study/foundation`） |

---

## 技术亮点与难点

### 强类型事件协议

所有监控事件通过 `MonitorEventProtocol` 映射 `type / subType / name / payload`，编译期即可约束字段结构，避免「埋点字段随意拼字符串」的常见问题。详见 `frontend/src/sdk/types/events.ts`。

### Event Bus 解耦采集链路

采集器、Resolver、队列、回放保留等模块通过类型安全的 Event Bus 通信（`dom:click` → `track:click:resolved` → `monitor:event`），新增 Collector 无需改动核心上报逻辑。

### 三种上报策略的分工

| 方式 | 适用场景 | 局限 |
|------|----------|------|
| `fetch` + 队列批量 | 常规上报，支持复杂 JSON | 页面关闭时可能中断 |
| `sendBeacon` | 页面卸载兜底 | 请求体大小有限 |
| `Image` 像素 | 营销渠道兼容、跨域简单场景 | 仅 GET、URL 长度受限 |

### 动态列表：DOM 锚点 + 业务字段

列表场景下，仅靠 CSS Selector 容易因 DOM 结构变化而**选择器漂移**。本项目采用：

- **DOM 锚点**：`data-track` 或 `data-track-key`（稳定标识）
- **业务字段**：`data-product-id`、`data-product-name`、`data-position`

Resolver 在点击时自动提取白名单业务属性，写入 payload。

### 回放保留策略

并非所有会话都永久存储。当监控事件命中 `blank_screen_suspected`、`window_error`、`unhandled_rejection` 等高价值信号时，才标记当前 rrweb 录制并上传，平衡存储成本与排障价值。

### 白屏检测

结合路由切换与首屏加载两个阶段，检测主容器缺失、无有效内容、仅 Shell 可见等场景，上报 `blank_screen_suspected`。

### 性能指标全覆盖

自动采集 Navigation Timing、FCP、LCP、CLS、Long Task，并集成 **web-vitals** 库上报 INP、TTFB 及 Google 评级（good / needs-improvement / poor）。

---

## 项目结构

```
Monitoring&EventTracking/
├── frontend/                  # Vue 3 前台 + 监控后台
│   └── src/
│       ├── sdk/               # 自研监控 SDK
│       │   ├── collectors/    # 各类采集器（点击、曝光、错误、性能…）
│       │   ├── core/          # 初始化、上下文、Event Bus
│       │   ├── replay/        # rrweb 录制、保留、上传、时间轴
│       │   ├── transport/     # 队列与上报
│       │   └── types/         # 事件协议与配置类型
│       ├── pages/             # 页面（商城、看板、事件中心…）
│       ├── components/        # 通用组件
│       └── api/               # 与 Mock 后端交互
├── server/                    # Express Mock 服务
│   └── src/
│       ├── store/             # 内存事件 / 回放 / 可视化配置存储
│       └── index.ts           # API 路由
├── docs/                      # 设计文档与学习计划
└── book.md                    # 项目学习笔记
```

---

## 快速开始

### 安装依赖

前端：

```bash
cd frontend
npm install
```

后端：

```bash
cd server
npm install
```

### 启动项目

先启动后端：

```bash
cd server
npm run dev
```

再启动前端：

```bash
cd frontend
npm run dev
```

### 访问地址

| 页面 | 地址 |
|------|------|
| 前台商城 | http://localhost:5173/ |
| 监控看板 | http://localhost:5173/dashboard |
| 事件中心 | http://localhost:5173/events |
| 可视化埋点 | http://localhost:5173/visual-tracking |
| 后端健康检查 | http://localhost:3001/api/health |

> 若 `5173` 端口被占用，Vite 会自动切换到 `5174`、`5175` 等端口。

---

## 埋点设计说明

当前商城页的动态列表埋点采用 **「DOM 锚点 + 业务字段」** 思路：

```html
<button
  data-track="product-buy-desk-lamp"
  data-track-key="product-buy-desk-lamp"
  data-product-id="desk-lamp"
  data-product-name="Halo 氛围台灯"
  data-position="1"
>
  立即购买
</button>
```

这样可以在事件中心清晰区分：

- 「用户点了一个购买按钮」
- 「用户点击了第 1 个位置、商品 desk-lamp 的购买按钮」

---

## 常用命令

前端构建：

```bash
cd frontend
npm run build
```

后端类型检查：

```bash
cd server
npx tsc --noEmit
```

---

## 已知问题与说明

### Windows 中文路径下后端启动失败

当前工作区路径包含中文目录名时，部分依赖通过 `npm` → `.cmd` 包装脚本启动可能出现路径解析异常。

后端 `dev` 脚本已改为直接通过 Node 调用 `tsx`，绕过该问题：

```json
"dev": "node ./node_modules/tsx/dist/cli.mjs src/index.ts"
```

前端脚本同样采用 `node ./node_modules/vite/bin/vite.js` 的方式，确保在中文路径下稳定运行。

---

## 学习资源

- [`book.md`](./book.md) — 完整学习笔记，涵盖事件协议、埋点方式、上报策略、rrweb 回放等
- [`docs/superpowers/plans/study.md`](./docs/superpowers/plans/study.md) — 分阶段学习计划
- [`docs/superpowers/specs/2026-07-13-typed-monitor-event-protocol-design.md`](./docs/superpowers/specs/2026-07-13-typed-monitor-event-protocol-design.md) — 强类型事件协议设计文档

---

## License

ISC
