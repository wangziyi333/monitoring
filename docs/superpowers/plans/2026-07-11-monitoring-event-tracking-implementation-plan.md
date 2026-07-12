# 监控与埋点 Demo 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在一天内完成一个基于 `Vue 3 + TypeScript + Express` 的前端监控与埋点教学 Demo，打通“采集 -> 规范化 -> 上报 -> 接收 -> 展示”的完整链路。

**Architecture:** 采用前后端双目录结构：前端负责业务演示页面、监控 SDK、事件展示面板；后端使用轻量 `Express` 提供事件接收与查询接口。监控能力以迷你 SDK 形式封装，先完成手动埋点最小闭环，再逐步补齐错误、行为和性能采集能力。

**Tech Stack:** Vue 3, TypeScript, Vite, Vue Router, Node.js, Express, tsx, ESLint, npm

---

## 文件结构规划

### 前端目录

- `frontend/package.json`
  - 前端工程依赖、脚本命令定义
- `frontend/index.html`
  - Vite 入口 HTML
- `frontend/tsconfig.json`
  - 前端 TypeScript 配置
- `frontend/vite.config.ts`
  - Vite 配置，开发环境代理 `/api`
- `frontend/src/main.ts`
  - 前端启动入口
- `frontend/src/App.vue`
  - Vue 根组件与整体页面骨架
- `frontend/src/app/create-app.ts`
  - 应用装配逻辑：创建 app、注册 router、初始化监控
- `frontend/src/router/index.ts`
  - 路由定义与导出
- `frontend/src/styles/global.css`
  - 全局样式与主题变量
- `frontend/src/pages/HomePage.vue`
  - 首页，介绍监控能力与项目结构
- `frontend/src/pages/ErrorLabPage.vue`
  - 错误演示页
- `frontend/src/pages/TrackingLabPage.vue`
  - 埋点演示页
- `frontend/src/pages/PerformanceLabPage.vue`
  - 性能演示页
- `frontend/src/pages/EventCenterPage.vue`
  - 事件中心页，展示服务端已接收事件
- `frontend/src/components/AppNav.vue`
  - 顶部导航
- `frontend/src/components/DemoCard.vue`
  - 统一展示卡片
- `frontend/src/components/EventTable.vue`
  - 事件列表展示组件
- `frontend/src/components/MetricList.vue`
  - 性能指标列表组件
- `frontend/src/sdk/core/monitor.ts`
  - SDK 主入口，暴露 `initMonitor` 与 `track`
- `frontend/src/sdk/core/context.ts`
  - 公共上下文构建
- `frontend/src/sdk/collectors/error.ts`
  - JS 运行时错误采集
- `frontend/src/sdk/collectors/promise.ts`
  - Promise 异常采集
- `frontend/src/sdk/collectors/resource.ts`
  - 资源加载失败采集
- `frontend/src/sdk/collectors/route.ts`
  - 路由 PV 与路由切换采集
- `frontend/src/sdk/collectors/click.ts`
  - 点击行为采集
- `frontend/src/sdk/collectors/dwell.ts`
  - 页面停留时长采集
- `frontend/src/sdk/collectors/performance.ts`
  - 性能时序采集
- `frontend/src/sdk/transport/queue.ts`
  - 事件队列与批量发送
- `frontend/src/sdk/transport/sender.ts`
  - `fetch` 发送实现
- `frontend/src/sdk/types/events.ts`
  - 监控事件类型定义
- `frontend/src/sdk/types/config.ts`
  - SDK 配置类型定义
- `frontend/src/sdk/utils/id.ts`
  - 事件 ID 与 session ID 生成
- `frontend/src/sdk/utils/dedupe.ts`
  - 简单去重 key 计算
- `frontend/src/sdk/utils/safe-json.ts`
  - 安全序列化工具
- `frontend/src/sdk/index.ts`
  - SDK 对外统一导出
- `frontend/src/api/events.ts`
  - 前端查询事件接口

### 后端目录

- `server/package.json`
  - 后端依赖与脚本
- `server/tsconfig.json`
  - 后端 TypeScript 配置
- `server/src/index.ts`
  - Express 服务入口
- `server/src/store/event-store.ts`
  - 内存事件存储
- `server/src/types.ts`
  - 服务端事件类型

### 文档目录

- `docs/superpowers/specs/2026-07-11-monitoring-event-tracking-design.md`
  - 已确认的设计文档
- `docs/superpowers/plans/2026-07-11-monitoring-event-tracking-implementation-plan.md`
  - 当前实现计划

## Task 1: 初始化项目骨架

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/index.html`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/src/main.ts`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/app/create-app.ts`
- Create: `frontend/src/styles/global.css`
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/index.ts`
- Create: `server/src/store/event-store.ts`
- Create: `server/src/types.ts`

- [ ] **Step 1: 初始化前端工程**

Run:

```bash
npm create vite@latest frontend -- --template vue-ts
```

Expected:

```text
Scaffolding project in .../frontend
Done. Now run:
  cd frontend
  npm install
  npm run dev
```

