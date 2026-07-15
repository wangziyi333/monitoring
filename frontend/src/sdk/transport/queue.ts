import type { MonitorConfig } from '../types/config'
import type { MonitorEvent } from '../types/events'
import { sendEvents } from './sender'

const PENDING_CACHE_KEY = 'monitoring-demo-pending-events'

export const createEventQueue = (config: MonitorConfig) => {
  const items: MonitorEvent[] = []
  const batchSize = config.batchSize ?? 5
  const flushInterval = config.flushInterval ?? 5000
  let isFlushing = false
  let flushAgain = false

  const readCache = () => {
    if (typeof window === 'undefined') {
      return []
    }

    const raw = window.localStorage.getItem(PENDING_CACHE_KEY)

    if (!raw) {
      return []
    }

    try {
      const parsed = JSON.parse(raw) as MonitorEvent[]

      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const writeCache = () => {
    if (typeof window === 'undefined') {
      return
    }

    if (items.length === 0) {
      window.localStorage.removeItem(PENDING_CACHE_KEY)
      return
    }

    window.localStorage.setItem(PENDING_CACHE_KEY, JSON.stringify(items))
  }

  items.push(...readCache())

  const flush = async (useBeacon = false) => {
    if (items.length === 0) {
      return
    }

    if (isFlushing) {
      flushAgain = true
      return
    }

    isFlushing = true

    const batch = items.splice(0, batchSize)

    try {
      await sendEvents(config.reportUrl, batch, { useBeacon })
      writeCache()
    } catch {
      items.unshift(...batch)
      writeCache()
    } finally {
      isFlushing = false

      if (flushAgain) {
        flushAgain = false
        void flush(useBeacon)
      }
    }
  }

  const registerLifecycleFlush = () => {
    if (typeof window === 'undefined') {
      return
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        void flush(true)
      }
    })

    window.addEventListener('pagehide', () => {
      void flush(true)
    })
  }

  registerLifecycleFlush()

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
