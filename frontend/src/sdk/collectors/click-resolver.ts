import { emitMonitorBusEvent, onMonitorBusEvent } from '../core/event-bus'
import {
  ConfiguredClickSource,
  MonitorEventDefinition,
} from '../types/events'
import { resolveVisualClickTrack } from './visual-track-config'

let teardownClickResolver: (() => void) | null = null

const getBusinessProperties = (element: HTMLElement) => {
  const position = Number(element.dataset.position)

  return {
    ...(element.dataset.productId ? { productId: element.dataset.productId } : {}),
    ...(element.dataset.productName
      ? { productName: element.dataset.productName }
      : {}),
      //position:n
    ...(Number.isFinite(position) && position > 0 ? { position } : {}),
  }
}

export const registerClickResolver = () => {
  //如果是一个函数就调用解绑 否则什么也不做
  teardownClickResolver?.()

  teardownClickResolver = onMonitorBusEvent('dom:click', ({ target }) => {
    const visualClickTrack = resolveVisualClickTrack(target)

    if (visualClickTrack) {
      emitMonitorBusEvent('track:click:resolved', visualClickTrack)
      emitMonitorBusEvent('monitor:event', visualClickTrack)
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
      const resolvedTrack = {
        definition: MonitorEventDefinition.Behavior.ConfiguredElementClick,
        payload: {
          trackId,
          tagName: declaredElement.tagName,
          text: content,
          source: ConfiguredClickSource.Declarative,
          ...getBusinessProperties(declaredElement),
        },
      } as const

      emitMonitorBusEvent('track:click:resolved', resolvedTrack)
      emitMonitorBusEvent('monitor:event', resolvedTrack)
      return
    }

    const resolvedTrack = {
      definition: MonitorEventDefinition.Behavior.DocumentClick,
      payload: {
        tagName: contentElement.tagName,
        text: content,
        className:
          typeof contentElement.className === 'string'
            ? contentElement.className
            : '',
      },
    } as const

    emitMonitorBusEvent('track:click:resolved', resolvedTrack)
    emitMonitorBusEvent('monitor:event', resolvedTrack)
  })
}