- [ ] **Step 2: 初始化后端工程目录**

Run:

```bash
mkdir server
cd server
npm init -y
```

Expected:

```text
Wrote to .../server/package.json
```

- [ ] **Step 3: 安装前端依赖**

Run:

```bash
cd frontend
npm install
npm install vue-router
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Expected:

```text
added ... packages
found 0 vulnerabilities
```

- [ ] **Step 4: 安装后端依赖**

Run:

```bash
cd server
npm install express cors
npm install -D typescript tsx @types/node @types/express @types/cors
```

Expected:

```text
added ... packages
found 0 vulnerabilities
```

- [ ] **Step 5: 调整前端入口文件**

Write `frontend/src/main.ts`:

```ts
import { createMonitoringApp } from './app/create-app'
import './styles/global.css'

createMonitoringApp()
```

- [ ] **Step 6: 创建前端装配层**

Write `frontend/src/app/create-app.ts`:

```ts
import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'

export const createMonitoringApp = () => {
  const app = createApp(App)

  app.use(router)
  app.mount('#app')
}
```

- [ ] **Step 7: 创建最小 Express 服务**

Write `server/src/index.ts`:

```ts
import cors from 'cors'
import express from 'express'
import { eventStore } from './store/event-store'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/events', (_req, res) => {
  res.json({ items: eventStore.getAll() })
})

app.post('/api/report', (req, res) => {
  eventStore.add(req.body)
  res.status(201).json({ ok: true })
})

app.listen(port, () => {
  console.log(`mock server listening on http://localhost:${port}`)
})
```

- [ ] **Step 8: 创建内存存储**

Write `server/src/store/event-store.ts`:

```ts
const items: unknown[] = []

export const eventStore = {
  add(item: unknown) {
    items.unshift(item)
  },
  getAll() {
    return items.slice(0, 200)
  },
}
```

- [ ] **Step 9: 验证前端和后端都能启动**

Run:

```bash
cd server
npx tsx src/index.ts
```

Expected:

```text
mock server listening on http://localhost:3001
```

Run:

```bash
cd frontend
npm run dev
```

Expected:

```text
VITE v... ready in ...
Local: http://localhost:5173/
```

- [ ] **Step 10: 提交骨架**

Run:

```bash
git init
git add frontend server docs
git commit -m "feat: bootstrap monitoring demo workspace"
```

## Task 2: 建立路由与页面骨架

**Files:**
- Create: `frontend/src/router/index.ts`
- Create: `frontend/src/pages/HomePage.vue`
- Create: `frontend/src/pages/ErrorLabPage.vue`
- Create: `frontend/src/pages/TrackingLabPage.vue`
- Create: `frontend/src/pages/PerformanceLabPage.vue`
- Create: `frontend/src/pages/EventCenterPage.vue`
- Create: `frontend/src/components/AppNav.vue`
- Create: `frontend/src/components/DemoCard.vue`
- Modify: `frontend/src/App.vue`

- [ ] **Step 1: 定义路由配置**

Write `frontend/src/router/index.ts`:

```ts
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import ErrorLabPage from '../pages/ErrorLabPage.vue'
import TrackingLabPage from '../pages/TrackingLabPage.vue'
import PerformanceLabPage from '../pages/PerformanceLabPage.vue'
import EventCenterPage from '../pages/EventCenterPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/errors', name: 'errors', component: ErrorLabPage },
    { path: '/tracking', name: 'tracking', component: TrackingLabPage },
    { path: '/performance', name: 'performance', component: PerformanceLabPage },
    { path: '/events', name: 'events', component: EventCenterPage },
  ],
})
```

- [ ] **Step 2: 创建根组件布局**

Write `frontend/src/App.vue`:

```vue
<template>
  <div class="app-shell">
    <AppNav />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNav from './components/AppNav.vue'
</script>
```

- [ ] **Step 3: 创建导航组件**

Write `frontend/src/components/AppNav.vue`:

```vue
<template>
  <header class="app-nav">
    <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="nav-link">
      {{ item.label }}
    </RouterLink>
  </header>
</template>

<script setup lang="ts">
const items = [
  { label: '首页', to: '/' },
  { label: '错误实验室', to: '/errors' },
  { label: '埋点实验室', to: '/tracking' },
  { label: '性能实验室', to: '/performance' },
  { label: '事件中心', to: '/events' },
]
</script>
```

- [ ] **Step 4: 创建通用卡片组件**

Write `frontend/src/components/DemoCard.vue`:

```vue
<template>
  <section class="demo-card">
    <h2>{{ title }}</h2>
    <p v-if="description">{{ description }}</p>
    <div class="demo-card__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
```

- [ ] **Step 5: 创建首页**

Write `frontend/src/pages/HomePage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard
      title="前端监控与埋点 Demo"
      description="今天我们会用 Vue 3 + TypeScript 搭出一个带有迷你监控 SDK 的完整演示项目。"
    >
      <ul>
        <li>错误监控：JS、Promise、资源加载失败</li>
        <li>行为埋点：PV、点击、页面停留时长</li>
        <li>性能监控：基础时序与页面加载信息</li>
        <li>上报链路：统一事件结构、队列、批量发送、服务端接收</li>
      </ul>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
