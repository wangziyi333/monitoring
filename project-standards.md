# 项目规范（ToC）

## 1. 项目定位

这是一个以教学和演示为目标的 `Vue 3 + TypeScript + Express` 前端监控与埋点项目。

规范目标：

- 保持目录和职责清晰，便于学习与复盘
- 优先保证可读性、可讲解性和可扩展性
- 在一天内完成 Demo 的前提下，尽量体现中大型团队的工程思路

## 2. 目录结构规范

- 页面放在 `frontend/src/pages`
- 通用组件放在 `frontend/src/components`
- 路由配置放在 `frontend/src/router`
- 监控 SDK 放在 `frontend/src/sdk`
- 前端接口封装放在 `frontend/src/api`
- 全局样式放在 `frontend/src/styles`
- 后端 mock 服务放在 `server/src`

目录拆分以“职责边界”优先，不按随意功能堆叠。

## 3. 命名规范

### 3.1 Vue 组件文件

- 使用 `PascalCase`
- 示例：
  - `AppNav.vue`
  - `DemoCard.vue`
  - `EventCenterPage.vue`

规则：

- 每个英文单词首字母大写
- 一般用于组件、类、类型感较强的对象

### 3.2 普通 TypeScript 文件

- 使用 `kebab-case` 或语义清晰的小写目录名
- 示例：
  - `create-app.ts`
  - `safe-json.ts`
  - `event-store.ts`
  - `router/index.ts`

规则：

- `kebab-case` 表示单词全部小写，中间用短横线连接
- 目录名优先使用简单、语义清晰的小写英文，如 `pages`、`components`、`collectors`

### 3.3 导出函数

- 使用 `camelCase`
- 示例：
  - `createMonitoringApp`
  - `initMonitor`
  - `registerRouteCollector`

规则：

- 第一个单词首字母小写
- 后面每个单词首字母大写

## 4. 组件拆分规范

- 页面组件负责场景组织和页面结构
- 通用组件负责复用展示
- 监控采集逻辑不写在页面里，统一收敛到 `sdk`
- 一个文件尽量只承担一类清晰职责

当一个组件同时承担“页面布局 + 复杂数据处理 + 复用 UI”三种职责时，应考虑拆分。

## 5. 路由规范

- 路由统一集中在 `frontend/src/router/index.ts`
- 不使用文件系统路由
- 与页面访问相关的监控逻辑统一通过路由生命周期注册

## 6. API 与请求规范

- 页面查询接口统一放在 `frontend/src/api`
- 页面中不要直接散写 `fetch`
- 监控 SDK 的上报请求允许在 `frontend/src/sdk/transport` 中直接使用 `fetch`
- 所有请求都应处理失败情况

## 7. 样式规范

- 使用 `frontend/src/styles/global.css` 管理全局样式
- 使用 CSS 变量统一颜色、边框、阴影、间距等主题 token
- 页面和组件使用语义化 class 名
- 当前项目不引入额外 UI 组件库

## 8. 状态管理规范

- 当前项目不引入 `Pinia`
- 页面状态优先使用 `ref`、`reactive`、`computed`
- 全局状态只保留在监控 SDK 自身内部，例如队列、上下文、session 信息

## 9. 错误处理规范

- 页面请求使用 `try/catch`
- 页面要具备基础加载态、空态、失败态
- 监控 SDK 代码必须安全失败
- 不能因为监控逻辑异常导致页面主流程崩溃

## 10. 类型规范

- 公共结构优先使用 `interface`
- 联合字面量、组合类型优先使用 `type`
- 类型定义放在靠近职责的位置
- 监控事件和配置类型放在 `frontend/src/sdk/types`
- 不允许用 `any` 直接跳过类型问题，除非确实没有更合理方案且范围极小

## 11. 常量规范

- 关键常量必须提取
- 包括但不限于：
  - 事件类型
  - 存储 key
  - 默认批量大小
  - 默认 flush 间隔

避免魔法字符串和魔法数字在多个文件重复出现。

## 12. 异步处理规范

- 优先使用 `async/await`
- 避免同一项目中大量混用 `.then()` 与 `async/await`
- 异步请求失败时必须有兜底处理

## 13. 工具函数规范

- 工具函数按职责放置
- SDK 工具统一放在 `frontend/src/sdk/utils`
- 不创建巨大的“杂烩型” `utils.ts`

## 14. 第三方依赖规范

- 前端核心依赖仅保留：
  - `vue`
  - `vue-router`
- 后端核心依赖仅保留：
  - `express`
  - `cors`
- 在不影响教学目标的情况下，尽量少引入第三方依赖

## 15. 国际化规范

- 当前项目默认中文文案
- 当前阶段不接入 i18n
- 如需保留英文术语，应优先附带中文解释

## 16. 测试与验证规范

- 核心纯逻辑优先采用 TDD 思路
- 优先测试队列、事件格式化、工具函数等纯逻辑模块
- 页面级能力以手动联调验证为主
- 完成代码后必须检查：
  - 没有残留 `console.log`
  - 没有注释掉的废弃代码
  - 没有未使用的变量、函数、导入
  - 没有明显类型错误

## 17. 文档规范

- 后续文档默认使用中文
- 必要英文术语要尽量配中文解释
- 设计文档、实现计划、复盘总结优先写入 `docs/superpowers`
