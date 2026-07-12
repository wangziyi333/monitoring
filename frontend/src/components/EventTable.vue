<template>
  <div v-if="items.length === 0" class="event-table__empty">
    暂时还没有事件，请先去其他页面触发一些行为。
  </div>
  <table v-else class="event-table">
    <thead>
      <tr>
        <th>时间</th>
        <th>类型</th>
        <th>子类型</th>
        <th>名称</th>
        <th>页面</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ formatTime(item.timestamp) }}</td>
        <td>{{ item.type }}</td>
        <td>{{ item.subType }}</td>
        <td>{{ item.name }}</td>
        <td>{{ item.url }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { MonitorEvent } from '../sdk/types/events'

defineProps<{
  items: MonitorEvent[]
}>()

const formatTime = (timestamp: number) => new Date(timestamp).toLocaleTimeString()
</script>

<style scoped>
.event-table__empty {
  padding: 16px;
  border: 1px dashed var(--line);
  border-radius: 16px;
  color: var(--muted);
}

.event-table {
  width: 100%;
  margin-top: 16px;
  border-collapse: collapse;
}

.event-table th,
.event-table td {
  padding: 12px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}
</style>
