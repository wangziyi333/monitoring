# 前端监控与埋点学习笔记

> 项目：`Monitoring&EventTracking`  
> 目标：把这次围绕当前项目完成的监控、埋点、SDK、性能、白屏、rrweb 回放学习内容沉淀成一份可复盘笔记。

## 1. 这次我们到底学了什么

这次学习不是单独学“怎么发一个埋点请求”，而是把一个前端监控系统从前到后走了一遍。我们已经覆盖了：

- 事件协议设计
- TypeScript 强类型事件约束
- 手动埋点
- 声明式埋点
- 可视化埋点
- `selector` 漂移风险
- 动态列表与业务字段
- 白名单字段提取
- 点击、曝光、加购、下载等事件
- `fetch`、`sendBeacon`、`image` 三种上报思路
- Event Bus 统一订阅发布
- 性能指标与 `web-vitals`
- 白屏检测
- `rrweb` 录制、保留、上传、回放
- 标准监控事件转 rrweb custom event
- Dashboard 与 Replay 详情页联动

也就是说，这个项目现在已经具备了一个“教学版前端监控平台”的骨架。

---

## 2. 当前项目的整体结构

这个项目可以分成四层：

### 2.1 采集层

负责发现页面上的行为、异常、性能和回放信号。

典型文件：

- `frontend/src/sdk/collectors/click.ts`
- `frontend/src/sdk/collectors/exposure.ts`
- `frontend/src/sdk/collectors/performance.ts`
- `frontend/src/sdk/collectors/web-vitals.ts`
- `frontend/src/sdk/collectors/blank-screen.ts`

### 2.2 标准化层

负责把各种来源不同的信号，整理成统一的监控事件格式。

典型文件：

- `frontend/src/sdk/types/events.ts`
- `frontend/src/sdk/core/monitor.ts`

### 2.3 传输层

负责把事件放进队列、批量发送、兜底发送。

典型文件：

- `frontend/src/sdk/transport/queue.ts`
- `frontend/src/sdk/transport/sender.ts`

### 2.4 展示与存储层

负责后端接收、内存存储、Dashboard 展示、Replay 详情回放。

典型文件：

- `server/src/index.ts`
- `frontend/src/pages/DashboardPage.vue`
- `frontend/src/pages/ReplayDetailPage.vue`

---

## 3. 事件协议为什么是第一步

真正的监控系统，最先要解决的不是“怎么采”，而是“采出来的数据长什么样”。

我们在 [events.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/types/events.ts:1) 里做了三件关键事情：

- 用 `MonitorEventProtocol` 约束每个事件名对应的 `type`、`subType` 和 `payload`
- 用 `MonitorEventDefinition` 固化“事件定义对象”
- 用 `TrackEventArgs` 让 `trackEvent()` 在调用时自动校验 payload 类型

这一步的价值是：

- 防止事件名拼错
- 防止 payload 字段乱传
- 防止“同名事件不同结构”
- 让埋点文档可以直接映射到代码协议

一句话说，事件协议决定了后面所有 collector、queue、transport、dashboard 能不能稳定协作。

---

## 4. 手动埋点、声明式埋点、可视化埋点

### 4.1 手动埋点

手动埋点就是业务代码在最清楚语义的位置直接调用 `trackEvent()`。

它最准确，因为开发者最清楚“这个动作到底代表什么业务行为”。

适合：

- 加购
- 提交
- 下载
- 领券
- 支付

### 4.2 声明式埋点

声明式埋点是在 DOM 上提前写好标识，例如 `data-track`、`data-product-id`、`data-position`，采集器在点击时去读。

它比纯手动埋点更轻，也保留了业务语义。

适合：

- 商品卡片按钮
- 活动位按钮
- 运营位交互

### 4.3 可视化埋点

可视化埋点是通过配置去匹配页面元素，不一定要业务代码里手动写事件逻辑。

当前项目里支持两种模式：

- `selector`
- `track_key`

