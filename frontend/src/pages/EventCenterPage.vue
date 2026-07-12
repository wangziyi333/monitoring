<template>
  <div class="page-grid">
    <DemoCard title="事件中心" description="这里会展示 mock 服务已经接收到的监控事件。">
      <div class="button-row">
        <button :disabled="loading" @click="loadEvents">
          {{ loading ? '加载中...' : '刷新事件列表' }}
        </button>
      </div>
      <p v-if="errorMessage" class="event-center__error">{{ errorMessage }}</p>
      <EventTable :items="items" />
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchEvents } from '../api/events'
import DemoCard from '../components/DemoCard.vue'
import EventTable from '../components/EventTable.vue'
import type { MonitorEvent } from '../sdk/types/events'

const items = ref<MonitorEvent[]>([])
const loading = ref(false)
const errorMessage = ref('')

const loadEvents = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetchEvents()
    items.value = response.items
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载事件失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadEvents()
})
</script>

<style scoped>
.event-center__error {
  color: #9e2f2f;
}
</style>
