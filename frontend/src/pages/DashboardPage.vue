<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <span class="eyebrow">监控总览</span>
        <h1>监控看板</h1>
        <p>这里汇总前台商城页、监控 SDK 事件，以及当前 rrweb 回放保留情况。</p>
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
            <span class="eyebrow">事件分布</span>
            <h2>高频事件名称</h2>
          </div>
          <span>最近 200 条事件</span>
        </div>

        <div v-if="summary.byName.length" class="bars">
          <div v-for="item in summary.byName" :key="item.name" class="bar-row">
            <span>{{ item.name }}</span>
            <div>
              <i :style="{ width: `${Math.max(8, (item.count / maxCount) * 100)}%` }"></i>
            </div>
            <strong>{{ item.count }}</strong>
          </div>
        </div>

        <p v-else class="empty">暂时还没有事件数据，先去前台页面触发一些操作吧。</p>
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

      <section class="panel replay-panel">
        <RouterLink
          v-if="replaySummary.latest"
          class="replay-link"
          :to="{ name: 'replay-detail', params: { replayId: replaySummary.latest.replayId } }"
        >
          查看最新回放
        </RouterLink>
        <div class="panel-heading">
          <div>
            <span class="eyebrow">回放元信息</span>
            <h2>当前 replay 保留情况</h2>
          </div>
          <span>rrweb 第一阶段</span>
        </div>

        <div class="replay-metrics">
          <article>
            <span>回放总数</span>
            <strong>{{ replaySummary.total }}</strong>
          </article>
          <article>
            <span>已保留数</span>
            <strong>{{ replaySummary.retained }}</strong>
          </article>
        </div>

        <div v-if="replaySummary.latest" class="replay-latest">
          <div class="replay-row">
            <span>Replay ID</span>
            <strong>{{ replaySummary.latest.replayId }}</strong>
          </div>
          <div class="replay-row">
            <span>Session ID</span>
            <strong>{{ replaySummary.latest.sessionId ?? '暂无' }}</strong>
          </div>
          <div class="replay-row">
            <span>保留原因</span>
            <strong>{{ replaySummary.latest.retainedReason ?? '尚未命中异常' }}</strong>
          </div>
          <div class="replay-row">
            <span>录制事件数</span>
            <strong>{{ replaySummary.latest.eventCount }}</strong>
          </div>
          <div class="replay-row">
            <span>开始时间</span>
            <strong>{{ formatDateTime(replaySummary.latest.startedAt) }}</strong>
          </div>
          <div class="replay-row">
            <span>上传时间</span>
            <strong>{{ replaySummary.latest.uploadedAt ? formatDateTime(replaySummary.latest.uploadedAt) : '尚未上传' }}</strong>
          </div>
        </div>

        <p v-else class="empty">当前还没有 replay 上传记录，先触发一次白屏或错误类异常。</p>

        <div v-if="replays.length" class="replay-list">
          <div v-for="replay in replays" :key="replay.replayId" class="replay-list-row">
            <div>
              <strong>{{ replay.replayId }}</strong>
              <small>{{ replay.retainedReason ?? '未标记异常' }} · {{ replay.eventCount }} 条底层事件</small>
            </div>
            <RouterLink :to="{ name: 'replay-detail', params: { replayId: replay.replayId } }">
              查看
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  fetchEventSummary,
  fetchReplays,
  fetchReplaySummary,
  type EventSummaryResponse,
  type ReplaySummaryItem,
  type ReplaySummaryResponse,
} from '../api/events'

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
const replaySummary = ref<ReplaySummaryResponse>({
  total: 0,
  retained: 0,
  latest: null,
})
const replays = ref<ReplaySummaryItem[]>([])

const maxCount = computed(() =>
  Math.max(1, ...summary.value.byName.map((item) => item.count)),
)

const metrics = computed(() => [
  {
    label: '累计接收事件',
    value: summary.value.total,
    note: '当前事件缓冲区总量',
  },
  {
    label: '曝光事件数',
    value: summary.value.exposures,
    note: '页面曝光与商品曝光',
  },
  {
    label: '错误信号数',
    value: summary.value.errors,
    note: summary.value.errors ? '需要重点关注' : '暂未发现错误',
  },
  {
    label: '事件类型数',
    value: summary.value.byName.length,
    note: '按名称去重后统计',
  },
])

const formatDateTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString()

const loadSummary = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [eventData, replayData, replayList] = await Promise.all([
      fetchEventSummary(),
      fetchReplaySummary(),
      fetchReplays(),
    ])

    summary.value = eventData
    replaySummary.value = replayData
    replays.value = replayList.items
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '加载看板数据失败'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadSummary()
})
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
}

.eyebrow {
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.page-header h1 {
  margin: 8px 0 4px;
  font-size: 36px;
}

.page-header p {
  margin: 0;
  color: var(--muted);
}

.error {
  color: #b42318;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.metric,
.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 7px;
}

.metric {
  display: grid;
  gap: 8px;
  padding: 20px;
}

.metric span,
.metric small,
.panel-heading > span,
.activity-row small {
  color: var(--muted);
}

.metric strong {
  font-size: 32px;
}

.metric small {
  font-size: 12px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.panel {
  padding: 22px;
}

.replay-panel {
  grid-column: 1 / -1;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
  margin-bottom: 22px;
}

.panel-heading h2 {
  margin: 6px 0 0;
  font-size: 20px;
}

.panel-heading a {
  color: var(--accent);
  font-size: 13px;
}

.bars,
.activity,
.replay-latest {
  display: grid;
  gap: 16px;
}

.bar-row {
  display: grid;
  grid-template-columns: 150px 1fr 28px;
  gap: 12px;
  align-items: center;
  font-size: 13px;
}

.bar-row > div {
  height: 8px;
  background: #edf1f4;
  border-radius: 4px;
  overflow: hidden;
}

.bar-row i {
  display: block;
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
}

.activity-row {
  display: grid;
  grid-template-columns: 10px 1fr auto;
  gap: 10px;
  align-items: start;
}

.signal-dot {
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 50%;
  background: #3ba77c;
}

.signal-dot.error {
  background: #d64545;
}

.activity-row div {
  display: grid;
  gap: 4px;
}

.activity-row strong {
  font-size: 13px;
}

.activity-row small {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}

.activity-row time {
  color: var(--muted);
  font-size: 11px;
}

.replay-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.replay-metrics article {
  display: grid;
  gap: 6px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #f6f8fa;
}

.replay-metrics span,
.replay-row span,
.empty {
  color: var(--muted);
}

.replay-metrics strong {
  font-size: 26px;
}

.replay-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 16px;
  align-items: start;
  font-size: 13px;
}

.replay-row strong {
  overflow-wrap: anywhere;
}

.replay-link {
  color: var(--accent);
  font-size: 13px;
}

.replay-list {
  display: grid;
  gap: 10px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.replay-list-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: start;
}

.replay-list-row div {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.replay-list-row strong,
.replay-list-row small {
  overflow-wrap: anywhere;
}

.replay-list-row small {
  color: var(--muted);
}

.empty {
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 800px) {
  .metric-grid,
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-header {
    align-items: start;
    flex-direction: column;
  }

  .bar-row {
    grid-template-columns: minmax(100px, 150px) 1fr 28px;
  }
}

@media (max-width: 520px) {
  .metric-grid,
  .dashboard-grid,
  .replay-metrics {
    grid-template-columns: 1fr;
  }

  .replay-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