其中 `track_key` 更稳，因为它依赖开发者预埋的稳定锚点；`selector` 更快，但更容易漂移。

---

## 5. selector 漂移为什么危险

我们已经重点学过：`selector` 最大的风险不是“匹配不到”，而是“还能匹配到，但匹配错了”。

例如原来配置的是：

```css
.product-actions > button:nth-child(1)
```

它表达的是“第一个按钮”，不是“购买按钮”。只要页面改版、顺序一换，配置仍然命中，但业务语义已经变了。

这就是静默误报：

- SDK 不报错
- 请求正常发
- 后台也有数据
- 但统计对象已经错了

所以结论是：

- 核心业务按钮不要长期依赖纯 `selector`
- 长期稳定场景优先 `track_key`
- 更稳的是“DOM 锚点 + 业务字段”

---

## 6. 动态列表为什么必须带业务字段

动态列表里最容易出现“很多 DOM 长得一样，但业务对象不一样”的情况。

例如商品卡片里的“立即购买”按钮，结构上都一样，但业务上对应的是不同商品。

这时：

- `selector` 只能回答“点了哪个元素”
- `track_key` 只能回答“命中了哪类元素”
- 真正缺少的是“这个元素背后的业务身份是谁”

所以我们把动态列表升级成了：

- 稳定锚点负责“找谁”
- 业务字段负责“它是谁”

常见业务字段：

- `productId`
- `productName`
- `position`
- `moduleId`
- `bannerId`
- `skuId`

这个思想已经在当前商城页里落下来了。

---

## 7. 什么是白名单字段提取

白名单字段提取，意思是：

只允许 SDK 从 DOM、dataset 或业务对象里提取“提前约定好的少数字段”，而不是把所有字段一股脑全带走。

例如当前项目里更合理的做法是只提取：

- `productId`
- `productName`
- `position`

而不是把整个 `dataset`、整个元素文本、所有自定义属性都上传。

这样做的原因：

- 避免脏数据
- 避免敏感信息误采
- 避免字段无限膨胀
- 避免后端和报表口径越来越乱

不是白名单提取的典型坏例子：

- `payload: { ...element.dataset }`
- `payload: JSON.parse(JSON.stringify(item))`
- 把整个表单值对象原样上报

白名单提取的本质不是“少传点”，而是“只传业务认可、协议允许、分析真正需要的数据”。

---

## 8. MonitorEvent 是什么

`MonitorEvent` 可以理解成“真正准备进入传输层和存储层的标准事件对象”。

在 [monitor.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/core/monitor.ts:1) 里，`createMonitorEvent()` 会把原始请求标准化成统一结构：

- `id`
- `type`
- `subType`
- `name`
- `timestamp`
- `url`
- `appId`
- `sessionId`
- `replayId`
- `payload`

所以你之前理解得对：

`MonitorEvent` 就很像“上报前的标准化产物”。

采集器采到的是局部信息，`MonitorEvent` 才是整个系统统一认的正式数据格式。

---

## 9. Event Bus 在当前项目里解决了什么

Event Bus 不是为了“炫技”，而是为了把 SDK 内部不同模块解耦。

当前项目里它的核心作用是：

- collector 只负责发布信号
- resolver 只负责解释信号
- monitor 只负责标准化和入队
- replay timeline 只负责订阅正式事件

核心文件是 [event-bus.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/core/event-bus.ts:1)。

它提供了三个能力：

- `onMonitorBusEvent()`
- `offMonitorBusEvent()`
- `emitMonitorBusEvent()`

### 9.1 当前项目里最关键的几类 bus 事件

- `dom:click`
- `track:click:resolved`
- `dom:exposure:enter`
- `dom:exposure:leave`
- `dom:blank-screen:detected`
- `monitor:event`
- `monitor:event:queued`

### 9.2 为什么 `monitor:event` 和 `monitor:event:queued` 要分开

它们虽然都和正式监控事件有关，但职责不同。

`monitor:event` 表示：

“这里有一条待标准化/待入队的监控请求。”

它携带的是：

