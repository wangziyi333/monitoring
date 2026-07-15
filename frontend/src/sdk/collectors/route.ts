import type { Router } from 'vue-router'
import { trackEvent } from '../core/monitor'
import { MonitorEventDefinition } from '../types/events'

export const registerRouteCollector = (router: Router) => {
  router.afterEach((to, from) => {
    trackEvent(MonitorEventDefinition.Behavior.RoutePageView, {
      to: to.fullPath,
      from: from.fullPath,
    })
  })
}
