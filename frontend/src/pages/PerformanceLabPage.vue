<template>
  <div class="page-grid">
    <DemoCard title="性能实验室" description="这里会展示当前页面的基础性能时序信息。">
      <MetricList :items="items" />
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DemoCard from '../components/DemoCard.vue'
import MetricList from '../components/MetricList.vue'

const navigationEntry = performance.getEntriesByType(
  'navigation',
)[0] as PerformanceNavigationTiming | undefined

const items = computed(() => {
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
  ]
})
</script>