- `definition`
- `payload`

`monitor:event:queued` 表示：

“这条请求已经被 `createMonitorEvent()` 标准化，并且已经成功放进队列了。”

它携带的是完整 `event`。

因此 replay timeline 订阅的是 `monitor:event:queued`，不是 `monitor:event`。因为 replay 需要的是完整正式事件，而不是半成品请求。

---

## 10. 当前项目里的完整事件流

这是本项目最重要的一条主线。

### 10.1 普通监控事件流

```text
用户行为 / 页面异常 / 性能信号
  -> collector 采集
  -> emitMonitorBusEvent(...)
  -> resolver 解析
  -> emit 'monitor:event'
  -> monitor.ts createMonitorEvent()
  -> queue.push(event)
  -> emit 'monitor:event:queued'
  -> sender 发往后端
  -> server /api/report 接收
  -> eventStore 保存
  -> Dashboard / Events 页面展示
```

### 10.2 rrweb 回放链路

```text
startReplayRecording()
  -> rrweb record()
  -> emit(event)
  -> pushReplayEvent(event)
  -> 本地 replayEvents 环形缓冲

正式监控事件入队后
  -> 'monitor:event:queued'
  -> addReplayMonitorEvent(event)
  -> addCustomEvent('monitor:event', marker)
  -> rrweb 追加一条 CustomEvent

保留条件命中
  -> markReplayForRetention()
  -> getReplaySnapshot()
  -> uploader 上送 /api/replays
  -> replayStore 保存
  -> Dashboard 展示 replay 元信息
  -> ReplayDetailPage 拉取并用 Replayer 回放
```

---

## 11. 曝光埋点这条线我们学到了什么

曝光是这次学习里非常重要的一条线，因为它不像点击那样天然有事件触发点。

当前项目的曝光采集在 [exposure.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/collectors/exposure.ts:1)。

我们主要做了两类曝光：

- 页面曝光 `page_exposure`
- 商品卡片曝光 `product_card_exposure`

关键点有三个：

- 用 `IntersectionObserver` 判断元素是否达到可见阈值
- 用 `data-exposure-id`、`data-product-id`、`data-position` 标识具体卡片
- 用 enter / leave 管理曝光状态，避免重复上报

### 11.1 为什么用了 `requestAnimationFrame`

因为监听商品卡片前，需要让当前页面的 DOM 先稳定下来，至少等浏览器完成当前这轮同步渲染准备，再去 `querySelectorAll` 和 `observe` 更稳。

它不是“等很久”，而是把逻辑安排到下一帧绘制前，避免你在 DOM 还没准备好时过早扫描。

### 11.2 为什么页面曝光用 `setTimeout(..., 0)`

页面曝光不是为了拖延，而是为了把它放到当前同步初始化之后，让 SDK 初始化、路由挂载、页面基础结构先完成，再去发首个页面曝光，避免过早上报。

---

## 12. 上报方式：fetch、sendBeacon、image

我们已经对这三种方式做过系统比较。

### 12.1 `fetch`

优点：

- 灵活
- 可带复杂 body
- 容易做批量上报

缺点：

- 页面卸载阶段不一定稳

### 12.2 `sendBeacon`

优点：

- 专门适合页面关闭、切后台、卸载前的兜底上报
- 浏览器会尽量帮你把数据发出去

缺点：

- 灵活度比 `fetch` 小
- 不是所有场景都适合

### 12.3 `image`

`image` 上报不是“上传图片”，而是利用浏览器加载图片资源会天然发起 GET 请求这一点，把埋点内容塞进 URL 查询参数中。

当前后端在 [server/src/index.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/server/src/index.ts:1) 里提供了 `/api/report/pixel` 来接这种请求。

它适合：

- 渠道像素
- 老旧兼容场景
- 极轻量、极低依赖的上报

它不适合代替主上报，因为：

- 只能 GET
- URL 长度受限
- 数据结构受限
- 失败控制能力弱

所以现实里通常是：

