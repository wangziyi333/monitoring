import type { Router } from 'vue-router'
import { track } from '../core/monitor'

export const registerRouteCollector = (router: Router) => {
  router.afterEach((to, from) => {
    track('behavior', 'page_view', 'route_page_view', {
      to: to.fullPath,
      from: from.fullPath,
    })
  })
}
