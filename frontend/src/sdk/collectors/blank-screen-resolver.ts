import { emitMonitorBusEvent, onMonitorBusEvent } from '../core/event-bus'
import { MonitorEventDefinition } from '../types/events'

let teardownBlankScreenResolver: (() => void) | null = null

export const registerBlankScreenResolver = () => {
  teardownBlankScreenResolver?.()

  teardownBlankScreenResolver = onMonitorBusEvent(
    'dom:blank-screen:detected',
    ({
      route,
      target,
      checkPhase,
      samplePoints,
      emptyPointCount,
      duration,
      reason,
    }) => {
      const resolvedTrack = {
        definition: MonitorEventDefinition.Error.BlankScreenSuspected,
        payload: {
          route,
          target,
          checkPhase,
          samplePoints,
          emptyPointCount,
          duration,
          reason,
        },
      } as const

      emitMonitorBusEvent('track:blank-screen:resolved', resolvedTrack)
      emitMonitorBusEvent('monitor:event', resolvedTrack)
    },
  )
}
