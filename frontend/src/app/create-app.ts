import { createApp } from 'vue'
import App from '../App.vue'
import { router } from '../router'
import { registerClickCollector } from '../sdk/collectors/click'
import { registerClickResolver } from '../sdk/collectors/click-resolver'
import { registerBlankScreenCollector } from '../sdk/collectors/blank-screen'
import { registerBlankScreenResolver } from '../sdk/collectors/blank-screen-resolver'
import { registerExposureResolver } from '../sdk/collectors/exposure-resolver'
import { registerBusDebugger } from '../sdk/debug/bus-debugger'
import { registerReplayDebugger } from '../sdk/debug/replay-debugger'
import { registerDwellCollector } from '../sdk/collectors/dwell'
import { registerErrorCollector } from '../sdk/collectors/error'
import { registerExposureCollector } from '../sdk/collectors/exposure'
import { registerPerformanceCollector } from '../sdk/collectors/performance'
import { registerPromiseCollector } from '../sdk/collectors/promise'
import { registerResourceCollector } from '../sdk/collectors/resource'
import { registerRouteCollector } from '../sdk/collectors/route'
import { registerWebVitalsCollector } from '../sdk/collectors/web-vitals'
import { registerReplayRetention } from '../sdk/replay/retention'
import { registerReplayTimeline } from '../sdk/replay/timeline'
import { startReplayRecording } from '../sdk/replay/recorder'
import { loadVisualClickTrackConfigs } from '../sdk/collectors/visual-track-config'
import { initMonitor } from '../sdk'

export const createMonitoringApp = () => {
  const monitorConfig = {
    appId: 'monitoring-event-tracking-demo',
    reportUrl: '/api/report',
    pixelReportUrl: '/api/report/pixel',
    batchSize: 3,
    flushInterval: 3000,
    replayEnabled: true,
    replaySampleRate: 1,
  } as const

  initMonitor(monitorConfig)
  startReplayRecording(monitorConfig)
  registerReplayTimeline()

  void loadVisualClickTrackConfigs()

  registerErrorCollector()
  registerPromiseCollector()
  registerResourceCollector()
  registerRouteCollector(router)
  registerClickCollector()
  registerClickResolver()
  registerBlankScreenResolver()
  registerExposureResolver()
  registerReplayRetention()
  registerBusDebugger()
  registerReplayDebugger()
  registerBlankScreenCollector(router)
  registerExposureCollector(router)
  registerDwellCollector(router)
  registerPerformanceCollector()
  registerWebVitalsCollector()

  const app = createApp(App)

  app.use(router)
  app.mount('#app')
}
