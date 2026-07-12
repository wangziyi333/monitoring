<template>
  <header class="app-nav">
    <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="nav-link">
      {{ item.label }}
    </RouterLink>
  </header>
</template>

<script setup lang="ts">
const items = [
  { label: '首页', to: '/' },
  { label: '错误实验室', to: '/errors' },
  { label: '埋点实验室', to: '/tracking' },
  { label: '性能实验室', to: '/performance' },
  { label: '事件中心', to: '/events' },
]
</script>

<style scoped>
.app-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 24px;
  backdrop-filter: blur(14px);
  background: rgba(251, 247, 239, 0.8);
  border-bottom: 1px solid rgba(220, 207, 187, 0.8);
}

.nav-link {
  padding: 10px 14px;
  border-radius: 999px;
  text-decoration: none;
}

.nav-link.router-link-active {
  background: rgba(183, 90, 43, 0.12);
  color: #8f421f;
}
</style>
