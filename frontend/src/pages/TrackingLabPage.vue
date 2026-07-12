<template>
  <div class="page-grid">
    <DemoCard title="埋点实验室" description="这里会同时演示手动埋点、点击采集、路由采集和停留时长统计。">
      <div class="button-row">
        <button @click="handleTrackClick">触发手动埋点</button>
        <button data-track="buy-now">模拟立即购买</button>
        <button data-track="collect">模拟收藏商品</button>
      </div>
      <p>点击这些按钮、切换页面后，再去事件中心刷新，就能看到行为类事件。</p>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
import { track } from '../sdk'

const handleTrackClick = () => {
  track('custom', 'manual_track', 'manual_button_click', {
    label: 'tracking-lab-manual-button',
  })
}
</script>
