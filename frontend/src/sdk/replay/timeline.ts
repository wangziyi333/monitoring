import { onMonitorBusEvent } from '../core/event-bus'
import { addReplayMonitorEvent } from './recorder'

let teardownReplayTimeline: (() => void) | null = null

export const registerReplayTimeline = () => {
  teardownReplayTimeline?.()

  teardownReplayTimeline = onMonitorBusEvent(
    'monitor:event:queued',
    ({ event }) => {
      addReplayMonitorEvent(event)
    },
  )
}
