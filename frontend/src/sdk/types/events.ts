export type MonitorEventType = 'error' | 'performance' | 'behavior' | 'custom'

export interface MonitorEvent<TPayload = Record<string, unknown>> {
  id: string
  type: MonitorEventType
  subType: string
  name: string
  timestamp: number
  url: string
  appId: string
  sessionId: string
  payload: TPayload
}
