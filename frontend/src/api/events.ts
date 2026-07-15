import type { MonitorEvent } from '../sdk/types/events'

export interface EventListResponse {
  items: MonitorEvent[]
}

export interface EventSummaryResponse {
  total: number
  today: number
  errors: number
  exposures: number
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

  const data = (await response.json()) as Partial<EventSummaryResponse>

  return {
    total: typeof data.total === 'number' ? data.total : 0,
    today: typeof data.today === 'number' ? data.today : 0,
    errors: typeof data.errors === 'number' ? data.errors : 0,
    exposures: typeof data.exposures === 'number' ? data.exposures : 0,
    byName: Array.isArray(data.byName) ? data.byName : [],
    recent: Array.isArray(data.recent) ? data.recent : [],
  } satisfies EventSummaryResponse
}
