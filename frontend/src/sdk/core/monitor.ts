import { createMonitorContext } from './context'
import { createEventQueue } from '../transport/queue'
import type { MonitorConfig } from '../types/config'
import type { MonitorEvent, MonitorEventType } from '../types/events'
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
