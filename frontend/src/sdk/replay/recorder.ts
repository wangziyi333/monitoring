import { addCustomEvent, record } from 'rrweb'
import type { eventWithTime } from 'rrweb'
import {
  getCurrentSessionId,
  getReplayId,
  setReplayId,
} from '../core/context'
import type { MonitorConfig } from '../types/config'
import type { MonitorEvent } from '../types/events'
import { createId } from '../utils/id'

export interface ReplayRetentionReason {
  eventName: string
  timestamp: number
}

export interface ReplaySnapshot {
  replayId: string
  sessionId?: string
  startedAt: number
  retainedAt?: number
  retainedReason?: string
  uploadedAt?: number
  eventCount: number
  events: eventWithTime[]
}

export interface ReplayMonitorMarker {
  version: 1  //marker 协议版本，后续结构变化时可以兼容
  eventId: string //和正式监控事件保持一致
  eventName: MonitorEvent['name']
  type: MonitorEvent['type']
  subType: MonitorEvent['subType']
  timestamp: number
  replayId?: string
  payload?: Record<string, string | number | boolean | null>
}

const MAX_BUFFER_SIZE = 200

let stopRecording: ReturnType<typeof record> | null = null
let startedAt = 0
let retainedAt: number | null = null
let retainedReason: string | null = null
let uploadedAt: number | null = null
let replayEvents: eventWithTime[] = []

const startNewReplay = () => {
  setReplayId(createId())
  startedAt = Date.now()
  retainedAt = null
  retainedReason = null
  uploadedAt = null
  replayEvents = []
}

const pushReplayEvent = (event: eventWithTime) => {
  replayEvents.push(event)

  if (replayEvents.length > MAX_BUFFER_SIZE) {
    replayEvents = replayEvents.slice(-MAX_BUFFER_SIZE)
  }
}

//字段数量限制+敏感字段过滤+字符串长度限制+只保留基础类型
const createReplayPayload = (payload: unknown) => {
  //只处理普通对象
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return undefined
  }

  const result: Record<string, string | number | boolean | null> = {}

  //Object.entries 把对象转成 [["key1",val1], ["key2",val2]] 键值对二维数组
  Object.entries(payload as Record<string, unknown>)
    .slice(0, 20) //只保留前二十个
    .forEach(([key, value]) => {
      //test() 是正则表达式 RegExp 对象自带的方法
      //正则.test(待检测字符串)
      //检测目标字符串是否包含正则匹配的内容，返回布尔值：匹配到：true,,没匹配到：false
      if (/password|token|secret/i.test(key)) return

      if (
        value === null ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        result[key] = value
      } else if (typeof value === 'string') {
        result[key] = value.slice(0, 200)
      }
    })

  return Object.keys(result).length ? result : undefined
}

//做安全排除 转换成 rrweb custom event 调用addCustomEvent
export const addReplayMonitorEvent = (event: MonitorEvent) => {
  const replayId = getReplayId()

  //没有正在录制\没有当前replay\事件属于其他replay 直接返回
  if (
    !stopRecording ||
    !replayId ||
    (event.replayId && event.replayId !== replayId)
  ) {
    return
  }

  const marker: ReplayMonitorMarker = {
    version: 1,
    eventId: event.id,
    eventName: event.name,
    type: event.type,
    subType: event.subType,
    timestamp: event.timestamp,
    replayId: event.replayId,
    payload: createReplayPayload(event.payload),
  }

  addCustomEvent('monitor:event', marker)
}

export const startReplayRecording = (config: MonitorConfig) => {
  if (!config.replayEnabled || typeof window === 'undefined') {
    return
  }

  stopReplayRecording()
  startNewReplay()

  stopRecording = record<eventWithTime>({
    emit(event) {
      pushReplayEvent(event)
    },
    maskAllInputs: true,
    blockSelector: '[data-rr-block]',
    recordAfter: 'DOMContentLoaded',
    sampling: {
      mousemove: false,
      mouseInteraction: true,
      scroll: 150,
      input: 'last',
      media: 800,
    },
  })
}

export const stopReplayRecording = () => {
  stopRecording?.()
  stopRecording = null
}

export const markReplayForRetention = (reason: ReplayRetentionReason) => {
  if (!getReplayId()) {
    return
  }

  retainedAt = Date.now()
  retainedReason = reason.eventName
}

export const markReplayUploaded = () => {
  uploadedAt = Date.now()
}

export const getReplaySnapshot = (): ReplaySnapshot | null => {
  const replayId = getReplayId()

  if (!replayId) {
    return null
  }

  return {
    replayId,
    sessionId: getCurrentSessionId(),
    startedAt,
    retainedAt: retainedAt ?? undefined,
    retainedReason: retainedReason ?? undefined,
    uploadedAt: uploadedAt ?? undefined,
    eventCount: replayEvents.length,
    events: [...replayEvents],
  }
}