</script>
```

- [ ] **Step 6: 创建其余页面骨架**

Write `frontend/src/pages/ErrorLabPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="错误实验室" description="这里会用于触发和观察多种错误类型。">
      <p>下一步我们会在这里接入 JS 错误、Promise 异常和资源加载失败采集。</p>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
</script>
```

Write `frontend/src/pages/TrackingLabPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="埋点实验室" description="这里会用于触发点击、路由访问和停留时长埋点。">
      <p>下一步我们会在这里添加手动埋点按钮与自动点击采集示例。</p>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
</script>
```

Write `frontend/src/pages/PerformanceLabPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="性能实验室" description="这里会展示页面加载与性能采集结果。">
      <p>下一步我们会在这里展示基础性能指标。</p>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
</script>
```

Write `frontend/src/pages/EventCenterPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="事件中心" description="这里会拉取并展示 mock 服务端收到的监控事件。">
      <p>下一步我们会把事件查询接口接进来。</p>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
</script>
```

- [ ] **Step 7: 验证路由骨架**

Run:

```bash
cd frontend
npm run dev
```

Expected:

```text
页面可在 5 个路由之间切换，且没有控制台报错
```

- [ ] **Step 8: 提交页面骨架**

Run:

```bash
git add frontend
git commit -m "feat: add demo pages and router skeleton"
```

## Task 3: 建立统一事件模型与 SDK 最小闭环

**Files:**
- Create: `frontend/src/sdk/types/events.ts`
- Create: `frontend/src/sdk/types/config.ts`
- Create: `frontend/src/sdk/utils/id.ts`
- Create: `frontend/src/sdk/utils/safe-json.ts`
- Create: `frontend/src/sdk/core/context.ts`
- Create: `frontend/src/sdk/transport/sender.ts`
- Create: `frontend/src/sdk/transport/queue.ts`
- Create: `frontend/src/sdk/core/monitor.ts`
- Create: `frontend/src/sdk/index.ts`
- Modify: `frontend/src/app/create-app.ts`
- Modify: `frontend/src/pages/TrackingLabPage.vue`

- [ ] **Step 1: 定义事件类型**

Write `frontend/src/sdk/types/events.ts`:

```ts
export type MonitorEventType = 'error' | 'performance' | 'behavior' | 'custom'

export interface MonitorEvent<TPayload = Record<string, unknown>> {
  id: string
  type: MonitorEventType
  subType: string
  name: string
  timestamp: number
  url: string
  appId: string
  sessionId: string
  payload: TPayload
}
```

Write `frontend/src/sdk/types/config.ts`:

```ts
export interface MonitorConfig {
  appId: string
  reportUrl: string
  batchSize?: number
  flushInterval?: number
}
```

- [ ] **Step 2: 创建 ID 工具**

Write `frontend/src/sdk/utils/id.ts`:

```ts
export const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

export const createSessionId = () => {
  const key = 'monitoring-demo-session-id'
  const current = sessionStorage.getItem(key)

  if (current) {
    return current
  }

  const next = createId()
  sessionStorage.setItem(key, next)
  return next
}
```

- [ ] **Step 3: 创建安全序列化工具**

Write `frontend/src/sdk/utils/safe-json.ts`:

```ts
export const toSafeObject = (value: unknown): Record<string, unknown> => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack ?? '',
    }
  }

  if (typeof value === 'object' && value !== null) {
    return value as Record<string, unknown>
  }

  return { value }
}
```

- [ ] **Step 4: 创建上下文构建器**

Write `frontend/src/sdk/core/context.ts`:

```ts
import type { MonitorConfig } from '../types/config'
import { createSessionId } from '../utils/id'

export interface MonitorContext {
  appId: string
  sessionId: string
  url: string
}

export const createMonitorContext = (config: MonitorConfig): MonitorContext => ({
  appId: config.appId,
  sessionId: createSessionId(),
  url: window.location.href,
})
```

- [ ] **Step 5: 创建发送器**

Write `frontend/src/sdk/transport/sender.ts`:

```ts
import type { MonitorEvent } from '../types/events'

export const sendEvents = async (reportUrl: string, events: MonitorEvent[]) => {
  const response = await fetch(reportUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: events }),
  })

  if (!response.ok) {
    throw new Error(`report failed with status ${response.status}`)
  }
}
```

- [ ] **Step 6: 创建队列**

Write `frontend/src/sdk/transport/queue.ts`:

```ts
import type { MonitorConfig } from '../types/config'
import type { MonitorEvent } from '../types/events'
import { sendEvents } from './sender'

