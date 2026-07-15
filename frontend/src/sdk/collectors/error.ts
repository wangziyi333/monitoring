import { trackEvent } from '../core/monitor'
import { MonitorEventDefinition } from '../types/events'

export const registerErrorCollector = () => {
  window.addEventListener('error', (event) => {
    const target = event.target

    if (
      target instanceof HTMLScriptElement ||
      target instanceof HTMLImageElement ||
      target instanceof HTMLLinkElement
    ) {
      return
    }

    trackEvent(MonitorEventDefinition.Error.WindowError, {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })
}
