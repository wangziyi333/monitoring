import {
  ConfiguredClickSource,
  MonitorEventDefinition,
} from '../types/events'
import {
  type VisualTrackConfigRecord,
  createVisualTrackConfig,
  deleteVisualTrackConfig,
  fetchVisualTrackConfigs,
} from '../../api/visual-track-configs'

//白名单提取是“先定义协议，再按协议取值”；非白名单提取是“页面上有什么，就顺手报什么”

type ConfiguredElementClickDefinition =
  typeof MonitorEventDefinition.Behavior.ConfiguredElementClick

interface VisualClickTrackResult {
  definition: ConfiguredElementClickDefinition
  payload: {
    trackId: string
    tagName: string
    text: string
    source: ConfiguredClickSource
    configId: string
    productId?: string
    productName?: string
    position?: number
  }
}

interface VisualClickTrackConfigBase {
  id: string
  trackId: string
  definition: ConfiguredElementClickDefinition
}

export interface SelectorVisualClickTrackConfig
  extends VisualClickTrackConfigBase {
  mode: 'selector'
  selector: string
}

export interface TrackKeyVisualClickTrackConfig
  extends VisualClickTrackConfigBase {
  mode: 'track_key'
  trackKey: string
}

export type VisualClickTrackConfig =
  | SelectorVisualClickTrackConfig
  | TrackKeyVisualClickTrackConfig

let visualClickTrackConfigs: VisualClickTrackConfig[] = []

//slice 返回了一个原数组的副本，让外部可以安全地读取和操作这些配置，而不会意外污染模块内部的原始数据
export const getVisualClickTrackConfigs = () => visualClickTrackConfigs.slice()

export const setVisualClickTrackConfigs = (
  configs: VisualClickTrackConfig[],
) => {
  visualClickTrackConfigs = configs.slice()
}

export const loadVisualClickTrackConfigs = async () => {
  const response = await fetchVisualTrackConfigs()
  const configs = response.items
    .map((item) => hydrateVisualTrackConfig(item))//把接口记录格式转成SDK内部配置格式，eventName->definition
    .filter((item): item is VisualClickTrackConfig => item !== null)
//item is VisualClickTrackConfig告诉ts如果返回true那么item就是这个类型
  setVisualClickTrackConfigs(configs)
  return configs
}

export const addVisualClickTrackConfig = async (
  config: VisualClickTrackConfig,
) => {
  await createVisualTrackConfig(config)
  return loadVisualClickTrackConfigs()
}

export const removeVisualClickTrackConfig = async (id: string) => {
  await deleteVisualTrackConfig(id)
  return loadVisualClickTrackConfigs()
}

const hydrateVisualTrackConfig = (
  item: VisualTrackConfigRecord,
): VisualClickTrackConfig | null => {
  if (item.eventName !== MonitorEventDefinition.Behavior.ConfiguredElementClick.name) {
    return null
  }

  if (item.mode === 'selector') {
    return {
      id: item.id,
      mode: 'selector',
      selector: item.selector,
      trackId: item.trackId,
      definition: MonitorEventDefinition.Behavior.ConfiguredElementClick,
    }
  }

  return {
    id: item.id,
    mode: 'track_key',
    trackKey: item.trackKey,
    trackId: item.trackId,
    definition: MonitorEventDefinition.Behavior.ConfiguredElementClick,
  }
}

const getMatchedElement = (
  target: Element,
  config: VisualClickTrackConfig,
): HTMLElement | null => {
  if (config.mode === 'track_key') {
    return target.closest<HTMLElement>(`[data-track-key="${config.trackKey}"]`)
  }

  try {
    return target.closest<HTMLElement>(config.selector)
  } catch {
    return null
  }
}

const getConfiguredClickSource = (
  config: VisualClickTrackConfig,
): ConfiguredClickSource => {
  return config.mode === 'track_key'
    ? ConfiguredClickSource.VisualTrackKey
    : ConfiguredClickSource.VisualSelector
}

export const resolveVisualClickTrack = (
  target: Element,
): VisualClickTrackResult | null => {
  for (const config of visualClickTrackConfigs) {
    const matchedElement = getMatchedElement(target, config)

    if (!matchedElement) {
      continue
    }

    return {
      definition: config.definition,
      payload: {
        trackId: config.trackId,
        tagName: matchedElement.tagName,
        text: matchedElement.innerText?.trim().slice(0, 50) ?? '',
        source: getConfiguredClickSource(config),
        configId: config.id,
        ...(matchedElement.dataset.productId ? { productId: matchedElement.dataset.productId } : {}),
        ...(matchedElement.dataset.productName ? { productName: matchedElement.dataset.productName } : {}),
        ...(Number.isFinite(Number(matchedElement.dataset.position)) && Number(matchedElement.dataset.position) > 0
          ? { position: Number(matchedElement.dataset.position) }
          : {}),
      },
    }
  }

  return null
}
