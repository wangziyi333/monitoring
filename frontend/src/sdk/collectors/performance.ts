import { trackEvent } from '../core/monitor'
import { MonitorEventDefinition } from '../types/events'

//PerformanceEntry可以看作是一个性能条目对象的基类，所有性能条目对象都继承自它
//其所有性能数据都有基础字段：name\entryType\startTime\duration
//ts交叉类型 A+B 因为用了交叉类型所以只能用type断言，不能用instanceof判断
type LayoutShiftEntry = PerformanceEntry & {
  value: number //这次布局偏移的分数
  hadRecentInput: boolean //这次偏移是不是用户刚操作导致的，CLS 只关心“非用户主动操作导致的页面抖动”
}
//如果使用interfece则是
// interface LayoutShiftEntry extends PerformanceEntry {
//   value: number 
//   hadRecentInput: boolean
// }

//performance 浏览器内置
//SPA/单页应用 JS逻辑执行浏览器不产生任何navigation、FCP、LCP 新指标，解决：mark+measure手动埋点
//MPS/多页网站 点链接→浏览器刷新、请求新 HTML → 生成 navigation 性能指标（FCP/LCP/ 页面总加载时长）
export const registerPerformanceCollector = () => {
  const navigationEntry = performance.getEntriesByType(   //主动去查性能数据
    'navigation',
  )[0] as PerformanceNavigationTiming | undefined

  if (navigationEntry) {
    trackEvent(MonitorEventDefinition.Performance.PageNavigationTiming, {
      //DOM树构建完成（但页面元素可能部分还未加载完成），高则HTML体积过大、内联JS过多、DOM节点过多
      domContentLoaded:
        navigationEntry.domContentLoadedEventEnd - navigationEntry.startTime,
      //页面完全加载总耗时
      loadEvent:
        navigationEntry.loadEventEnd - navigationEntry.startTime,
      //服务端接口响应耗时（TTFB + 下载 HTML） 监控后端接口慢、网络传输慢的问题
      response: 
        navigationEntry.responseEnd - navigationEntry.requestStart,
    })
  }

  //兼容性保护 如果当前浏览器不支持 PerformanceObserver，那后面的就别监听了
  if (typeof PerformanceObserver === 'undefined') {
    return
  }

  let latestLcp = 0
  let cumulativeCls = 0

  //FCP 首次内容绘制 只看有内容出现不看是否完整 衡量白屏时长
  //PerformanceObserver每次浏览器性能条目更新 触发回调
  //list是浏览器封装好的中间容器对象，需要通过getEntries()方法获取条目数组
  const paintObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      //判断的原因：paintEntries 里不只一条记录，可能还有：first-paint、first-contentful-paint，需要先筛选
      //FP：页面第一次有东西被画出来的时间（可能只是背景色、骨架屏的一部分）
      //FCP：页面第一次“真正有东西”被画出来的时间（如文字图片等可见元素）
      if (entry.name !== 'first-contentful-paint') {
        continue
      }

      trackEvent(MonitorEventDefinition.Performance.FirstContentfulPaint, {
        value: Math.round(entry.startTime),//取startTime作为FCP的时间戳，为这条性能事件发生的时间点
      })
    }
  })

  //PerformanceObserver 拿增量 entries
  //getEntriesByType() 拿当前快照 entries
  //LCP>=FCP
  //LCP 最大内容绘制 只看主要最大块可见元素内容是否加载完成（单一） 衡量首屏加载时长
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1] as
      | LargestContentfulPaint
      | undefined

    if (!lastEntry || lastEntry.startTime <= latestLcp) {
      return
    }

    latestLcp = lastEntry.startTime

    //Math.round 四舍五入，避免小数点后太多位
    trackEvent(MonitorEventDefinition.Performance.LargestContentfulPaint, {
      value: Math.round(lastEntry.startTime),
      size: Math.round(lastEntry.size ?? 0),
      element: lastEntry.element?.tagName ?? '', //最大块元素的标签名 如DIV/IMG
    })
  })

  //累计布局偏移 衡量页面稳定性，防止用户点击时元素突然移位点错
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const shiftEntry = entry as LayoutShiftEntry

      if (shiftEntry.hadRecentInput) {
        continue
      }

      cumulativeCls += shiftEntry.value

      //数字.toFixed(小数位数) 把数字保留指定位数小数转字符串
      trackEvent(MonitorEventDefinition.Performance.CumulativeLayoutShift, {
        value: Number(shiftEntry.value.toFixed(4)),
        cumulativeValue: Number(cumulativeCls.toFixed(4)),
      })
    }
  })

  //长任务 浏览器主线程执行超过 50ms的任务 衡量页面流畅度，卡顿根源指标
  const longTaskObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      trackEvent(MonitorEventDefinition.Performance.MainThreadLongTask, {
        duration: Math.round(entry.duration),
        startTime: Math.round(entry.startTime),
      })
    }
  })

  try {
    paintObserver.observe({ type: 'paint', buffered: true })   //buffered: true 让浏览器把之前因为注册太晚未获取到的条目也推送过来
  } catch {
    // ignore unsupported entry type
  }

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {
    // ignore unsupported entry type
  }

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true })
  } catch {
    // ignore unsupported entry type
  }

  try {
    longTaskObserver.observe({ type: 'longtask', buffered: true })
  } catch {
    // ignore unsupported entry type
  }

  window.addEventListener('pagehide', () => {
    paintObserver.disconnect()
    lcpObserver.disconnect()
    clsObserver.disconnect()
    longTaskObserver.disconnect()
  })
}
