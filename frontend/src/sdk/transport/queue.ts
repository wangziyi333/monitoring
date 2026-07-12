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
