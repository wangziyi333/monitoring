<template>
  <div v-if="stage" class="page-grid">
    <DemoCard :title="`${stage.order} · ${stage.title}`" :description="stage.goal">
      <p>{{ stage.summary }}</p>
    </DemoCard>

    <DemoCard v-if="isFoundation" title="阶段 1 学习清单">
      <ul class="study-list">
        <li v-for="item in foundationChecklist" :key="item">{{ item }}</li>
      </ul>
    </DemoCard>

    <DemoCard v-if="isFoundation" title="先把这些词分清楚">
      <ul class="study-list">
        <li v-for="item in foundationGlossary" :key="item.term">
          <strong>{{ item.term }}：</strong>{{ item.meaning }}
        </li>
      </ul>
    </DemoCard>

    <DemoCard title="这一阶段重点学什么">
      <ul class="study-list">
        <li v-for="point in stage.keyPoints" :key="point">{{ point }}</li>
      </ul>
    </DemoCard>

    <DemoCard title="建议先看的代码文件">
      <ul class="study-list">
        <li v-for="file in stage.fileMap" :key="file">
          <code>{{ file }}</code>
        </li>
      </ul>
    </DemoCard>

    <DemoCard title="对应实验">
      <div class="lab-list">
        <RouterLink v-for="lab in stage.labs" :key="lab.to" :to="lab.to" class="lab-link">
          <strong>{{ lab.label }}</strong>
          <span>{{ lab.description }}</span>
        </RouterLink>
      </div>
    </DemoCard>

    <DemoCard title="学习建议">
      <ol class="study-list study-list--ordered">
        <li>先看这一页的目标和词汇，知道这一阶段在解决什么问题。</li>
        <li>再打开对应代码文件，看当前项目里这一层是怎么落地的。</li>
        <li>最后去实验页或事件中心，把概念和真实数据对上。</li>
      </ol>
    </DemoCard>
  </div>

  <div v-else class="page-grid">
    <DemoCard
      title="未找到对应学习阶段"
      description="这个阶段路由不存在，你可以先回到学习总览重新选择。"
    >
      <RouterLink to="/">返回学习总览</RouterLink>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import DemoCard from '../components/DemoCard.vue'
import { foundationChecklist, foundationGlossary } from '../data/foundation-guide'
import { findStage } from '../data/study-path'

const route = useRoute()

const stage = computed(() => findStage(String(route.params.stageId ?? '')))
const isFoundation = computed(() => stage.value?.id === 'foundation')
</script>

<style scoped>
.study-list {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
}

.study-list--ordered {
  padding-left: 22px;
}

.lab-list {
  display: grid;
  gap: 12px;
}

.lab-link {
  display: grid;
  gap: 6px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 16px;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.45);
}
</style>
