# 阶段 1：监控 Demo 基线与数据流 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可重复运行的项目基线，让学习者能够解释并验证一条性能事件从浏览器采集到事件中心展示的完整链路。

**Architecture:** 保留当前 Vue 场景层、SDK、Express 接收层和事件中心四层结构。本阶段不扩展 Web Vitals，只修复运行基线、补充项目入口文档，并用当前 `navigation_timing` 事件验证 `collector -> track -> queue -> sender -> server -> view` 数据流。

**Tech Stack:** Vue 3、TypeScript、Vue Router、Vite、Browser Performance API、Express、PowerShell、Git

---

### Task 1: 建立源码 Git 基线

**Files:**
- Track: `frontend/**`
- Track: `server/**`
- Track: `project-standards.md`
- Exclude via existing: `.gitignore`

- [ ] **Step 1: 检查忽略规则是否生效**

Run:

```powershell
git status --short --ignored
```

Expected: `frontend/node_modules/` 与 `frontend/dist/` 以 `!!` 显示，源码目录以 `??` 显示。

- [ ] **Step 2: 暂存项目源码**

Run:

```powershell
git add frontend server project-standards.md
```

- [ ] **Step 3: 检查暂存内容中没有依赖与构建产物**

Run:

```powershell
git diff --cached --name-only
```

Expected: 包含 `frontend/src`、`server/src` 和配置文件，不包含任何 `node_modules` 或 `dist` 文件。

- [ ] **Step 4: 提交源码基线**

Run:

```powershell
git commit -m "chore: capture monitoring demo baseline"
```

Expected: Git 创建一个包含当前 Demo 源码的提交。

### Task 2: 验证前后端静态质量

**Files:**
- Verify: `frontend/package.json`
- Verify: `frontend/tsconfig.app.json`
- Verify: `server/tsconfig.json`

- [ ] **Step 1: 执行前端类型检查与构建**

Run:

```powershell
npm --prefix frontend run build
```

Expected: `vue-tsc` 无类型错误，Vite 输出成功构建信息。

- [ ] **Step 2: 执行服务端类型检查**

Run:

```powershell
npx --prefix server tsc --noEmit -p server/tsconfig.json
```

Expected: 命令退出码为 `0`，无 TypeScript 错误。

- [ ] **Step 3: 扫描临时代码**

Run:

```powershell
rg -n "console\.log|debugger|TODO|FIXME" frontend/src server/src
```

Expected: 只允许 `server/src/index.ts` 中用于显示监听地址的启动日志；没有 `debugger`、`TODO` 或 `FIXME`。

### Task 3: 补齐项目根入口文档

**Files:**
- Create: `README.md`

- [ ] **Step 1: 编写根目录 README**

Create `README.md` with:

```markdown
# Monitoring & Event Tracking Demo

这是一个用于学习前端监控与埋点的 Vue 3 + TypeScript + Express Demo。

## 项目结构

- `frontend/`：业务演示页面、监控 SDK 和事件中心
- `server/`：接收监控事件的本地 Express 服务
- `docs/superpowers/specs/`：设计与学习目标
- `docs/superpowers/plans/`：分阶段实施计划

## 启动方式

先启动事件接收服务：

```powershell
npm --prefix server run dev
```

再启动前端：

```powershell
npm --prefix frontend run dev
```

浏览器访问 Vite 输出的本地地址。前端通过 Vite 的 `/api` 代理访问 `http://localhost:3001`。

## 核心数据流

```text
Browser / Vue / Router
  -> Collector
  -> track()
  -> Event Queue
  -> Sender
  -> Express API
  -> Event Center
```

监控代码必须安全失败，不能因为采集或上报异常破坏业务主流程。
```

- [ ] **Step 2: 检查 README 命令与实际脚本一致**

Run:

```powershell
Get-Content frontend/package.json
Get-Content server/package.json
```

Expected: `frontend` 与 `server` 都存在 `dev` 脚本，前端存在 `build` 脚本。

- [ ] **Step 3: 提交入口文档**

Run:

```powershell
git add README.md
git commit -m "docs: add monitoring demo entry guide"
```

### Task 4: 启动服务并验证最短闭环

**Files:**
- Verify: `server/src/index.ts`
- Verify: `frontend/vite.config.ts`
- Verify: `frontend/src/app/create-app.ts`
- Verify: `frontend/src/sdk/collectors/performance.ts`
- Verify: `frontend/src/pages/EventCenterPage.vue`

- [ ] **Step 1: 启动 Express 接收服务**

Run in a persistent terminal:

```powershell
npm --prefix server run dev
```

Expected: 输出 `mock server listening on http://localhost:3001`。

