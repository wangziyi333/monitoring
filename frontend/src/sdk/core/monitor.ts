import { createMonitorContext } from './context'
import { emitMonitorBusEvent, onMonitorBusEvent } from './event-bus'
import { createEventQueue } from '../transport/queue'
import { sendEventByImage } from '../transport/sender'
import type { MonitorConfig } from '../types/config'
import type { MonitorEvent, TrackEventArgs } from '../types/events'
import type { MonitorTrackRequest } from '../types/internal-events'
import { createId } from '../utils/id'

let queue: ReturnType<typeof createEventQueue> | null = null
let currentConfig: MonitorConfig | null = null
let teardownMonitorEventListener: (() => void) | null = null

const createMonitorEvent = (
  config: MonitorConfig,
  request: MonitorTrackRequest,
) => {
  const context = createMonitorContext(config)
  const { definition, payload } = request

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

  teardownMonitorEventListener?.()
  teardownMonitorEventListener = onMonitorBusEvent('monitor:event', (request) => {
    if (!currentConfig || !queue) {
      return
    }

    const event = createMonitorEvent(currentConfig, request)

    queue.push(event)
    emitMonitorBusEvent('monitor:event:queued', { event })
  })
}

export const trackEvent = (...args: TrackEventArgs) => {
  if (!currentConfig) {
    return
  }

  const request = {
    definition: args[0],
    payload: args[1],
  } as MonitorTrackRequest

  emitMonitorBusEvent('monitor:event', request)
}

export const trackEventByImage = async (...args: TrackEventArgs) => {
  if (!currentConfig) {
    return
  }

  const request = {
    definition: args[0],
    payload: args[1],
  } as MonitorTrackRequest
  const event = createMonitorEvent(currentConfig, request)

  await sendEventByImage(
    currentConfig.pixelReportUrl ?? currentConfig.reportUrl,
    event,
  )
}