- 主链路用 `fetch`
- 卸载兜底用 `sendBeacon`
- 特殊兼容或营销像素用 `image`

---

## 13. 性能监控和 web-vitals

### 13.1 Performance API

当前项目在 [performance.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/collectors/performance.ts:1) 中采了这些内容：

- `navigation` timing
- `FCP`
- `LCP`
- `CLS`
- `Long Task`

它们分别回答：

- 页面整体加载经历了多久
- 首次有内容出现多久
- 主要内容何时真正完成
- 页面稳不稳定
- 主线程卡不卡

### 13.2 web-vitals

当前项目在 [web-vitals.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/collectors/web-vitals.ts:1) 中接入了：

- `INP`
- `TTFB`

`createWebVitalPayload()` 里保留的字段：

- `value`
- `delta`
- `rating`
- `metricId`
- `navigationType`
- `entryCount`

它们分别解决：

- 当前指标值是多少
- 和上次相比新增了多少
- 属于 good / needs-improvement / poor 哪一档
- 当前 metric 的唯一标识是什么
- 这次指标对应什么导航类型
- 这次计算参考了几条 `PerformanceEntry`

### 13.3 RUM 和 Lighthouse 的区别

我们也已经学过：

- RUM 是真实用户现场数据
- Lighthouse 是实验室环境下的模拟评估

前者更接近真实线上体验，后者更适合开发期诊断和优化。

---

## 14. 白屏检测这一章的核心

白屏检测不是简单判断“页面是不是空白颜色”，而是判断：

“关键业务区域里，有没有真正有效的内容被用户看见。”

当前实现见 [blank-screen.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/collectors/blank-screen.ts:1)。

它的核心思路是：

1. 根据路由挑选关键业务区域 selector
2. 找到目标容器
3. 在容器内生成多个采样点
4. 用 `elementsFromPoint()` 看每个点上层压着什么元素
5. 过滤壳子元素、骨架元素、不可见元素
6. 判断是否存在有效内容
7. 延迟一次，再复检一次，减少误报

最终可能得到几类结论：

- `main_container_missing`
- `no_effective_content`
- `only_shell_visible`

这一章的关键提升是：我们已经从“报 JS error”进化到了“识别页面虽然没报错，但用户实际看不到内容”的体验问题。

---

## 15. rrweb 在监控体系里是什么角色

rrweb 不是“指标层”，而是“证据回放层”。

指标层告诉我们：

- 哪个页面慢
- 哪个接口失败
- 哪个用户命中了白屏

证据回放层告诉我们：

- 当时用户看到了什么
- 做了什么
- 异常前后页面是怎么变化的

所以 rrweb 的价值不在“替代埋点”，而在“给埋点和错误补现场证据”。

---

## 16. 当前项目里的 rrweb 主线

rrweb 主线核心文件：

- [recorder.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/replay/recorder.ts:1)
- [retention.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/replay/retention.ts:1)
- [timeline.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/replay/timeline.ts:1)
- [uploader.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/replay/uploader.ts:1)

### 16.1 recorder 做什么

`startReplayRecording()` 里调用 `record()` 开始录制。

rrweb 每采到一条底层回放事件，就会调用：

```ts
emit(event) {
  pushReplayEvent(event)
}
```

这表示：

- rrweb 负责产生底层回放事件
- 我们负责把这些事件放进本地缓冲 `replayEvents`

### 16.2 replayId 是怎么理解的

`replayId` 不是“每条 rrweb 事件一个 id”，而是“一段录制窗口的 id”。

也就是：

- 同一段回放里的很多 rrweb 底层事件，共享一个 `replayId`
- 这段时间里产生的正式监控事件，也会带同一个 `replayId`

这样才能把：

- 用户行为事件
- 错误事件
- 白屏事件
- rrweb 回放片段

关联到同一段会话现场里。

---

## 17. 标准监控事件怎么进入 rrweb timeline

这是这次学习里非常关键的一步。

当前项目不是只录 rrweb 自己的 DOM 变化，还把正式监控事件安全地塞进了 replay 时间线。