- [ ] **Step 2: 验证健康检查接口**

Run:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

Expected:

```text
ok
--
True
```

- [ ] **Step 3: 启动 Vue 前端**

Run in a second persistent terminal:

```powershell
npm --prefix frontend run dev
```

Expected: Vite 输出可访问的本地 URL。

- [ ] **Step 4: 在浏览器触发性能事件**

Manual verification:

```text
1. 打开前端首页并执行一次完整刷新。
2. 等待至少 3 秒，让队列的 flushInterval 触发。
3. 打开“事件中心”并刷新列表。
4. 找到 type=performance、subType=navigation_timing 的事件。
```

Expected: 事件 `payload` 包含 `domContentLoaded`、`loadEvent` 和 `response` 三个数值字段。

- [ ] **Step 5: 交叉验证服务端数据**

Run:

```powershell
$events = Invoke-RestMethod http://localhost:3001/api/events
$events.items | Where-Object { $_.subType -eq 'navigation_timing' } | Select-Object -First 1
```

Expected: 返回的事件包含 `id`、`type`、`subType`、`timestamp`、`url`、`appId`、`sessionId` 和 `payload`。

### Task 5: 完成第一课代码走读与理解验收

**Files:**
- Read: `frontend/src/sdk/collectors/performance.ts`
- Read: `frontend/src/sdk/core/monitor.ts`
- Read: `frontend/src/sdk/core/context.ts`
- Read: `frontend/src/sdk/transport/queue.ts`
- Read: `frontend/src/sdk/transport/sender.ts`
- Read: `server/src/index.ts`

- [ ] **Step 1: 从采集器开始逐行追踪调用**

Trace:

```text
window load
  -> performance.getEntriesByType('navigation')
  -> track('performance', ...)
  -> createMonitorContext(config)
  -> queue.push(event)
  -> flush()
  -> sendEvents(reportUrl, batch)
  -> POST /api/report
  -> eventStore.add(item)
```

Expected: 学习者能指出每一步所在文件，并说明该层只负责什么。

- [ ] **Step 2: 回答三个理解检查题**

Questions:

```text
1. 为什么 collector 不应该直接调用 fetch？
2. 为什么 performance.ts 在 load 事件后读取 navigation entry？
3. 当前 queue 在 sendEvents 失败时为什么可能丢数据？
```

Expected:

```text
1. 统一事件模型、上下文和传输策略，避免每种采集器重复实现上报。
2. loadEventEnd 在 load 完成前可能仍为 0；等待 load 可获得完整导航时序。
3. flush 先 splice 删除批次，再 await 发送；发送失败时没有把批次放回队列。
```

- [ ] **Step 3: 完成口述验收**

Expected: 不看代码，用自己的话说明一条 `navigation_timing` 事件如何从浏览器到达事件中心，并能区分采集、建模、排队、发送、接收和展示六种职责。

### Task 6: 记录第一阶段验证结果

**Files:**
- Create: `docs/learning/01-demo-data-flow.md`

- [ ] **Step 1: 写下学习者自己的数据流复述**

Create `docs/learning/01-demo-data-flow.md` with this structure, replacing each answer with the learner's own words during the lesson:

```markdown
# 第一课：监控事件完整数据流

## 一条性能事件如何产生

记录 `performance.ts` 中信号来源和触发时机。

## 六层职责

分别说明采集、建模、排队、发送、接收和展示。

## 当前实现的三个限制

至少记录指标范围、发送可靠性和生命周期管理三个方面。

## 我的验证证据

记录浏览器事件中心与 `/api/events` 中观察到的事件字段。
```

- [ ] **Step 2: 检查文档不是复制代码注释**

Expected: 每个章节都使用学习者自己的语言，且能回答 Task 5 的三个问题。

- [ ] **Step 3: 提交第一课记录**

Run:

```powershell
git add docs/learning/01-demo-data-flow.md
git commit -m "docs: record monitoring data flow lesson"
```

## 自检结果

- 设计中的阶段 1 目标均有对应任务：源码基线、构建验证、启动闭环、性能采集器走读、数据流复述。
- 本计划没有扩展错误监控、Web Vitals、埋点治理或可靠传输实现；这些属于后续独立阶段。
- 路径、事件名与当前代码一致：`navigation_timing`、`sendEvents`、`/api/report`、`/api/events`。
- 所有验证步骤都有明确命令或可观察结果。

