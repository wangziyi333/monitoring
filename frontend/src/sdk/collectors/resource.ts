import { track } from '../core/monitor'

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

      track('error', 'resource_error', 'resource_load_failed', {
        tagName: target.tagName,
        source: target.getAttribute('src') ?? target.getAttribute('href') ?? '',
      })
    },
    true,
  )
}
