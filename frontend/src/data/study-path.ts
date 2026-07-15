export interface StudyLabLink {
  label: string
  to: string
  description: string
}

export interface StudyStage {
  id: string
  order: string
  title: string
  goal: string
  summary: string
  keyPoints: string[]
  fileMap: string[]
  labs: StudyLabLink[]
}

export const studyStages: StudyStage[] = [
  {
    id: 'foundation',
    order: '01',
    title: '基础认知',
    goal: '先搞懂监控为什么存在，以及一次完整采集链路是怎么跑起来的。',
    summary:
      '这一阶段只看概念和边界：埋点、监控、日志、告警、分析分别负责什么，PV/UV/Session 这些核心指标怎么理解，浏览器数据如何进入后端。',
    keyPoints: [
      '理解行为、错误、性能三类数据的分工',
      '认清 PV、UV、Session、留存、转化的关系',
      '知道从浏览器采集到服务端分析的完整链路',
    ],
    fileMap: [
      'frontend/src/sdk/core/monitor.ts',
      'frontend/src/sdk/core/context.ts',
      'frontend/src/sdk/types/*',
    ],
    labs: [
      {
        label: '查看事件中心',
        to: '/events',
        description: '先看当前项目已经采到什么，再反推数据结构。',
      },
    ],
  },
  {
    id: 'tracking',
    order: '02',
    title: '业务埋点',
    goal: '理解手动埋点、声明式埋点和曝光埋点，并能把事件模型设计清楚。',
    summary:
      '这一阶段重点是“怎么设计埋点，而不是只会调用 track”。我们会把事件字段、公共属性、业务属性和去重策略串起来。',
    keyPoints: [
      '手动 / 声明式 / 可视化 / 全埋点的适用场景',
      '事件模型字段和类型约束',
      '曝光、点击、提交等常见业务事件',
    ],
    fileMap: [
      'frontend/src/pages/TrackingLabPage.vue',
      'frontend/src/sdk/collectors/click.ts',
      'frontend/src/sdk/collectors/dwell.ts',
      'frontend/src/sdk/types/events.ts',
    ],
    labs: [
      {
        label: '业务埋点实验',
        to: '/tracking',
        description: '通过按钮点击和页面停留演示埋点采集。',
      },
    ],
  },
  {
    id: 'transport',
    order: '03',
    title: '数据上报',
    goal: '理解数据如何可靠、低成本、尽量不阻塞地发出去。',
    summary:
      '这一阶段会把批量上报、队列、重试、页面关闭前兜底这些点串起来，形成“采集到上报”的完整实现思路。',
    keyPoints: [
      '理解 queue / sender 的职责分层',
      '掌握页面生命周期与兜底上报',
      '知道为什么要批量、重试和采样',
    ],
    fileMap: [
      'frontend/src/sdk/transport/queue.ts',
      'frontend/src/sdk/transport/sender.ts',
      'frontend/src/sdk/collectors/route.ts',
    ],
    labs: [
      {
        label: '查看埋点实验',
        to: '/tracking',
        description: '从交互层面感受数据是怎么进入队列的。',
      },
    ],
  },
  {
    id: 'errors',
    order: '04',
    title: '错误与稳定性',
    goal: '把 JS 错误、Promise 异常和资源加载失败纳入统一监控视角。',
    summary:
      '这一阶段的目标不是“报错提醒”，而是知道如何捕获、去重、归因，并把异常和用户上下文拼到一起。',
    keyPoints: [
      'window.onerror 与 unhandledrejection 的区别',
      '资源错误、接口异常和框架级错误的边界',
      '错误指纹、去重和上下文打包',
    ],
    fileMap: [
      'frontend/src/pages/ErrorLabPage.vue',
      'frontend/src/sdk/collectors/error.ts',
      'frontend/src/sdk/collectors/promise.ts',
    ],
    labs: [
      {
        label: '错误实验',
        to: '/errors',
        description: '手动触发三类常见异常，看采集是否生效。',
      },
    ],
  },
  {
    id: 'performance',
    order: '05',
    title: '性能与体验',
    goal: '学会用真实用户数据理解页面加载、网络链路和交互卡顿。',
    summary:
      '这一阶段会把 Performance API、Web Vitals 和慢请求监控放到同一张图里看，帮助你形成“体验监控”的整体认知。',
    keyPoints: [
      'Navigation Timing / Resource Timing / PerformanceObserver',
      'FP、FCP、LCP、CLS、INP 的基本含义',
      '首屏、路由切换和慢资源的区别',
    ],
    fileMap: [
      'frontend/src/pages/PerformanceLabPage.vue',
      'frontend/src/sdk/collectors/performance.ts',
      'frontend/src/sdk/collectors/resource.ts',
    ],
    labs: [
      {
        label: '性能实验',
        to: '/performance',
        description: '观察当前页面基础性能指标。',
      },
    ],
  },
  {
    id: 'governance',
    order: '06',
    title: '平台与工程治理',
    goal: '把 SDK、文档、事件字典和质量治理串成一个可维护系统。',
    summary:
      '这一阶段是从“会写埋点”走向“会维护监控体系”：要考虑版本兼容、插件化、治理和测试。',
    keyPoints: [
      'SDK 插件化和多端适配思路',
      '单元测试与协议兼容',
      '埋点质量、告警降噪和版本治理',
    ],
    fileMap: [
      'frontend/src/sdk/index.ts',
      'frontend/src/sdk/core/monitor.ts',
      'docs/superpowers/plans/study.md',
    ],
    labs: [
      {
        label: '事件中心',
        to: '/events',
        description: '把数据看板当成治理入口，反向检查采集质量。',
      },
    ],
  },
]

export const stageOrder = studyStages.map((stage) => stage.id)

export const findStage = (stageId: string) =>
  studyStages.find((stage) => stage.id === stageId)
