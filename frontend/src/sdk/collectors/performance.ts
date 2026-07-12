import { track } from '../core/monitor'

export const registerPerformanceCollector = () => {
  window.addEventListener('load', () => {
    const navigationEntry = performance.getEntriesByType(
      'navigation',
    )[0] as PerformanceNavigationTiming | undefined

    if (!navigationEntry) {
      return
    }

    track('performance', 'navigation_timing', 'page_navigation_timing', {
      domContentLoaded:
        navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
      loadEvent:
        navigationEntry.loadEventEnd - navigationEntry.startTime,
      response: navigationEntry.responseEnd - navigationEntry.requestStart,
    })
  })
}
