import { createMonitorContext } from './context'
import { createEventQueue } from '../transport/queue'
import { sendEventByImage } from '../transport/sender'
import type { MonitorConfig } from '../types/config'
import type { MonitorEvent, TrackEventArgs } from '../types/events'
import { createId } from '../utils/id'

let queue: ReturnType<typeof createEventQueue> | null = null
let currentConfig: MonitorConfig | null = null

const createMonitorEvent = (
  config: MonitorConfig,
  ...[definition, payload]: TrackEventArgs
) => {
  const context = createMonitorContext(config)

  return {
    id: createId(),
    type: definition.type,
    subType: definition.subType,
    name: definition.name,
    timestamp: Date.now(),
    url: context.url,
    appId: context.appId,
    sessionId: context.sessionId,
    payload,
  } as MonitorEvent
}

export const initMonitor = (config: MonitorConfig) => {
  currentConfig = config
  queue = createEventQueue(config)
}

export const trackEvent = (...args: TrackEventArgs) => {
  if (!currentConfig || !queue) {
    return
  }

  queue.push(createMonitorEvent(currentConfig, ...args))
}
//image埋点使用场景：广告投放、第三方统计对接、历史系统兼容、极轻量的曝光通知、邮箱追踪
//...args把调用时传进来的多个参数收集成一个数组/元组
export const trackEventByImage = async (...args: TrackEventArgs) => {
  if (!currentConfig) {
    return
  }

  const event = createMonitorEvent(currentConfig, ...args)

  await sendEventByImage(
    currentConfig.pixelReportUrl ?? currentConfig.reportUrl,
    event,
  )
}