export const createEventQueue = (config: MonitorConfig) => {
  const items: MonitorEvent[] = []
  const batchSize = config.batchSize ?? 5

  const flush = async () => {
    if (items.length === 0) {
      return
    }

    const batch = items.splice(0, batchSize)
    await sendEvents(config.reportUrl, batch)
  }

  return {
    push(event: MonitorEvent) {
      items.push(event)

      if (items.length >= batchSize) {
        void flush()
      }
    },
    flush,
  }
}
```

- [ ] **Step 7: 创建监控主入口**

Write `frontend/src/sdk/core/monitor.ts`:

```ts
import type { MonitorConfig } from '../types/config'
import type { MonitorEvent, MonitorEventType } from '../types/events'
import { createMonitorContext } from './context'
import { createEventQueue } from '../transport/queue'
import { createId } from '../utils/id'

let queue: ReturnType<typeof createEventQueue> | null = null
let currentConfig: MonitorConfig | null = null

export const initMonitor = (config: MonitorConfig) => {
  currentConfig = config
  queue = createEventQueue(config)
}

export const track = (
  type: MonitorEventType,
  subType: string,
  name: string,
  payload: Record<string, unknown> = {},
) => {
  if (!currentConfig || !queue) {
    return
  }

  const context = createMonitorContext(currentConfig)

  const event: MonitorEvent = {
    id: createId(),
    type,
    subType,
    name,
    timestamp: Date.now(),
    url: context.url,
    appId: context.appId,
    sessionId: context.sessionId,
    payload,
  }

  queue.push(event)
}
```

Write `frontend/src/sdk/index.ts`:

```ts
export { initMonitor, track } from './core/monitor'
```

- [ ] **Step 8: 在应用启动时初始化 SDK**

Modify `frontend/src/app/create-app.ts`:

```ts
import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'
import { initMonitor } from '../sdk'

export const createMonitoringApp = () => {
  initMonitor({
    appId: 'monitoring-event-tracking-demo',
    reportUrl: 'http://localhost:3001/api/report',
    batchSize: 3,
  })

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}
```

- [ ] **Step 9: 在埋点页面加入手动埋点按钮**

Modify `frontend/src/pages/TrackingLabPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="埋点实验室" description="这里会用于触发点击、路由访问和停留时长埋点。">
      <button @click="handleTrackClick">触发手动埋点</button>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
import { track } from '../sdk'

const handleTrackClick = () => {
  track('custom', 'manual_track', 'manual_button_click', {
    label: 'tracking-lab-manual-button',
  })
}
</script>
```

- [ ] **Step 10: 调整服务端接收批量事件**

Modify `server/src/index.ts`:

```ts
import cors from 'cors'
import express from 'express'
import { eventStore } from './store/event-store'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/events', (_req, res) => {
  res.json({ items: eventStore.getAll() })
})

app.post('/api/report', (req, res) => {
  const payload = req.body as { items?: unknown[] }
  const items = Array.isArray(payload.items) ? payload.items : []

  items.forEach((item) => eventStore.add(item))

  res.status(201).json({ ok: true, count: items.length })
})

app.listen(port, () => {
  console.log(`mock server listening on http://localhost:${port}`)
})
```

- [ ] **Step 11: 验证最小闭环**

Run:

```bash
cd server
npx tsx src/index.ts
```

Run:

```bash
cd frontend
npm run dev
```

Manual verification:

```text
打开 /tracking 页面，点击“触发手动埋点”，服务端控制台无报错，请求返回 201
```

- [ ] **Step 12: 提交 SDK 最小闭环**

Run:

```bash
git add frontend server
git commit -m "feat: add monitor sdk minimal reporting flow"
```

## Task 4: 建立事件查询与事件中心页

**Files:**
- Create: `frontend/src/api/events.ts`
- Create: `frontend/src/components/EventTable.vue`
- Modify: `frontend/src/pages/EventCenterPage.vue`

- [ ] **Step 1: 创建查询事件接口**

Write `frontend/src/api/events.ts`:

```ts
import type { MonitorEvent } from '../sdk/types/events'

export interface EventListResponse {
  items: MonitorEvent[]
}

export const fetchEvents = async () => {
  const response = await fetch('http://localhost:3001/api/events')

  if (!response.ok) {
    throw new Error(`fetch events failed with status ${response.status}`)
  }

  return (await response.json()) as EventListResponse
}
```

- [ ] **Step 2: 创建事件表格组件**

Write `frontend/src/components/EventTable.vue`:

```vue
<template>
  <div v-if="items.length === 0">暂时还没有事件，请先去其他页面触发一些行为。</div>
  <table v-else class="event-table">
    <thead>
      <tr>
        <th>时间</th>
        <th>类型</th>
        <th>子类型</th>
        <th>名称</th>
        <th>页面</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ new Date(item.timestamp).toLocaleTimeString() }}</td>
        <td>{{ item.type }}</td>
        <td>{{ item.subType }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.url }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { MonitorEvent } from '../sdk/types/events'

