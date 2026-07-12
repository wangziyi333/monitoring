<template>
  <div class="page-grid">
    <DemoCard
      title="前端监控与埋点 Demo"
      description="我们会在这个项目里从零搭一个能采集错误、行为和性能数据的迷你监控系统。"
    >
      <ul>
        <li>错误监控：JS 错误、Promise 异常、资源加载失败</li>
        <li>行为埋点：页面访问、点击事件、停留时长</li>
        <li>性能监控：基础浏览器时序与页面加载信息</li>
        <li>上报链路：采集、规范化、上报、接收、展示</li>
      </ul>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import DemoCard from '../components/DemoCard.vue'
</script>
