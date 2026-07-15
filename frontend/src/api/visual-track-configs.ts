import type { VisualClickTrackConfig } from '../sdk/collectors/visual-track-config'
import { MonitorEventName } from '../sdk/types/events'

export interface VisualTrackConfigRecordBase {
  id: string
  trackId: string
  eventName: typeof MonitorEventName.ConfiguredElementClick
}

export interface SelectorVisualTrackConfigRecord
  extends VisualTrackConfigRecordBase {
  mode: 'selector'
  selector: string
}

export interface TrackKeyVisualTrackConfigRecord
  extends VisualTrackConfigRecordBase {
  mode: 'track_key'
  trackKey: string
}

export type VisualTrackConfigRecord =
  | SelectorVisualTrackConfigRecord
  | TrackKeyVisualTrackConfigRecord

export interface VisualTrackConfigListResponse {
  items: VisualTrackConfigRecord[]
}

const toVisualTrackConfigRecord = (
  config: VisualClickTrackConfig,
): VisualTrackConfigRecord => {
  if (config.mode === 'selector') {
    return {
      id: config.id,
      mode: 'selector',
      selector: config.selector,
      trackId: config.trackId,
      eventName: config.definition.name,
    }
  }

  return {
    id: config.id,
    mode: 'track_key',
    trackKey: config.trackKey,
    trackId: config.trackId,
    eventName: config.definition.name,
  }
}

export const fetchVisualTrackConfigs = async () => {
  const response = await fetch('/api/visual-track-configs')

  if (!response.ok) {
    throw new Error(
      `fetch visual track configs failed with status ${response.status}`,
    )
  }
//response.json()把http响应体解析为js对象，异步解析
  return (await response.json()) as VisualTrackConfigListResponse//我期望这个json是这个结构
}

export const createVisualTrackConfig = async (
  config: VisualClickTrackConfig,
) => {
  const response = await fetch('/api/visual-track-configs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(toVisualTrackConfigRecord(config)),
  })

  if (!response.ok) {
    throw new Error(
      `create visual track config failed with status ${response.status}`,
    )
  }

  return response.json()
}

export const deleteVisualTrackConfig = async (id: string) => {
  const response = await fetch(`/api/visual-track-configs/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(
      `delete visual track config failed with status ${response.status}`,
    )
  }

  return response.json()
}