defineProps<{
  items: MonitorEvent[]
}>()
</script>
```

- [ ] **Step 3: 接入事件中心页**

Write `frontend/src/pages/EventCenterPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="事件中心" description="这里会展示 mock 服务已接收的监控事件。">
      <button @click="loadEvents" :disabled="loading">
        {{ loading ? '加载中...' : '刷新事件列表' }}
      </button>
      <p v-if="errorMessage">{{ errorMessage }}</p>
      <EventTable :items="items" />
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DemoCard from '../components/DemoCard.vue'
import EventTable from '../components/EventTable.vue'
import { fetchEvents } from '../api/events'
import type { MonitorEvent } from '../sdk/types/events'

const items = ref<MonitorEvent[]>([])
const loading = ref(false)
const errorMessage = ref('')

const loadEvents = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchEvents()
    items.value = response.items
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载事件失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadEvents()
})
</script>
```

- [ ] **Step 4: 验证事件中心页**

Manual verification:

```text
先在 /tracking 页面触发手动埋点，再打开 /events 页面，应能看到对应事件记录
```

- [ ] **Step 5: 提交事件中心能力**

Run:

```bash
git add frontend
git commit -m "feat: add event center page"
```

## Task 5: 接入路由 PV 与路由切换采集

**Files:**
- Create: `frontend/src/sdk/collectors/route.ts`
- Modify: `frontend/src/sdk/core/monitor.ts`
- Modify: `frontend/src/app/create-app.ts`

- [ ] **Step 1: 创建路由采集器**

Write `frontend/src/sdk/collectors/route.ts`:

```ts
import type { Router } from 'vue-router'
import { track } from '../core/monitor'

export const registerRouteCollector = (router: Router) => {
  router.afterEach((to, from) => {
    track('behavior', 'page_view', 'route_page_view', {
      to: to.fullPath,
      from: from.fullPath,
    })
  })
}
```

- [ ] **Step 2: 在应用启动时注册路由采集**

Modify `frontend/src/app/create-app.ts`:

```ts
import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'
import { initMonitor } from '../sdk'
import { registerRouteCollector } from '../sdk/collectors/route'

export const createMonitoringApp = () => {
  initMonitor({
    appId: 'monitoring-event-tracking-demo',
    reportUrl: 'http://localhost:3001/api/report',
    batchSize: 3,
  })

  registerRouteCollector(router)

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}
```

- [ ] **Step 3: 验证路由采集**

Manual verification:

```text
在不同页面之间切换，然后到 /events 页面刷新，应出现 subType 为 page_view 的事件
```

- [ ] **Step 4: 提交路由采集**

Run:

```bash
git add frontend
git commit -m "feat: add route page view collector"
```

## Task 6: 接入错误采集器

**Files:**
- Create: `frontend/src/sdk/collectors/error.ts`
- Create: `frontend/src/sdk/collectors/promise.ts`
- Create: `frontend/src/sdk/collectors/resource.ts`
- Modify: `frontend/src/sdk/core/monitor.ts`
- Modify: `frontend/src/app/create-app.ts`
- Modify: `frontend/src/pages/ErrorLabPage.vue`

- [ ] **Step 1: 创建 JS 错误采集器**

Write `frontend/src/sdk/collectors/error.ts`:

```ts
import { track } from '../core/monitor'

