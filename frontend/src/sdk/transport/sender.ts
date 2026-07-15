import type { MonitorEvent } from '../types/events'

type SendEventsOptions = {
  useBeacon?: boolean
}

export const sendEvents = async (
  reportUrl: string,
  events: MonitorEvent[],
  options: SendEventsOptions = {},
) => {
  const body = JSON.stringify({ items: events })

  if (options.useBeacon && navigator.sendBeacon) {
    const isAccepted = navigator.sendBeacon(
      reportUrl,
      new Blob([body], { type: 'application/json' }),
    )

    if (isAccepted) {
      return
    }
  }

  const response = await fetch(reportUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  })

  if (!response.ok) {
    throw new Error(`report failed with status ${response.status}`)
  }
}
