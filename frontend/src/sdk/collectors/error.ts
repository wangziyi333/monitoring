import { track } from '../core/monitor'

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

    track('error', 'js_error', 'window_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  })
}
