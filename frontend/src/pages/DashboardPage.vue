<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <span class="eyebrow">运营态势 / 总览</span>
        <h1>监控看板</h1>
        <p>这里汇总前台促销页和监控 SDK 实时上报过来的信号。</p>
      </div>
      <button :disabled="loading" @click="loadSummary">
        {{ loading ? '刷新中...' : '刷新数据' }}
      </button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <section class="metric-grid">
      <article v-for="metric in metrics" :key="metric.label" class="metric">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.note }}</small>
      </article>
    </section>

    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-heading">
          <div>
            <span class="eyebrow">事件体量</span>
            <h2>高频事件名称</h2>
          </div>
          <span>最近 200 条事件</span>
        </div>

        <div v-if="summary.byName.length" class="bars">
          <div v-for="item in summary.byName" :key="item.name" class="bar-row">
            <span>{{ item.name }}</span>
            <div><i :style="{ width: `${Math.max(8, (item.count / maxCount) * 100)}%` }"></i></div>
            <strong>{{ item.count }}</strong>
          </div>
        </div>

        <p v-else class="empty">暂时还没有事件数据，先去前台页面触发一些交互吧。</p>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <span class="eyebrow">最近活动</span>
            <h2>最新监控信号</h2>
          </div>
          <RouterLink to="/events">查看全部</RouterLink>
        </div>

        <div v-if="summary.recent.length" class="activity">
          <div v-for="event in summary.recent" :key="event.id" class="activity-row">
            <span class="signal-dot" :class="event.type"></span>
            <div>
              <strong>{{ event.name }}</strong>
              <small>{{ event.payload ? JSON.stringify(event.payload).slice(0, 70) : '' }}</small>
            </div>
            <time>{{ new Date(event.timestamp).toLocaleTimeString() }}</time>
          </div>
        </div>

        <p v-else class="empty">正在等待第一条事件上报。</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchEventSummary, type EventSummaryResponse } from '../api/events'

const loading = ref(false)
const errorMessage = ref('')
const summary = ref<EventSummaryResponse>({
  total: 0,
  today: 0,
  errors: 0,
  exposures: 0,
  byName: [],
  recent: [],
})

const maxCount = computed(() => Math.max(1, ...summary.value.byName.map((item) => item.count)))

const metrics = computed(() => [
  { label: '累计接收事件', value: summary.value.total, note: '当前缓冲区总量' },
  { label: '曝光事件数', value: summary.value.exposures, note: '页面曝光与商品曝光' },
  { label: '错误信号数', value: summary.value.errors, note: summary.value.errors ? '需要重点关注' : '暂未发现错误' },
  { label: '事件类型数', value: summary.value.byName.length, note: '按名称去重后统计' },
])

const loadSummary = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    summary.value = await fetchEventSummary()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载看板数据失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadSummary()
})
</script>

<style scoped>
.dashboard { display: grid; gap: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: end; gap: 20px; }
.eyebrow { color: var(--accent); font-size: 11px; font-weight: 800; letter-spacing: .14em; }
.page-header h1 { margin: 8px 0 4px; font-size: 36px; }
.page-header p { margin: 0; color: var(--muted); }
.error { color: #b42318; }
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.metric, .panel { background: var(--panel); border: 1px solid var(--line); border-radius: 7px; }
.metric { display: grid; gap: 8px; padding: 20px; }
.metric span, .metric small, .panel-heading > span, .activity-row small { color: var(--muted); }
.metric strong { font-size: 32px; }
.metric small { font-size: 12px; }
.dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.panel { padding: 22px; }
.panel-heading { display: flex; justify-content: space-between; gap: 12px; align-items: start; margin-bottom: 22px; }
.panel-heading h2 { margin: 6px 0 0; font-size: 20px; }
.panel-heading a { color: var(--accent); font-size: 13px; }
.bars, .activity { display: grid; gap: 16px; }
.bar-row { display: grid; grid-template-columns: 150px 1fr 28px; gap: 12px; align-items: center; font-size: 13px; }
.bar-row > div { height: 8px; background: #edf1f4; border-radius: 4px; overflow: hidden; }
.bar-row i { display: block; height: 100%; background: var(--accent); border-radius: 4px; }
.activity-row { display: grid; grid-template-columns: 10px 1fr auto; gap: 10px; align-items: start; }
.signal-dot { width: 8px; height: 8px; margin-top: 5px; border-radius: 50%; background: #3ba77c; }
.signal-dot.error { background: #d64545; }
.activity-row div { display: grid; gap: 4px; }
.activity-row strong { font-size: 13px; }
.activity-row small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px; }
.activity-row time { color: var(--muted); font-size: 11px; }
.empty { color: var(--muted); font-size: 14px; line-height: 1.5; }

@media (max-width: 800px) {
  .metric-grid, .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
  .page-header { align-items: start; flex-direction: column; }
  .bar-row { grid-template-columns: minmax(100px, 150px) 1fr 28px; }
}

@media (max-width: 520px) {
  .metric-grid, .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
