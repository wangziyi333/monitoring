import type {
  MonitorEvent,
  MonitorEventName,
  MonitorEventProtocol,
} from './events'

//把trackEvent(definition, payload) 的两个参数，包成了一个对象
//更适合在bus上传递
type MonitorTrackRequestItem<TName extends MonitorEventName> = {
  definition: {
    type: MonitorEventProtocol[TName]['type']
    subType: MonitorEventProtocol[TName]['subType']
    name: TName
  }
  payload: MonitorEventProtocol[TName]['payload']
}

export type MonitorTrackRequest = {
  [TName in MonitorEventName]: MonitorTrackRequestItem<TName>
}[MonitorEventName]

export interface MonitorBusEventMap {
  'dom:click': {
    target: Element
  }
  'dom:blank-screen:detected': {
    route: string
    target: string
    checkPhase: 'initial_load' | 'route_change'
    samplePoints: number
    emptyPointCount: number
    duration: number
    reason:
      | 'main_container_missing'
      | 'no_effective_content'
      | 'only_shell_visible'
  }
  'dom:exposure:enter': {
    exposureId: string
    element: HTMLElement
    page: string
    pageVersion: string
    moduleId: string
    productId: string
    productName: string
    position: number
  }
  'dom:exposure:leave': {
    exposureId: string
  }
  'track:click:resolved': MonitorTrackRequest
  'track:blank-screen:resolved': MonitorTrackRequest
  'track:exposure:resolved': MonitorTrackRequest
  'monitor:event': MonitorTrackRequest
  'monitor:event:queued': {
    event: MonitorEvent
  }
}

export type MonitorBusEventName = keyof MonitorBusEventMap
