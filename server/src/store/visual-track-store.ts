import type { VisualTrackConfig } from '../types'

const items: VisualTrackConfig[] = [
  {
    id: 'selector-buy-now',
    mode: 'selector',
    selector: '.product-actions > button:nth-child(1)',
    trackId: 'visual-selector-buy-now',
    eventName: 'configured_element_click',
  },
  {
    id: 'track-key-banner-buy',
    mode: 'track_key',
    trackKey: 'banner-buy-now',
    trackId: 'visual-track-key-buy-now',
    eventName: 'configured_element_click',
  },
]

export const visualTrackStore = {
  add(item: VisualTrackConfig) {
    items.unshift(item)
  },
  remove(id: string) {
    const index = items.findIndex((item) => item.id === id)

    if (index >= 0) {
      items.splice(index, 1)
      return true
    }

    return false
  },
  getAll() {
    return items.slice()
  },
}
