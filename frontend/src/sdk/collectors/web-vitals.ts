import type { Metric } from 'web-vitals'
import { onINP, onTTFB } from 'web-vitals'
import { emitMonitorBusEvent } from '../core/event-bus'
import { MonitorEventDefinition } from '../types/events'

const createWebVitalPayload = (metric: Metric) => ({
  value: Number(metric.value.toFixed(2)),
  //这次上报比上一次新增了多少
  delta: Number(metric.delta.toFixed(2)),
  //此次指标评级:good / needs-improvement / poor
  rating: metric.rating,
  //用于去重和归并 这一次 metric 实例的唯一 ID
  metricId: metric.id,
  //以下两个为辅助诊断用,以上为核心字段
  //这次指标对应的导航类型: navigate\reload\back-forward\prerender\restore
  navigationType: metric.navigationType,
  //这次指标计算关联了多少条 PerformanceEntry
  entryCount: metric.entries.length,
})

export const registerWebVitalsCollector = () => {
  onINP((metric) => {
    emitMonitorBusEvent('monitor:event', {
      definition: MonitorEventDefinition.Performance.WebVitalsInp,
      payload: createWebVitalPayload(metric),
    })
  })

  onTTFB((metric) => {
    emitMonitorBusEvent('monitor:event', {
      definition: MonitorEventDefinition.Performance.WebVitalsTtfb,
      payload: createWebVitalPayload(metric),
    })
  })
}