流程是：

1. `monitor.ts` 生成正式 `MonitorEvent`
2. 入队成功后发布 `monitor:event:queued`
3. [timeline.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/replay/timeline.ts:1) 订阅它
4. 调用 `addReplayMonitorEvent(event)`
5. 在 [recorder.ts](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/sdk/replay/recorder.ts:1) 里生成 `marker`
6. 调用 `addCustomEvent('monitor:event', marker)`

这里的 `marker` 会保留：

- `eventId`
- `eventName`
- `type`
- `subType`
- `timestamp`
- `replayId`
- 精简后的安全 `payload`

注意这里有两个时间：

- rrweb 外层 custom event 的时间：`addCustomEvent()` 被调用的时刻
- marker 内部 `timestamp`：正式监控事件本身生成的时间

前者是“它什么时候被写进录制流”，后者是“业务监控事件什么时候发生”。

---

## 18. replay retention、上传和展示

录制不是全量永久保存的，而是要有“保留策略”。

当前项目里，回放不是每一段都一定上传，而是命中保留条件后才标记留存，再通过 uploader 上送后端。

这一步的意义是：

- 减少存储压力
- 只保留高价值现场
- 让回放更多服务于排障而不是无脑囤积

后端通过 `/api/replays` 接收后，Dashboard 再展示：

- replay 总数
- 已保留数
- 最新 replay
- 每条 replay 的 retainedReason、eventCount、时间等元信息

---

## 19. Dashboard 和 ReplayDetailPage 的关系

这两个页面是一前一后的关系。

### 19.1 DashboardPage

[DashboardPage.vue](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/pages/DashboardPage.vue:1) 负责：

- 拉取事件 summary
- 拉取 replay summary
- 列出 replay 列表
- 生成到详情页的跳转链接

也就是它负责“看列表”和“选哪条 replay”。

### 19.2 ReplayDetailPage

[ReplayDetailPage.vue](/abs/path/C:/Users/wzy/Desktop/八月/Monitoring&EventTracking/frontend/src/pages/ReplayDetailPage.vue:1) 负责：

- 从路由参数读 `replayId`
- 请求对应 replay snapshot
- 用 rrweb `Replayer` 播放
- 监听 `ReplayerEvents.CustomEvent`
- 把我们写进去的 `monitor:event` marker 展示出来

所以 `route.params.replayId` 不是 SDK 自动塞进去的，而是 Dashboard 点击详情链接时，Vue Router 把 `replayId` 拼进了 `/replays/:replayId` 这类动态路由里，详情页再读取它。

---

## 20. 当前项目已经实现的业务教学场景

现在这个项目已经不只是空壳 SDK 了，而是有比较完整的教学场景：

- 商城首页
- 商品卡片动态列表
- 页面曝光
- 卡片曝光
- 点击事件
- 加购事件
- 领券流程相关事件
- 下载事件
- image 像素上报示例
- 监控总览 Dashboard
- 事件流列表
- 可视化埋点配置页
- replay 元信息与回放详情页

这些场景已经足够支撑我们继续往后学更工程化的内容。

---

## 21. 我们这次真正建立起来的认知

如果要把这次学习的核心认知压缩成几句话，我会总结成下面这些：

1. 埋点不是“多发几个请求”，而是“定义业务事实”。
2. 监控不是“报错收集器”，而是“行为、错误、性能、现场证据”的组合系统。
3. 事件协议比采集代码更重要，因为协议决定后续所有治理成本。
4. 动态列表里，定位元素和识别业务对象是两回事。
5. `selector` 能找元素，但不天然等于业务语义。
6. 白名单字段提取是治理，不是保守。
7. Event Bus 的价值是解耦和扩展，不是为了炫技。
8. `MonitorEvent` 是 SDK 内部真正统一的正式事件格式。
9. rrweb 不是指标层，而是证据层。
10. 真正有价值的监控体系，一定是前端采集、标准化、上传、存储、展示、回放全链路协同。

