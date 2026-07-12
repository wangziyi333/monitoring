<template>
  <ul class="metric-list">
    <li v-for="item in items" :key="item.label">
      <strong>{{ item.label }}：</strong>{{ item.value }}
    </li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; value: string }>
}>()
</script>

<style scoped>
.metric-list {
  margin: 0;
  padding-left: 18px;
}
</style>
