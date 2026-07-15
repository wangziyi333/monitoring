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
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < MIN_VISIBLE_RATIO) {
          return
        }

        const element = entry.target

        if (!(element instanceof HTMLElement)) {
          return
        }

        const exposureId = element.dataset.exposureId?.trim()

        if (!exposureId || exposedProductIds.has(exposureId)) {
          return
        }

        const position = Number(element.dataset.position)

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

        observer.unobserve(element)
      })
    },
    {
      threshold: [MIN_VISIBLE_RATIO],
    },
  )

  const observeProductCards = () => {
    document
      .querySelectorAll<HTMLElement>(`[${EXPOSED_ATTRIBUTE}]`)
      .forEach((element) => observer.observe(element))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observeProductCards, { once: true })
  } else {
    observeProductCards()
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
