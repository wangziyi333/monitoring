export interface MonitorConfig {
  appId: string
  reportUrl: string
  pixelReportUrl?: string
  batchSize?: number
  flushInterval?: number
}
//使用interface是如果未来增加可以直接
// interface MonitorConfig {
//   sampleRate?: number
//   debug?: boolean
//   maxRetries?: number
// }
//因此interface 能更明确地表达：这是调用者需要遵守的对象结构契约。
