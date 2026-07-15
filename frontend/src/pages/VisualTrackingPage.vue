<template>
  <div class="page-grid">
    <DemoCard
      title="可视化埋点配置中心"
      description="这里模拟真实系统里的配置平台：后端保存配置，前端页面增删配置，SDK 拉取配置后在点击时自动命中。"
    >
      <div class="visual-grid">
        <section class="visual-panel">
          <h3>CSS Selector 配置</h3>
          <label class="field">
            <span>selector</span>
            <input v-model="selectorForm.selector" />
          </label>
          <label class="field">
            <span>trackId</span>
            <input v-model="selectorForm.trackId" />
          </label>
          <button :disabled="saving" @click="createSelectorConfig">
            {{ saving ? '保存中...' : '新增 Selector 配置' }}
          </button>
        </section>

        <section class="visual-panel">
          <h3>稳定锚点配置</h3>
          <label class="field">
            <span>trackKey</span>
            <input v-model="trackKeyForm.trackKey" />
          </label>
          <label class="field">
            <span>trackId</span>
            <input v-model="trackKeyForm.trackId" />
          </label>
          <button :disabled="saving" @click="createTrackKeyConfig">
            {{ saving ? '保存中...' : '新增 Track Key 配置' }}
          </button>
        </section>
      </div>

      <p v-if="toast" :class="['visual-toast', toast.type]">{{ toast.text }}</p>

      <div class="config-list">
        <article v-for="item in configs" :key="item.id" class="config-item">
          <div>
            <strong>{{ item.trackId }}</strong>
            <p class="config-meta">
              {{ item.mode === 'selector' ? item.selector : `data-track-key=${item.trackKey}` }}
            </p>
          </div>
          <button class="config-delete" :disabled="saving" @click="removeConfig(item.id)">
            删除
          </button>
        </article>
      </div>
    </DemoCard>

    <DemoCard
      title="可视化命中预览"
      description="点击下面的元素后回到事件中心刷新，你会看到 source 分别变成 visual_selector、visual_track_key、declarative。"
    >
      <section class="preview-group">
        <h3>Selector 模式预览</h3>
        <div class="product-actions">
          <button data-track="buy-now" @click="showToast('已点击 Selector 预览按钮：商品操作第一个按钮。')">商品操作第一个按钮</button>
          <button data-track="collect" @click="showToast('已点击 Selector 预览按钮：商品操作第二个按钮。')">商品操作第二个按钮</button>
        </div>
        <p class="preview-tip">
          默认种子配置是 <code>.product-actions &gt; button:nth-child(1)</code>，也就是命中这里的第一个按钮。
        </p>
      </section>

      <section class="preview-group">
        <h3>Track Key 模式预览</h3>
        <div class="banner-strip">
          <button data-track-key="banner-buy-now" @click="showToast('已点击 Track Key 预览按钮：Banner 立即购买。')">Banner 立即购买</button>
          <button data-track-key="banner-learn-more" @click="showToast('已点击 Track Key 预览按钮：Banner 了解更多。')">Banner 了解更多</button>
        </div>
        <p class="preview-tip">
          默认种子配置是 <code>trackKey=banner-buy-now</code>，它不依赖 DOM 层级，更适合长期稳定使用。
        </p>
      </section>
    </DemoCard>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import DemoCard from '../components/DemoCard.vue'
import type { VisualClickTrackConfig } from '../sdk/collectors/visual-track-config'
import {
  addVisualClickTrackConfig,
  loadVisualClickTrackConfigs,
  removeVisualClickTrackConfig,
} from '../sdk/collectors/visual-track-config'
import { MonitorEventDefinition } from '../sdk/types/events'

type ToastKind = 'success' | 'error'

const configs = ref<VisualClickTrackConfig[]>([])
const saving = ref(false)
const toast = ref<{ text: string; type: ToastKind } | null>(null)
let toastTimer: number | undefined

const selectorForm = ref({
  selector: '.product-actions > button:nth-child(1)',
  trackId: 'visual-selector-buy-now',
})

const trackKeyForm = ref({
  trackKey: 'banner-buy-now',
  trackId: 'visual-track-key-buy-now',
})

const showToast = (text: string, type: ToastKind = 'success') => {
  if (toastTimer !== undefined) {
    window.clearTimeout(toastTimer)
  }

  toast.value = { text, type }
  toastTimer = window.setTimeout(() => {
    toast.value = null
  }, 2200)
}

const refreshConfigs = async () => {
  configs.value = await loadVisualClickTrackConfigs()
}

const createSelectorConfig = async () => {
  saving.value = true

  try {
    await addVisualClickTrackConfig({
      id: `selector-${Date.now()}`,
      mode: 'selector',
      selector: selectorForm.value.selector.trim(),
      trackId: selectorForm.value.trackId.trim(),
      definition: MonitorEventDefinition.Behavior.ConfiguredElementClick,
    })
    showToast('Selector 配置已保存并同步到 SDK。')
    await refreshConfigs()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '保存 Selector 配置失败', 'error')
  } finally {
    saving.value = false
  }
}

const createTrackKeyConfig = async () => {
  saving.value = true

  try {
    await addVisualClickTrackConfig({
      id: `track-key-${Date.now()}`,
      mode: 'track_key',
      trackKey: trackKeyForm.value.trackKey.trim(),
      trackId: trackKeyForm.value.trackId.trim(),
      definition: MonitorEventDefinition.Behavior.ConfiguredElementClick,
    })
    showToast('Track Key 配置已保存并同步到 SDK。')
    await refreshConfigs()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '保存 Track Key 配置失败', 'error')
  } finally {
    saving.value = false
  }
}

const removeConfig = async (id: string) => {
  saving.value = true

  try {
    await removeVisualClickTrackConfig(id)
    showToast('配置已删除并同步到 SDK。')
    await refreshConfigs()
  } catch (error) {
    showToast(error instanceof Error ? error.message : '删除配置失败', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void refreshConfigs()
})

onBeforeUnmount(() => {
  if (toastTimer !== undefined) {
    window.clearTimeout(toastTimer)
  }
})
</script>

<style scoped>
.visual-grid {
  display: grid;
  gap: 16px;
}

.visual-panel {
  display: grid;
  gap: 12px;
  padding: 18px;
  border: 1px solid rgba(220, 207, 187, 0.9);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.58);
}

.field {
  display: grid;
  gap: 6px;
}

.field input {
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.85);
  color: var(--text);
}

.visual-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  margin: 0;
  padding: 13px 16px;
  border-radius: 999px;
  background: var(--navy);
  color: #fff;
  box-shadow: var(--shadow);
  z-index: 20;
}

.visual-toast.error {
  background: #9e5030;
}

.config-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.config-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid rgba(220, 207, 187, 0.9);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.64);
}

.config-meta {
  margin: 6px 0 0;
  color: var(--muted);
}

.config-delete {
  background: #9e5030;
}

.preview-group {
  display: grid;
  gap: 12px;
}

.banner-strip,
.product-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.preview-tip {
  color: var(--muted);
}
</style>