export const registerErrorCollector = () => {
  window.addEventListener('error', (event) => {
    const target = event.target

    if (target instanceof HTMLScriptElement || target instanceof HTMLImageElement || target instanceof HTMLLinkElement) {
      return
    }

    track('error', 'js_error', 'window_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })
}
```

- [ ] **Step 2: 创建 Promise 异常采集器**

Write `frontend/src/sdk/collectors/promise.ts`:

```ts
import { track } from '../core/monitor'
import { toSafeObject } from '../utils/safe-json'

export const registerPromiseCollector = () => {
  window.addEventListener('unhandledrejection', (event) => {
    track('error', 'promise_error', 'unhandled_rejection', {
      reason: toSafeObject(event.reason),
    })
  })
}
```

- [ ] **Step 3: 创建资源错误采集器**

Write `frontend/src/sdk/collectors/resource.ts`:

```ts
import { track } from '../core/monitor'

export const registerResourceCollector = () => {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target

      if (!(target instanceof HTMLScriptElement || target instanceof HTMLImageElement || target instanceof HTMLLinkElement)) {
        return
      }

      track('error', 'resource_error', 'resource_load_failed', {
        tagName: target.tagName,
        source: target.getAttribute('src') ?? target.getAttribute('href') ?? '',
      })
    },
    true,
  )
}
```

- [ ] **Step 4: 在启动时注册错误采集器**

Modify `frontend/src/app/create-app.ts`:

```ts
import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'
import { initMonitor } from '../sdk'
import { registerErrorCollector } from '../sdk/collectors/error'
import { registerPromiseCollector } from '../sdk/collectors/promise'
import { registerResourceCollector } from '../sdk/collectors/resource'
import { registerRouteCollector } from '../sdk/collectors/route'

export const createMonitoringApp = () => {
  initMonitor({
    appId: 'monitoring-event-tracking-demo',
    reportUrl: 'http://localhost:3001/api/report',
    batchSize: 3,
  })

  registerErrorCollector()
  registerPromiseCollector()
  registerResourceCollector()
  registerRouteCollector(router)

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}
```

- [ ] **Step 5: 提供错误触发按钮**

Write `frontend/src/pages/ErrorLabPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="错误实验室" description="这里会用于触发和观察多种错误类型。">
      <div class="button-row">
        <button @click="throwJsError">触发 JS 错误</button>
        <button @click="triggerPromiseError">触发 Promise 异常</button>
        <button @click="triggerResourceError">触发资源加载失败</button>
      </div>
      <img v-if="showBrokenImage" src="/not-found-monitoring-demo.png" alt="broken resource demo" />
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoCard from '../components/DemoCard.vue'

const showBrokenImage = ref(false)

const throwJsError = () => {
  throw new Error('这是一个用于监控演示的 JS 错误')
}

const triggerPromiseError = () => {
  Promise.reject(new Error('这是一个未被捕获的 Promise 异常'))
}

const triggerResourceError = () => {
  showBrokenImage.value = false
  requestAnimationFrame(() => {
    showBrokenImage.value = true
  })
}
</script>
```

- [ ] **Step 6: 验证错误采集**

Manual verification:

```text
依次触发 3 类错误，然后到 /events 页面刷新，应能看到 js_error、promise_error、resource_error 事件
```

- [ ] **Step 7: 提交错误采集**

Run:

```bash
git add frontend
git commit -m "feat: add error collectors"
```

## Task 7: 接入点击埋点与停留时长采集

**Files:**
- Create: `frontend/src/sdk/collectors/click.ts`
- Create: `frontend/src/sdk/collectors/dwell.ts`
- Modify: `frontend/src/app/create-app.ts`
- Modify: `frontend/src/pages/TrackingLabPage.vue`

- [ ] **Step 1: 创建点击采集器**

Write `frontend/src/sdk/collectors/click.ts`:

```ts
import { track } from '../core/monitor'

export const registerClickCollector = () => {
  document.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof HTMLElement)) {
      return
    }

    const content = target.innerText?.trim().slice(0, 50) ?? ''

    track('behavior', 'click', 'document_click', {
      tagName: target.tagName,
      text: content,
      className: target.className,
    })
  })
}
```

- [ ] **Step 2: 创建停留时长采集器**

Write `frontend/src/sdk/collectors/dwell.ts`:

```ts
import type { Router } from 'vue-router'
import { track } from '../core/monitor'

export const registerDwellCollector = (router: Router) => {
  let enterAt = Date.now()
  let currentPath = router.currentRoute.value.fullPath

  router.afterEach((to) => {
    const leaveAt = Date.now()

    track('behavior', 'page_dwell', 'page_dwell_duration', {
      path: currentPath,
      duration: leaveAt - enterAt,
    })

    currentPath = to.fullPath
    enterAt = Date.now()
  })
}
```

- [ ] **Step 3: 注册点击和停留采集器**

Modify `frontend/src/app/create-app.ts`:

```ts
import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'
import { initMonitor } from '../sdk'
import { registerClickCollector } from '../sdk/collectors/click'
import { registerDwellCollector } from '../sdk/collectors/dwell'
import { registerErrorCollector } from '../sdk/collectors/error'
import { registerPromiseCollector } from '../sdk/collectors/promise'
import { registerResourceCollector } from '../sdk/collectors/resource'
import { registerRouteCollector } from '../sdk/collectors/route'

export const createMonitoringApp = () => {
  initMonitor({
    appId: 'monitoring-event-tracking-demo',
    reportUrl: 'http://localhost:3001/api/report',
    batchSize: 3,
  })

  registerErrorCollector()
  registerPromiseCollector()
  registerResourceCollector()
  registerRouteCollector(router)
  registerClickCollector()
  registerDwellCollector(router)

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}
```

- [ ] **Step 4: 扩充埋点实验室交互**

Write `frontend/src/pages/TrackingLabPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="埋点实验室" description="这里会用于触发点击、路由访问和停留时长埋点。">
      <div class="button-row">
        <button @click="handleTrackClick">触发手动埋点</button>
        <button data-track="buy-now">模拟立即购买</button>
        <button data-track="collect">模拟收藏商品</button>
      </div>
      <p>你在页面间切换时，会自动产生页面访问与停留时长事件。</p>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
import { track } from '../sdk'

const handleTrackClick = () => {
  track('custom', 'manual_track', 'manual_button_click', {
    label: 'tracking-lab-manual-button',
  })
}
</script>
```

- [ ] **Step 5: 验证行为采集**

Manual verification:

```text
点击多个按钮并在页面间切换，再到 /events 页面刷新，应看到 click、page_view、page_dwell、manual_track 等事件
```

- [ ] **Step 6: 提交行为采集**

Run:

```bash
git add frontend
git commit -m "feat: add behavior collectors"
```

## Task 8: 接入性能采集

**Files:**
- Create: `frontend/src/sdk/collectors/performance.ts`
- Create: `frontend/src/components/MetricList.vue`
- Modify: `frontend/src/app/create-app.ts`
- Modify: `frontend/src/pages/PerformanceLabPage.vue`

- [ ] **Step 1: 创建性能采集器**

Write `frontend/src/sdk/collectors/performance.ts`:

```ts
import { track } from '../core/monitor'

