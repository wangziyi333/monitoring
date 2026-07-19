import type { MonitorConfig } from '../types/config'
import { createSessionId } from '../utils/id'

export interface MonitorContext {
  appId: string
  sessionId: string
  url: string
  replayId?: string
}

let currentSessionId: string | null = null
let currentReplayId: string | null = null

const getSessionId = () => {
  if (currentSessionId) {
    return currentSessionId
  }

  currentSessionId = createSessionId()
  return currentSessionId
}

export const getCurrentSessionId = () => getSessionId()

export const setReplayId = (replayId: string | null) => {
  currentReplayId = replayId
}

export const getReplayId = () => currentReplayId ?? undefined

export const resetMonitorContext = () => {
  currentSessionId = null
  currentReplayId = null
}

export const createMonitorContext = (config: MonitorConfig): MonitorContext => ({
  appId: config.appId,
  sessionId: getSessionId(),
  url: window.location.href,
  replayId: getReplayId(),
})
