import type {
  MonitorBusEventMap,
  MonitorBusEventName,
} from '../types/internal-events'

type MonitorBusHandler<TName extends MonitorBusEventName> = (
  payload: MonitorBusEventMap[TName],
) => void

const listeners = new Map<
  MonitorBusEventName,//键类型
  //处理函数的集合
  Set<MonitorBusHandler<MonitorBusEventName>>//值类型
>()

export const onMonitorBusEvent = <TName extends MonitorBusEventName>(
  name: TName,
  handler: MonitorBusHandler<TName>,
) => {
  const currentHandlers =
    listeners.get(name) ?? new Set<MonitorBusHandler<MonitorBusEventName>>()

  currentHandlers.add(handler as MonitorBusHandler<MonitorBusEventName>)
  listeners.set(name, currentHandlers)

  //返回取消订阅函数
  return () => {
    offMonitorBusEvent(name, handler)
  }
}

export const offMonitorBusEvent = <TName extends MonitorBusEventName>(
  name: TName,
  handler: MonitorBusHandler<TName>,
) => {
  const currentHandlers = listeners.get(name)

  if (!currentHandlers) {
    return
  }

  currentHandlers.delete(handler as MonitorBusHandler<MonitorBusEventName>)

  if (currentHandlers.size === 0) {
    listeners.delete(name)
  }
}

export const emitMonitorBusEvent = <TName extends MonitorBusEventName>(
  name: TName,
  payload: MonitorBusEventMap[TName],
) => {
  const currentHandlers = listeners.get(name)

  if (!currentHandlers || currentHandlers.size === 0) {
    return
  }

  currentHandlers.forEach((handler) => {
    handler(payload)
  })
}
