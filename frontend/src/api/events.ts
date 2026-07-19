import type { MonitorEvent } from '../sdk/types/events'
import type { ReplaySnapshot } from '../sdk/replay/recorder'

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

export interface ReplaySummaryItem {
  replayId: string
  sessionId?: string
  startedAt: number
  retainedAt?: number
  retainedReason?: string
  uploadedAt?: number
  eventCount: number
}

export interface ReplaySummaryResponse {
  total: number
  retained: number
  latest: ReplaySummaryItem | null
}

export interface ReplayListResponse {
  items: ReplaySummaryItem[]
}

export interface ReplayDetailResponse {
  item: ReplaySnapshot
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

export const fetchReplaySummary = async () => {
  const response = await fetch('/api/replays/summary')

  if (!response.ok) {
    throw new Error(`fetch replay summary failed with status ${response.status}`)
  }

  const data = (await response.json()) as Partial<ReplaySummaryResponse>

  return {
    total: typeof data.total === 'number' ? data.total : 0,
    retained: typeof data.retained === 'number' ? data.retained : 0,
    latest:
      data.latest && typeof data.latest === 'object'
        ? (data.latest as ReplaySummaryItem)
        : null,
  } satisfies ReplaySummaryResponse
}

export const fetchReplays = async () => {
  const response = await fetch('/api/replays')

  if (!response.ok) {
    throw new Error(`fetch replays failed with status ${response.status}`)
  }

  const data = (await response.json()) as Partial<ReplayListResponse>

  return {
    items: Array.isArray(data.items) ? data.items : [],
  } satisfies ReplayListResponse
}

export const fetchReplay = async (replayId: string) => {
  const response = await fetch(`/api/replays/${encodeURIComponent(replayId)}`)

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? '找不到这条 replay 记录'
        : `fetch replay failed with status ${response.status}`,
    )
  }

  const data = (await response.json()) as Partial<ReplayDetailResponse>

  if (!data.item || typeof data.item !== 'object' || !Array.isArray(data.item.events)) {
    throw new Error('replay 数据格式无效')
  }

  return data.item as ReplaySnapshot
}
