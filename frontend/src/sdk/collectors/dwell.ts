import type { Router } from 'vue-router'
import { trackEvent } from '../core/monitor'
import { MonitorEventDefinition } from '../types/events'

export const registerDwellCollector = (router: Router) => {
  let enterAt = Date.now()
  let currentPath = router.currentRoute.value.fullPath

  router.afterEach((to) => {
    const leaveAt = Date.now()

    trackEvent(MonitorEventDefinition.Behavior.PageDwellDuration, {
      path: currentPath,
      duration: leaveAt - enterAt,
    })

    currentPath = to.fullPath
    enterAt = Date.now()
  })
}
