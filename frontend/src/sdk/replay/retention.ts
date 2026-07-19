import { onMonitorBusEvent } from '../core/event-bus'
import { markReplayForRetention } from './recorder'
import { uploadReplaySnapshot } from './uploader'

let teardownReplayRetention: (() => void) | null = null

//确定高价值异常事件
const SHOULD_RETAIN_EVENT_NAMES = new Set([
  'blank_screen_suspected',
  'window_error',
  'unhandled_rejection',
])

export const registerReplayRetention = () => {
  teardownReplayRetention?.()

  teardownReplayRetention = onMonitorBusEvent(
    'monitor:event',
    ({ definition, payload }) => {
      if (!SHOULD_RETAIN_EVENT_NAMES.has(definition.name)) {
        return
      }

      markReplayForRetention({
        eventName: definition.name,
        timestamp: Date.now(),
      })

      if (import.meta.env.DEV) {
        console.info('[replay] retained by monitor:event', {
          name: definition.name,
          payload,
        })
      }

      void uploadReplaySnapshot().catch((error) => {
        if (import.meta.env.DEV) {
          console.warn('[replay] upload failed', error)
        }
      })
    },
  )
}