export const registerPerformanceCollector = () => {
  window.addEventListener('load', () => {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined

    if (!navigationEntry) {
      return
    }

    track('performance', 'navigation_timing', 'page_navigation_timing', {
      domContentLoaded:
        navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
      loadEvent:
        navigationEntry.loadEventEnd - navigationEntry.startTime,
      response:
        navigationEntry.responseEnd - navigationEntry.requestStart,
    })
  })
}
```

- [ ] **Step 2: 注册性能采集器**

Modify `frontend/src/app/create-app.ts`:

```ts
import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'
import { initMonitor } from '../sdk'
import { registerClickCollector } from '../sdk/collectors/click'
import { registerDwellCollector } from '../sdk/collectors/dwell'
import { registerErrorCollector } from '../sdk/collectors/error'
import { registerPerformanceCollector } from '../sdk/collectors/performance'
import { registerPromiseCollector } from '../sdk/collectors/promise'
import { registerResourceCollector } from '../sdk/collectors/resource'
import { registerRouteCollector } from '../sdk/collectors/route'

export const createMonitoringApp = () => {
  initMonitor({
    appId: 'monitoring-event-tracking-demo',
    reportUrl: 'http://localhost:3001/api/report',
    batchSize: 3,
  })

  registerErrorCollector()
  registerPromiseCollector()
  registerResourceCollector()
  registerRouteCollector(router)
  registerClickCollector()
  registerDwellCollector(router)
  registerPerformanceCollector()

  const app = createApp(App)
  app.use(router)
  app.mount('#app')
}
```

- [ ] **Step 3: 创建性能展示组件**

Write `frontend/src/components/MetricList.vue`:

```vue
<template>
  <ul class="metric-list">
    <li v-for="item in items" :key="item.label">
      <strong>{{ item.label }}：</strong>{{ item.value }}
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; value: string }>
}>()
</script>
```

- [ ] **Step 4: 在性能页展示浏览器时序**

Write `frontend/src/pages/PerformanceLabPage.vue`:

```vue
<template>
  <div class="page-grid">
    <DemoCard title="性能实验室" description="这里会展示当前页面的基础性能时序信息。">
      <MetricList :items="items" />
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DemoCard from '../components/DemoCard.vue'
import MetricList from '../components/MetricList.vue'

const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined

const items = computed(() => {
  if (!navigationEntry) {
    return [{ label: '提示', value: '当前浏览器未提供 navigation timing 数据' }]
  }

  return [
    {
      label: 'DOMContentLoaded',
      value: `${Math.round(navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime)} ms`,
    },
    {
      label: 'Load Event',
      value: `${Math.round(navigationEntry.loadEventEnd - navigationEntry.startTime)} ms`,
    },
    {
      label: 'Response',
      value: `${Math.round(navigationEntry.responseEnd - navigationEntry.requestStart)} ms`,
    },
  ]
})
</script>
```

- [ ] **Step 5: 验证性能采集**

Manual verification:

```text
刷新页面后进入 /events，应能看到 subType 为 navigation_timing 的性能事件
```

- [ ] **Step 6: 提交性能采集**

Run:

```bash
git add frontend
git commit -m "feat: add performance collector"
```

## Task 9: 补充样式与演示体验

**Files:**
- Modify: `frontend/src/styles/global.css`
- Modify: `frontend/src/components/AppNav.vue`
- Modify: `frontend/src/components/DemoCard.vue`
- Modify: `frontend/src/components/EventTable.vue`

- [ ] **Step 1: 定义全局样式基础**

Write `frontend/src/styles/global.css`:

```css
:root {
  color-scheme: light;
  --bg: #f2efe8;
  --panel: rgba(255, 252, 245, 0.9);
  --line: #d8cfbf;
  --text: #1d2a33;
  --muted: #59656f;
  --accent: #c65d2e;
  --accent-dark: #8e3f1f;
  --shadow: 0 20px 60px rgba(76, 55, 34, 0.12);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', 'PingFang SC', sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(198, 93, 46, 0.18), transparent 30%),
    linear-gradient(180deg, #f7f4ed 0%, #efe8da 100%);
}

button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}

button:hover {
  background: var(--accent-dark);
}

.app-shell {
  min-height: 100vh;
}

.app-main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px;
}

.app-nav {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  position: sticky;
  top: 0;
  backdrop-filter: blur(16px);
  background: rgba(247, 244, 237, 0.75);
  border-bottom: 1px solid rgba(216, 207, 191, 0.8);
}

.nav-link {
  text-decoration: none;
  color: var(--text);
  padding: 10px 14px;
  border-radius: 999px;
}

.nav-link.router-link-active {
  background: rgba(198, 93, 46, 0.12);
  color: var(--accent-dark);
}

