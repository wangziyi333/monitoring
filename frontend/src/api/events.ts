import type { MonitorEvent } from '../sdk/types/events'

export interface EventListResponse {
  items: MonitorEvent[]
}

export const fetchEvents = async () => {
  const response = await fetch('/api/events')

  if (!response.ok) {
    throw new Error(`fetch events failed with status ${response.status}`)
  }

  return (await response.json()) as EventListResponse
}
