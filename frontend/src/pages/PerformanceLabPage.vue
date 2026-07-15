<template>
  <div class="page-grid">
    <DemoCard
      title="性能实验"
      description="这里展示当前页面的基础性能时序信息，方便你理解 Navigation Timing、FCP、LCP、CLS 和 Long Task。"
    >
      <MetricList :items="items" />
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DemoCard from '../components/DemoCard.vue'
import MetricList from '../components/MetricList.vue'

const items = computed(() => {
  const navigationEntry = performance.getEntriesByType(
    'navigation',
  )[0] as PerformanceNavigationTiming | undefined

  const paintEntries = performance.getEntriesByType('paint')
  const fcpEntry = paintEntries.find(
    (entry) => entry.name === 'first-contentful-paint',
  )

  const lcpEntries = performance.getEntriesByType(
    'largest-contentful-paint',
  ) as Array<PerformanceEntry & { size?: number; element?: Element }>

  const layoutShiftEntries = performance.getEntriesByType(
    'layout-shift',
  ) as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>

  const longTaskEntries = performance.getEntriesByType('longtask')

  const clsValue = layoutShiftEntries.reduce((sum, entry) => {
    if (entry.hadRecentInput) {
      return sum
    }

    return sum + (entry.value ?? 0)
  }, 0)

  const totalLongTaskDuration = longTaskEntries.reduce(
    (sum, entry) => sum + entry.duration,
    0,
  )

  if (!navigationEntry) {
    return [{ label: '提示', value: '当前浏览器未提供 navigation timing 数据' }]
  }

  return [
    {
      label: 'DOMContentLoaded',
      value: `${Math.round(
        navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
      )} ms`,
    },
    {
      label: 'Load Event',
      value: `${Math.round(
        navigationEntry.loadEventEnd - navigationEntry.startTime,
      )} ms`,
    },
    {
      label: 'Response',
      value: `${Math.round(
        navigationEntry.responseEnd - navigationEntry.requestStart,
      )} ms`,
    },
    {
      label: 'FCP',
      value: fcpEntry ? `${Math.round(fcpEntry.startTime)} ms` : '暂无数据',
    },
    {
      label: 'LCP',
      value:
        lcpEntries.length > 0
          ? `${Math.round(lcpEntries[lcpEntries.length - 1].startTime)} ms`
          : '暂无数据',
    },
    {
      label: 'CLS',
      value: clsValue > 0 ? clsValue.toFixed(4) : '0.0000',
    },
    {
      label: 'Long Task',
      value:
        longTaskEntries.length > 0
          ? `${Math.round(totalLongTaskDuration)} ms / ${longTaskEntries.length} 条`
          : '暂无数据',
    },
  ]
})
</script>