.page-grid {
  display: grid;
  gap: 20px;
}

.demo-card {
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--panel);
  box-shadow: var(--shadow);
}

.demo-card__body {
  margin-top: 16px;
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.event-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.event-table th,
.event-table td {
  padding: 12px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}

.metric-list {
  padding-left: 18px;
}
```

- [ ] **Step 2: 验证展示效果**

Manual verification:

```text
页面应在桌面端和移动端都能正常显示，导航、卡片、表格布局清晰，没有明显样式错位
```

- [ ] **Step 3: 提交样式优化**

Run:

```bash
git add frontend
git commit -m "style: polish demo interface"
```

## Task 10: 最终联调与验收

**Files:**
- Modify: `frontend/src/sdk/transport/queue.ts`
- Modify: `server/src/index.ts`
- Modify: `docs/superpowers/specs/2026-07-11-monitoring-event-tracking-design.md`

- [ ] **Step 1: 为队列添加定时 flush**

Modify `frontend/src/sdk/transport/queue.ts`:

```ts
import type { MonitorConfig } from '../types/config'
import type { MonitorEvent } from '../types/events'
import { sendEvents } from './sender'

export const createEventQueue = (config: MonitorConfig) => {
  const items: MonitorEvent[] = []
  const batchSize = config.batchSize ?? 5
  const flushInterval = config.flushInterval ?? 5000

  const flush = async () => {
    if (items.length === 0) {
      return
    }

    const batch = items.splice(0, batchSize)
    await sendEvents(config.reportUrl, batch)
  }

  window.setInterval(() => {
    void flush()
  }, flushInterval)

  return {
    push(event: MonitorEvent) {
      items.push(event)

      if (items.length >= batchSize) {
        void flush()
      }
    },
    flush,
  }
}
```

- [ ] **Step 2: 为服务端补充清空接口，便于重复演示**

Modify `server/src/index.ts`:

```ts
import cors from 'cors'
import express from 'express'
import { eventStore } from './store/event-store'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/events', (_req, res) => {
  res.json({ items: eventStore.getAll() })
})

app.delete('/api/events', (_req, res) => {
  eventStore.clear()
  res.json({ ok: true })
})

app.post('/api/report', (req, res) => {
  const payload = req.body as { items?: unknown[] }
  const items = Array.isArray(payload.items) ? payload.items : []

  items.forEach((item) => eventStore.add(item))

  res.status(201).json({ ok: true, count: items.length })
})

app.listen(port, () => {
  console.log(`mock server listening on http://localhost:${port}`)
})
```

Modify `server/src/store/event-store.ts`:

```ts
const items: unknown[] = []

export const eventStore = {
  add(item: unknown) {
    items.unshift(item)
  },
  clear() {
    items.length = 0
  },
  getAll() {
    return items.slice(0, 200)
  },
}
```

- [ ] **Step 3: 更新设计文档中的“已实现状态”说明**

Append to `docs/superpowers/specs/2026-07-11-monitoring-event-tracking-design.md`:

```md
## 十三、实现完成后的复盘建议

- 回顾哪些能力是“采集器”负责，哪些能力是“传输层”负责
- 回顾统一事件模型为什么比散乱字段更容易扩展
- 回顾今天为了在一天内完成而主动砍掉了哪些范围
```

- [ ] **Step 4: 执行最终验证**

Run:

```bash
cd server
npx tsx src/index.ts
```

Run:

```bash
cd frontend
npm run dev
```

Manual verification checklist:

```text
1. 首页正常打开
2. 路由切换会产生 page_view 事件
3. 埋点页按钮点击会产生 click 与 manual_track 事件
4. 页面切换会产生 page_dwell 事件
5. 错误页 3 个按钮可产生 3 类错误事件
6. 刷新页面后可看到性能事件
7. 事件中心页能展示服务端已接收数据
```

- [ ] **Step 5: 提交最终版本**

Run:

```bash
git add frontend server docs
git commit -m "feat: complete monitoring and tracking demo"
```

## 自检结果

### 1. Spec 覆盖情况

- 业务演示应用：由 Task 2、Task 4、Task 6、Task 7、Task 8、Task 9 覆盖
- 迷你监控 SDK：由 Task 3、Task 5、Task 6、Task 7、Task 8、Task 10 覆盖
- Express mock 接收端：由 Task 1、Task 3、Task 10 覆盖
- 统一事件模型：由 Task 3 覆盖
- 错误、行为、性能监控：分别由 Task 5-8 覆盖
- 事件展示与演示体验：由 Task 4、Task 9、Task 10 覆盖

### 2. 占位符扫描

本计划未使用 `TBD`、`TODO`、`implement later` 等占位描述。所有任务均给出明确文件路径、代码片段或命令。

### 3. 类型与命名一致性

- 统一使用 `MonitorEvent`、`MonitorConfig`、`initMonitor`、`track`
- 前端上报协议统一为 `POST /api/report`，请求体为 `{ items: MonitorEvent[] }`
- 事件查询接口统一为 `GET /api/events`
