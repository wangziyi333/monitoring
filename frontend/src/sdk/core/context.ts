import type { MonitorConfig } from '../types/config'
import { createSessionId } from '../utils/id'
//表达为可扩展对象契约，未来可能加入其他属性
export interface MonitorContext {
  appId: string
  sessionId: string
  url: string
}

export const createMonitorContext = (config: MonitorConfig): MonitorContext => ({
  appId: config.appId,
  sessionId: createSessionId(),
  url: window.location.href,
})
// 联合、交叉、元组、条件类型、索引取值
// → 使用 type

// 稳定的对象模型、公开配置、领域实体、对外契约
// → 优先 interface

// 文件内部很小的参数对象
// → 两者都行，遵循项目风格
