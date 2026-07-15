<template>
  <div class="page-grid">
    <DemoCard
      title="业务埋点实验"
      description="这里重点观察手动埋点、声明式配置点击和页面停留时长统计。"
    >
      <div class="button-row">
        <button @click="handleTrackClick">触发手动埋点</button>
        <button data-track="buy-now">模拟立即购买</button>
        <button data-track="collect">模拟收藏商品</button>
      </div>
      <p>
        你可以先点这里的按钮，再切换到“事件中心”刷新列表，观察 custom、configured click
        和 document click 这几类事件是怎么被记录下来的。
      </p>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
import { trackEvent } from '../sdk'
import { MonitorEventDefinition } from '../sdk/types/events'

const handleTrackClick = () => {
  trackEvent(MonitorEventDefinition.Custom.ManualButtonClick, {
    label: 'tracking-lab-manual-button',
  })
}
</script>
