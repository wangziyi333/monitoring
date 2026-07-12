import { track } from '../core/monitor'
import { toSafeObject } from '../utils/safe-json'

export const registerPromiseCollector = () => {
  window.addEventListener('unhandledrejection', (event) => {
    track('error', 'promise_error', 'unhandled_rejection', {
      reason: toSafeObject(event.reason),
    })
  })
}
