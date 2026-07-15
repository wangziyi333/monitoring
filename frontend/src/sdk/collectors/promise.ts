import { trackEvent } from '../core/monitor'
import { toSafeObject } from '../utils/safe-json'
import { MonitorEventDefinition } from '../types/events'

export const registerPromiseCollector = () => {
  window.addEventListener('unhandledrejection', (event) => {
    trackEvent(MonitorEventDefinition.Error.UnhandledRejection, {
      reason: toSafeObject(event.reason),
    })
  })
}
