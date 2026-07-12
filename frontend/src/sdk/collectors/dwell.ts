import type { Router } from 'vue-router'
import { track } from '../core/monitor'

export const registerDwellCollector = (router: Router) => {
  let enterAt = Date.now()
  let currentPath = router.currentRoute.value.fullPath

  router.afterEach((to) => {
    const leaveAt = Date.now()

    track('behavior', 'page_dwell', 'page_dwell_duration', {
      path: currentPath,
      duration: leaveAt - enterAt,
    })

    currentPath = to.fullPath
    enterAt = Date.now()
  })
}
