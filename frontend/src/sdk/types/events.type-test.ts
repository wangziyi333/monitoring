import { trackEvent } from '../core/monitor'
import type {
  SelectorVisualClickTrackConfig,
  TrackKeyVisualClickTrackConfig,
} from '../collectors/visual-track-config'
import { MonitorEventDefinition } from './events'

trackEvent(MonitorEventDefinition.Custom.ManualButtonClick, {
  label: 'tracking-lab-manual-button',
})

trackEvent(MonitorEventDefinition.Behavior.ConfiguredElementClick, {
  trackId: 'buy-now',
  tagName: 'BUTTON',
  text: '模拟立即购买',
  source: 'declarative',
})

const selectorVisualClickConfig: SelectorVisualClickTrackConfig = {
  id: 'selector-buy-now',
  mode: 'selector',
  selector: '.product-actions > button:nth-child(1)',
  trackId: 'visual-selector-buy-now',
  definition: MonitorEventDefinition.Behavior.ConfiguredElementClick,
}

const trackKeyVisualClickConfig: TrackKeyVisualClickTrackConfig = {
  id: 'track-key-banner-buy',
  mode: 'track_key',
  trackKey: 'banner-buy-now',
  trackId: 'visual-track-key-buy-now',
  definition: MonitorEventDefinition.Behavior.ConfiguredElementClick,
}

void selectorVisualClickConfig
void trackKeyVisualClickConfig

const invalidVisualClickConfig: SelectorVisualClickTrackConfig = {
  id: 'invalid-selector',
  mode: 'selector',
  selector: 'button',
  trackId: 'button',
  // @ts-expect-error visual click config currently only supports configured_element_click
  definition: MonitorEventDefinition.Behavior.DocumentClick,
}

void invalidVisualClickConfig

// @ts-expect-error manual_button_click requires a label
trackEvent(MonitorEventDefinition.Custom.ManualButtonClick, {})

// @ts-expect-error manual_button_click label must be a string
trackEvent(MonitorEventDefinition.Custom.ManualButtonClick, { label: 123 })

// @ts-expect-error configured_element_click requires source
trackEvent(MonitorEventDefinition.Behavior.ConfiguredElementClick, {
  trackId: 'buy-now',
  tagName: 'BUTTON',
  text: '模拟立即购买',
})
