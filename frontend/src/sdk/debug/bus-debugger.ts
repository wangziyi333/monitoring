import { onMonitorBusEvent } from '../core/event-bus'

let teardownBusDebugger: (() => void) | null = null

const formatTarget = (target: Element) => {
  const id = target.id ? `#${target.id}` : ''
  const className =
    typeof target.className === 'string' && target.className.trim()
      ? `.${target.className.trim().split(/\s+/).join('.')}`
      : ''

  return `${target.tagName.toLowerCase()}${id}${className}`
}

export const registerBusDebugger = () => {
  //只在vite开发环境启动调试订阅器，生产环境不注册
  if (!import.meta.env.DEV) {
    return
  }

  teardownBusDebugger?.()

  const teardowns = [
    onMonitorBusEvent('dom:click', ({ target }) => {
      console.info('[bus] dom:click', {
        target: formatTarget(target),
      })
    }),
    onMonitorBusEvent('dom:exposure:enter', ({ exposureId, element, position }) => {
      console.info('[bus] dom:exposure:enter', {
        exposureId,
        target: formatTarget(element),
        position,
      })
    }),
    onMonitorBusEvent('dom:exposure:leave', ({ exposureId }) => {
      console.info('[bus] dom:exposure:leave', {
        exposureId,
      })
    }),
    onMonitorBusEvent('track:click:resolved', ({ definition, payload }) => {
      console.info('[bus] track:click:resolved', {
        name: definition.name,
        subType: definition.subType,
        payload,
      })
    }),
    onMonitorBusEvent('track:exposure:resolved', ({ definition, payload }) => {
      console.info('[bus] track:exposure:resolved', {
        name: definition.name,
        subType: definition.subType,
        payload,
      })
    }),
    onMonitorBusEvent('monitor:event', ({ definition, payload }) => {
      console.info('[bus] monitor:event', {
        name: definition.name,
        type: definition.type,
        payload,
      })
    }),
    onMonitorBusEvent('monitor:event:queued', ({ event }) => {
      console.info('[bus] monitor:event:queued', {
        id: event.id,
        name: event.name,
        timestamp: event.timestamp,
      })
    }),
  ]

  //逐个绑定并保存总解绑函数
  teardownBusDebugger = () => {
    teardowns.forEach((teardown) => {
      teardown()
    })
  }
}
