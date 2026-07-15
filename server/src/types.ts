export interface StoredEvent {
  [key: string]: unknown
}

interface VisualTrackConfigBase {
  id: string
  trackId: string
  eventName: 'configured_element_click'
}

export interface SelectorVisualTrackConfig extends VisualTrackConfigBase {
  mode: 'selector'
  selector: string
}

export interface TrackKeyVisualTrackConfig extends VisualTrackConfigBase {
  mode: 'track_key'
  trackKey: string
}

export type VisualTrackConfig =
  | SelectorVisualTrackConfig
  | TrackKeyVisualTrackConfig
