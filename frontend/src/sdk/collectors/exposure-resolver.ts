import { emitMonitorBusEvent, onMonitorBusEvent } from '../core/event-bus'
import { MonitorEventDefinition } from '../types/events'
//resolver用于订阅原始事件和发布解析结果
let teardownExposureResolver: (() => void) | null = null

export const registerExposureResolver = () => {
  //注册前先解绑
  teardownExposureResolver?.()

  const inProgress = new Set<string>()
  const exposed = new Set<string>()

  //订阅卡片进入有效曝光状态
  const stopEnterSubscription = onMonitorBusEvent(
    'dom:exposure:enter',
    ({
      exposureId,
      page,
      pageVersion,
      moduleId,
      productId,
      productName,
      position,
    }) => {
      //避免已经曝光元素重复上报以及正在处理中的重复进入流程
      if (exposed.has(exposureId) || inProgress.has(exposureId)) {
        return
      }

      //标记进入处理流程
      inProgress.add(exposureId)

      const resolvedExposure = {
        definition: MonitorEventDefinition.Behavior.ProductCardExposure,
        payload: {
          page,
          pageVersion,
          moduleId,
          productId,
          productName,
          position,
        },
      } as const

      //先广播“曝光解析完成”再进入正式监控链路
      emitMonitorBusEvent('track:exposure:resolved', resolvedExposure)
      emitMonitorBusEvent('monitor:event', resolvedExposure)

      //处理完毕 从进行中状态移入已曝光状态
      inProgress.delete(exposureId)
      exposed.add(exposureId)
    },
  )

  const stopLeaveSubscription = onMonitorBusEvent(
    'dom:exposure:leave',
    ({ exposureId }) => {
      //如果元素离开有效曝光状态，就从进行中移除
      inProgress.delete(exposureId)
    },
  )

  teardownExposureResolver = () => {
    stopEnterSubscription()
    stopLeaveSubscription()
  }
}
