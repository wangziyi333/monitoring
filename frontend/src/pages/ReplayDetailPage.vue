<template>
  <div class="replay-page">
    <div class="page-header">
      <div>
        <RouterLink to="/dashboard" class="back-link">返回监控看板</RouterLink>
        <span class="eyebrow">RRWEB 回放</span>
        <h1>Replay 回放详情</h1>
        <p v-if="snapshot">{{ snapshot.replayId }} · {{ snapshot.eventCount }} 条底层事件</p>
      </div>
      <div class="controls" v-if="player">
        <button @click="togglePlayback">{{ playing ? '暂停' : '播放' }}</button>
        <button @click="restartPlayback">重新播放</button>
      </div>
    </div>

    <p v-if="loading" class="state">正在加载 replay...</p>
    <p v-else-if="errorMessage" class="state error">{{ errorMessage }}</p>
    <p v-else-if="!snapshot" class="state">没有找到 replay 数据。</p>

    <section v-else class="panel">
      <div ref="playerHost" class="player-host"></div>
      <div class="marker-panel">
        <div>
          <span class="eyebrow">Timeline markers</span>
          <h2>回放中的监控事件</h2>
        </div>
        <p v-if="activeMarker" class="active-marker">
          播放到：{{ activeMarker.eventName }}
        </p>
        <p v-else class="state">开始播放后，回放中的监控事件会在这里出现。</p>
        <div v-if="playedMarkers.length" class="marker-list">
          <div v-for="marker in playedMarkers" :key="marker.eventId" class="marker-row">
            <strong>{{ marker.eventName }}</strong>
            <small>{{ new Date(marker.timestamp).toLocaleTimeString() }}</small>
          </div>
        </div>
      </div>
      <dl class="metadata">
        <div>
          <dt>Session ID</dt>
          <dd>{{ snapshot.sessionId ?? '暂无' }}</dd>
        </div>
        <div>
          <dt>保留原因</dt>
          <dd>{{ snapshot.retainedReason ?? '暂无' }}</dd>
        </div>
        <div>
          <dt>录制开始</dt>
          <dd>{{ formatDateTime(snapshot.startedAt) }}</dd>
        </div>
        <div>
          <dt>上传时间</dt>
          <dd>{{ snapshot.uploadedAt ? formatDateTime(snapshot.uploadedAt) : '暂无' }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Replayer, ReplayerEvents } from 'rrweb'
import type { eventWithTime } from 'rrweb'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchReplay } from '../api/events'
import type {
  ReplayMonitorMarker,
  ReplaySnapshot,
} from '../sdk/replay/recorder'

const route = useRoute()
const loading = ref(true)
const errorMessage = ref('')
const snapshot = ref<ReplaySnapshot | null>(null)
const playerHost = ref<HTMLElement | null>(null)
let player: ReplayController | null = null
const playing = ref(false)
const activeMarker = ref<ReplayMonitorMarker | null>(null)
const playedMarkers = ref<ReplayMonitorMarker[]>([])

type ReplayController = {
  destroy: () => void
  play: (timeOffset?: number) => void
  pause: (timeOffset?: number) => void
  on: (event: string, handler: (event?: unknown) => void) => ReplayController
}

type ReplayConstructor = new (
  events: eventWithTime[],
  config?: {
    root?: Element
    showWarning?: boolean
    skipInactive?: boolean
  },
) => ReplayController

const Replay = Replayer as unknown as ReplayConstructor
const constructReplay = Reflect.construct as unknown as (
  target: Function,
  args: unknown[],
) => unknown

const formatDateTime = (timestamp: number) => new Date(timestamp).toLocaleString()

const destroyPlayer = () => {
  player?.destroy()
  player = null
  playing.value = false
  activeMarker.value = null
  playedMarkers.value = []
}

const isReplayMonitorMarker = (value: unknown): value is ReplayMonitorMarker => {
  if (!value || typeof value !== 'object') return false

  const marker = value as Partial<ReplayMonitorMarker>  //把ReplayMonitorMarker的所有事件改为可选
  return (
    marker.version === 1 &&
    typeof marker.eventId === 'string' &&
    typeof marker.eventName === 'string' &&
    typeof marker.timestamp === 'number'
  )
}

const mountPlayer = async () => {
  await nextTick()

  if (!snapshot.value || !playerHost.value || !snapshot.value.events.length) {
    return
  }

  destroyPlayer()
  player = constructReplay(Replay, [snapshot.value.events, {
    root: playerHost.value,
    showWarning: false,
    skipInactive: false,
  }]) as ReplayController

  //播放器注册
  player.on(ReplayerEvents.CustomEvent, (rawEvent: unknown) => {
    if (!rawEvent || typeof rawEvent !== 'object') return

    //读取 rrweb custom event 的数据
    const data = (rawEvent as {
      data?: { tag?: unknown; payload?: unknown }
    }).data

    //取出之前写入的marker
    const marker = data?.payload
    if (data?.tag !== 'monitor:event' || !isReplayMonitorMarker(marker)) {
      return
    }

    activeMarker.value = marker
    if (!playedMarkers.value.some((item) => item.eventId === marker.eventId)) {
      playedMarkers.value.push(marker)
    }
  })
}

const togglePlayback = () => {
  if (!player) return

  if (playing.value) {
    player.pause()
  } else {
    player.play()
  }

  playing.value = !playing.value
}

const restartPlayback = () => {
  if (!player) return

  player.pause()
  player.play(0)
  playing.value = true
}

onMounted(async () => {
  const replayId = typeof route.params.replayId === 'string' ? route.params.replayId : ''

  if (!replayId) {
    errorMessage.value = '缺少 replayId'
    loading.value = false
    return
  }

  try {
    snapshot.value = await fetchReplay(replayId)
    await mountPlayer()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载 replay 失败'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  destroyPlayer()
})
</script>

<style scoped>
.replay-page {
  display: grid;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 20px;
}

.back-link,
.replay-page a {
  color: var(--accent);
  font-size: 13px;
}

.back-link {
  display: block;
  margin-bottom: 18px;
}

.eyebrow {
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

h1 {
  margin: 8px 0 4px;
  font-size: 36px;
}

.page-header p,
.state {
  margin: 0;
  color: var(--muted);
}

.controls {
  display: flex;
  gap: 8px;
}

.panel {
  padding: 18px;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 7px;
}

.player-host {
  min-height: 480px;
  overflow: hidden;
  background: #202428;
  border-radius: 5px;
}

.marker-panel {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #f6f8fa;
}

.marker-panel h2 {
  margin: 6px 0 0;
  font-size: 18px;
}

.active-marker {
  margin: 0;
  color: var(--accent);
  font-weight: 700;
}

.marker-list {
  display: grid;
  gap: 8px;
}

.marker-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.marker-row small {
  color: var(--muted);
}

.metadata {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin: 18px 0 0;
}

.metadata div {
  min-width: 0;
}

dt {
  color: var(--muted);
  font-size: 12px;
}

dd {
  margin: 6px 0 0;
  overflow-wrap: anywhere;
  font-size: 13px;
}

.error {
  color: #b42318;
}

@media (max-width: 700px) {
  .page-header {
    align-items: start;
    flex-direction: column;
  }

  .metadata {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .metadata {
    grid-template-columns: 1fr;
  }
}
</style>
