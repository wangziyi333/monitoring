<template>
  <div class="page-grid">
    <DemoCard title="错误实验室" description="这里可以主动触发三类常见错误，观察监控 SDK 是否捕获。">
      <div class="button-row">
        <button @click="throwJsError">触发 JS 错误</button>
        <button @click="triggerPromiseError">触发 Promise 异常</button>
        <button @click="triggerResourceError">触发资源加载失败</button>
      </div>
      <img
        v-if="showBrokenImage"
        class="error-lab__image"
        :src="brokenImageSrc"
        alt="broken resource demo"
      />
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DemoCard from '../components/DemoCard.vue'

const showBrokenImage = ref(false)
const brokenImageSrc = '/not-found-monitoring-demo.png'

const throwJsError = () => {
  throw new Error('这是一个用于监控演示的 JS 错误')
}

const triggerPromiseError = () => {
  Promise.reject(new Error('这是一个未被捕获的 Promise 异常'))
}

const triggerResourceError = () => {
  showBrokenImage.value = false

  requestAnimationFrame(() => {
    showBrokenImage.value = true
  })
}
</script>

<style scoped>
.error-lab__image {
  display: block;
  width: 180px;
  margin-top: 16px;
}
</style>
