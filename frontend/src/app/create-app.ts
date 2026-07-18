import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'
import { registerClickCollector } from '../sdk/collectors/click'
import { registerClickResolver } from '../sdk/collectors/click-resolver'
import { registerExposureResolver } from '../sdk/collectors/exposure-resolver'
import { registerBusDebugger } from '../sdk/debug/bus-debugger'
import { registerDwellCollector } from '../sdk/collectors/dwell'
import { registerErrorCollector } from '../sdk/collectors/error'
import { registerExposureCollector } from '../sdk/collectors/exposure'
import { registerPerformanceCollector } from '../sdk/collectors/performance'
import { registerPromiseCollector } from '../sdk/collectors/promise'
import { registerResourceCollector } from '../sdk/collectors/resource'
import { registerRouteCollector } from '../sdk/collectors/route'
import { registerWebVitalsCollector } from '../sdk/collectors/web-vitals'
import { loadVisualClickTrackConfigs } from '../sdk/collectors/visual-track-config'
import { initMonitor } from '../sdk'

export const createMonitoringApp = () => {
  initMonitor({
    appId: 'monitoring-event-tracking-demo',
    reportUrl: '/api/report',
    pixelReportUrl: '/api/report/pixel',
    batchSize: 3,
    flushInterval: 3000,
  })

  void loadVisualClickTrackConfigs()

  registerErrorCollector()
  registerPromiseCollector()
  registerResourceCollector()
  registerRouteCollector(router)
  registerClickCollector()
  registerClickResolver()
  registerExposureResolver()
  registerBusDebugger()
  registerExposureCollector(router)
  registerDwellCollector(router)
  registerPerformanceCollector()
  registerWebVitalsCollector()

  const app = createApp(App)

  app.use(router)
  app.mount('#app')
}
