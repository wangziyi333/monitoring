import { createMonitorContext } from './context'
import { createEventQueue } from '../transport/queue'
import type { MonitorConfig } from '../types/config'
import type { MonitorEvent, TrackEventArgs } from '../types/events'
import { createId } from '../utils/id'

let queue: ReturnType<typeof createEventQueue> | null = null
let currentConfig: MonitorConfig | null = null

export const initMonitor = (config: MonitorConfig) => {
  currentConfig = config
  queue = createEventQueue(config)
}

export const trackEvent = (...[definition, payload]: TrackEventArgs) => {
  if (!currentConfig || !queue) {
    return
  }

  const context = createMonitorContext(currentConfig)

  const event = {
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
  // as 表示“我比编译器更确定这个值的类型，请接受我的判断”

  queue.push(event)
}
