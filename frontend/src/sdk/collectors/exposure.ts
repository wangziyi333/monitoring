import { trackEvent } from '../core/monitor'
import { MonitorEventDefinition } from '../types/events'

const PAGE_VERSION = 'storefront-summer-v1'
const PAGE_PATH = '/'
const PAGE_MODULE_ID = 'storefront-home'
const PRODUCT_GRID_MODULE_ID = 'home-popular-products'

const EXPOSED_ATTRIBUTE = 'data-exposure-id'
const MIN_VISIBLE_RATIO = 0.5

export const registerExposureCollector = () => {
  queuePageExposure()

  if (typeof IntersectionObserver === 'undefined') {
    return
  }

  const exposedProductIds = new Set<string>()
  const observer = new IntersectionObserver(
    //回调函数，被观察元素与视口的交叉状态发生变化时会触发
    (entries) => {
      entries.forEach((entry) => {
        //isIntersecting表示元素当前是否与视口相交
        //intersectionRatio表示元素可见面积占自身总面积的比例
        if (!entry.isIntersecting || entry.intersectionRatio < MIN_VISIBLE_RATIO) {
          return
        }

        const element = entry.target

        if (!(element instanceof HTMLElement)) {
          return
        }

        const exposureId = element.dataset.exposureId?.trim()

        //避免重复或无效上报
        if (!exposureId || exposedProductIds.has(exposureId)) {
          return
        }

        const position = Number(element.dataset.position)

        //数据完整性校验：Number.isFinite(position)是否是有效数字
        if (!element.dataset.productId || !element.dataset.productName || !Number.isFinite(position)) {
          return
        }

        exposedProductIds.add(exposureId)

        trackEvent(MonitorEventDefinition.Behavior.ProductCardExposure, {
          page: PAGE_PATH,
          pageVersion: PAGE_VERSION,
          moduleId: PRODUCT_GRID_MODULE_ID,
          productId: element.dataset.productId,
          productName: element.dataset.productName,
          position,
        })

        //防止重复上报
        observer.unobserve(element)
      })
    },
    //配置项
    {
      //指定一个可见度阈值数组，只有当元素可见面积达到 50% 时，回调才会执行
      threshold: [MIN_VISIBLE_RATIO],
    },
  )

  //挂载监听器
  const observeProductCards = () => {
    //属性选择器(`[${EXPOSED_ATTRIBUTE}]`)=>'[data-exposure-id]'=>选择带有该属性的html元素
    document
      .querySelectorAll<HTMLElement>(`[${EXPOSED_ATTRIBUTE}]`)
      .forEach((element) => observer.observe(element))
  }

  const queueObserveProductCards = () => {
    window.requestAnimationFrame(() => {
      observeProductCards()
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', queueObserveProductCards, { once: true })
  } else {
    queueObserveProductCards()
  }

  window.addEventListener(
    'pagehide',
    () => {
      observer.disconnect()
    },
    { once: true },
  )
}

const queuePageExposure = () => {
  window.setTimeout(() => {
    if (window.location.pathname !== PAGE_PATH) {
      return
    }

    trackEvent(MonitorEventDefinition.Behavior.PageExposure, {
      page: PAGE_PATH,
      pageVersion: PAGE_VERSION,
      moduleId: PAGE_MODULE_ID,
    })
  }, 0)
}
