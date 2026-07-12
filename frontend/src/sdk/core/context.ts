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
