<template>
  <header class="app-nav">
    <div class="brand"><span class="brand-mark">M</span><span>监控演练台</span></div>
    <nav class="nav-links">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="nav-link">
        {{ item.label }}
      </RouterLink>
    </nav>
    <span class="env-badge">演示环境</span>
  </header>
</template>

<script setup lang="ts">
const items = [
  { label: '前台商城', to: '/' },
  { label: '监控看板', to: '/dashboard' },
  { label: '事件中心', to: '/events' },
  { label: '可视化埋点', to: '/visual-tracking' },
  { label: '学习路径', to: '/study/foundation' },
]
</script>

<style scoped>
.app-nav { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 24px; padding: 14px 32px; background: var(--navy); color: #eef4f7; border-bottom: 1px solid #243a4b; }
.brand, .nav-links { display: flex; align-items: center; }
.brand { gap: 10px; font-weight: 700; white-space: nowrap; }
.brand-mark { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 6px; background: var(--accent); color: white; }
.nav-links { gap: 4px; flex: 1; }
.nav-link { padding: 9px 12px; border-radius: 5px; text-decoration: none; color: #b8c5ce; font-size: 14px; }
.nav-link.router-link-active { background: #294255; color: #fff; }
.env-badge { color: #8fd3b2; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; }
@media (max-width: 780px) { .app-nav { align-items: flex-start; flex-wrap: wrap; padding: 14px 18px; } .nav-links { order: 3; width: 100%; overflow-x: auto; } }
</style>
