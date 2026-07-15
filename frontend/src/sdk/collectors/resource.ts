import { trackEvent } from '../core/monitor'
import { MonitorEventDefinition } from '../types/events'

export const registerResourceCollector = () => {
  window.addEventListener(
    'error',
    (event) => {
      const target = event.target

      if (
        !(
          target instanceof HTMLScriptElement ||
          target instanceof HTMLImageElement ||
          target instanceof HTMLLinkElement
        )
      ) {
        return
      }

      trackEvent(MonitorEventDefinition.Error.ResourceLoadFailed, {
        tagName: target.tagName,
        source: target.getAttribute('src') ?? target.getAttribute('href') ?? '',
      })
    },
    true,
  )
}
