import type { Router } from 'vue-router'
import { emitMonitorBusEvent } from '../core/event-bus'
import { MonitorEventDefinition } from '../types/events'

const PAGE_VERSION = 'storefront-summer-v1'
const PAGE_PATH = '/'
const PAGE_MODULE_ID = 'storefront-home'
const PRODUCT_GRID_MODULE_ID = 'home-popular-products'

const EXPOSED_ATTRIBUTE = 'data-exposure-id'
const MIN_VISIBLE_RATIO = 0.5

//如果列表异步渲染的话，在现有项目代码基础上就需要补充：
//数据渲染完成后重新 observe
// /用 MutationObserver
// /由业务组件在 mounted/updated 时主动注册曝光元素

export const registerExposureCollector = (router?: Router) => {
  queuePageExposure()

  //router.afterEach((to, from, failure) => {跳转完成后逻辑}
  //每次路由切换后再跑一次
  router?.afterEach(() => {
    queuePageExposure()
  })

  if (typeof IntersectionObserver === 'undefined') {
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const element = entry.target

        if (!(element instanceof HTMLElement)) {
          return
        }

        const exposureId = element.dataset.exposureId?.trim()

        if (!exposureId) {
          return
        }

        if (
          !entry.isIntersecting ||
          entry.intersectionRatio < MIN_VISIBLE_RATIO
        ) {
          emitMonitorBusEvent('dom:exposure:leave', { exposureId })
          return
        }

        const position = Number(element.dataset.position)

        if (
          !element.dataset.productId ||
          !element.dataset.productName ||
          !Number.isFinite(position)
        ) {
          return
        }

        emitMonitorBusEvent('dom:exposure:enter', {
          exposureId,
          element,
          page: PAGE_PATH,
          pageVersion: PAGE_VERSION,
          moduleId: PRODUCT_GRID_MODULE_ID,
          productId: element.dataset.productId,
          productName: element.dataset.productName,
          position,
        })
      })
    },
    {
      //表示跨过阈值时触发回调 包括高于->低于及低于->高于
      threshold: [MIN_VISIBLE_RATIO],
    },
  )

  const observeProductCards = () => {
    document
      .querySelectorAll<HTMLElement>(`[${EXPOSED_ATTRIBUTE}]`)
      .forEach((element) => observer.observe(element))
  }

  const queueObserveProductCards = () => {
    //不在 DOM 可能还没稳定时立刻查商品卡片，延后一帧再查
    //requestAnimationFrame 回调通常会插在“浏览器准备绘制”前
    window.requestAnimationFrame(() => {
      observeProductCards()
    })
  }

  if (document.readyState === 'loading') {
    //DOMContentLoaded表示表示：HTML 已经解析完，DOM 树已经构建完成，不等图片、CSS 背景图、字体、视频等资源全部加载完
    document.addEventListener('DOMContentLoaded', queueObserveProductCards, {
      once: true,
    })
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

    const resolvedExposure = {
      definition: MonitorEventDefinition.Behavior.PageExposure,
      payload: {
        page: PAGE_PATH,
        pageVersion: PAGE_VERSION,
        moduleId: PAGE_MODULE_ID,
      },
    } as const

    emitMonitorBusEvent('track:exposure:resolved', resolvedExposure)
    emitMonitorBusEvent('monitor:event', resolvedExposure)
  }, 0)
}
