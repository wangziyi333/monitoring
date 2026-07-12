<template>
  <section class="demo-card">
    <h2>{{ title }}</h2>
    <p v-if="description" class="demo-card__description">{{ description }}</p>
    <div class="demo-card__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style scoped>
.demo-card {
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: var(--panel);
  box-shadow: var(--shadow);
}

.demo-card__description {
  color: var(--muted);
}

.demo-card__body {
  margin-top: 16px;
}
</style>
