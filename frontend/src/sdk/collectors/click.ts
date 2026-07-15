import { trackEvent } from '../core/monitor'
import {
  ConfiguredClickSource,
  MonitorEventDefinition,
} from '../types/events'
import { resolveVisualClickTrack } from './visual-track-config'
//selector漂移->页面改版还命中但命中错了
//动态列表->真实需要业务 ID 或稳定锚点
//敏感信息->真实系统里会做字段白名单、文本截断、敏感词过滤，避免把隐私信息带过去
//配置版本->页面 DOM 改了但平台配置没更新，老配置会污染新版本数据。真实系统会加页面版本、配置版本或发布时间来做隔离。
export const registerClickCollector = () => {
  document.addEventListener('click', (event) => {
    const target = event.target

    if (!(target instanceof Element)) {
      return
    }

    const visualClickTrack = resolveVisualClickTrack(target)

    if (visualClickTrack) {
      trackEvent(visualClickTrack.definition, visualClickTrack.payload)
      return
    }

    const declaredElement = target.closest<HTMLElement>('[data-track]')
    const contentElement =
      declaredElement ?? (target instanceof HTMLElement ? target : null)

    if (!contentElement) {
      return
    }

    const content = contentElement.innerText?.trim().slice(0, 50) ?? ''
    const trackId = declaredElement?.dataset.track?.trim()

    if (declaredElement && trackId) {
      trackEvent(MonitorEventDefinition.Behavior.ConfiguredElementClick, {
        trackId,
        tagName: declaredElement.tagName,
        text: content,
        source: ConfiguredClickSource.Declarative,
        ...getBusinessProperties(declaredElement),
      })
      return
    }

    trackEvent(MonitorEventDefinition.Behavior.DocumentClick, {
      tagName: contentElement.tagName,
      text: content,
      className:
        typeof contentElement.className === 'string'
          ? contentElement.className
          : '',
    })
  })
}

const getBusinessProperties = (element: HTMLElement) => {
  const position = Number(element.dataset.position)
  return {
    ...(element.dataset.productId ? { productId: element.dataset.productId } : {}),
    ...(element.dataset.productName ? { productName: element.dataset.productName } : {}),
    ...(Number.isFinite(position) && position > 0 ? { position } : {}),
  }
}
