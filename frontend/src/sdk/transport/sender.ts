import type { MonitorEvent } from '../types/events'

type SendEventsOptions = {
  useBeacon?: boolean
}

export const sendEvents = async (
  reportUrl: string,
  events: MonitorEvent[],
  options: SendEventsOptions = {},
) => {
  const body = JSON.stringify({ items: events })

  if (options.useBeacon && navigator.sendBeacon) {
    //navigator.sendBeacon页面即将离开时上报最后一批数据
    //请求体大小有限制 自定义请求头能力有限
    const isAccepted = navigator.sendBeacon(
      reportUrl,
      new Blob([body], { type: 'application/json' }),
    )
    //只表示浏览器接受了发送请求，不代表后端已处理成功
    if (isAccepted) {
      return
    }
  }

  //fetch：普通情况上报 支持POST、自定义请求头、批量上报....但页面关闭时不一定能完成请求
  const response = await fetch(reportUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  })

  if (!response.ok) {
    throw new Error(`report failed with status ${response.status}`)
  }
}

//常被当做请求载体
//image 只能走get、payload只能塞进url长度有限、不适合批量和复杂json、不方便带请求头、不适合失败重试离线缓存正式协议
//正常上报：fetch
//页面离开兜底：sendBeacon
//某些兼容/营销像素：image
export const sendEventByImage = (
  reportUrl: string,
  event: MonitorEvent,
) =>
  //返回Promise<void>表示这个异步动作最终成功或失败但失败时无需返回业务数据
  new Promise<void>((resolve, reject) => {
    //创建image对象，目的是触发一个图片请求
    const image = new Image()
    //encodeURIComponent把一段普通字符串转成可以安全放进 URL 查询参数里的字符串
    const payload = encodeURIComponent(JSON.stringify(event))
    //没有拼接其他参数直接用？否则用&拼接在其他参数后面
    const separator = reportUrl.includes('?') ? '&' : '?'
    //onload 本身是一个属性，赋值函数回调会在图片加载成功后执行
    //注意：不代表服务端业务一定处理成功，只是图片请求成功了
   //先绑定后发车，一旦绑定赋值src请求就发送了
    image.onload = () => resolve()
    image.onerror = () => reject(new Error('image report failed'))
    //赋值后浏览器会自动发起图片请求    
    image.src = `${reportUrl}${separator}data=${payload}`
  })
