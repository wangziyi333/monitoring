import type { MonitorEvent } from '../sdk/types/events'

export interface EventListResponse {
  items: MonitorEvent[]
}

export interface EventSummaryResponse {
  total: number
  today: number
  errors: number
  byName: Array<{ name: string; count: number }>
  recent: MonitorEvent[]
}

export const fetchEvents = async () => {
  const response = await fetch('/api/events')

  if (!response.ok) {
    throw new Error(`fetch events failed with status ${response.status}`)
  }

  return (await response.json()) as EventListResponse
}

export const fetchEventSummary = async () => {
  const response = await fetch('/api/events/summary')
  if (!response.ok) throw new Error(`fetch event summary failed with status ${response.status}`)
  return (await response.json()) as EventSummaryResponse
}
