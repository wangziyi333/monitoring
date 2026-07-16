import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'
import { registerClickCollector } from '../sdk/collectors/click'
import { registerDwellCollector } from '../sdk/collectors/dwell'
import { registerErrorCollector } from '../sdk/collectors/error'
import { registerExposureCollector } from '../sdk/collectors/exposure'
import { registerPerformanceCollector } from '../sdk/collectors/performance'
import { registerPromiseCollector } from '../sdk/collectors/promise'
import { registerResourceCollector } from '../sdk/collectors/resource'
import { registerRouteCollector } from '../sdk/collectors/route'
import { loadVisualClickTrackConfigs } from '../sdk/collectors/visual-track-config'
import { initMonitor } from '../sdk'

export const createMonitoringApp = () => {
  initMonitor({
    appId: 'monitoring-event-tracking-demo',
    reportUrl: '/api/report',//正式主上报接口
    pixelReportUrl: '/api/report/pixel',//像素接口 给image get用
    batchSize: 3,
    flushInterval: 3000,
  })

  void loadVisualClickTrackConfigs()

  registerErrorCollector()
  registerPromiseCollector()
  registerResourceCollector()
  registerRouteCollector(router)
  registerClickCollector()
  registerExposureCollector()
  registerDwellCollector(router)
  registerPerformanceCollector()

  const app = createApp(App)

  app.use(router)
  app.mount('#app')
}
