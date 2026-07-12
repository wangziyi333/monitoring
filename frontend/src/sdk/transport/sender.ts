import type { MonitorEvent } from '../types/events'

export const sendEvents = async (reportUrl: string, events: MonitorEvent[]) => {
  const response = await fetch(reportUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: events }),
  })

  if (!response.ok) {
    throw new Error(`report failed with status ${response.status}`)
  }
}
