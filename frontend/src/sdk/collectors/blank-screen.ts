import type { Router } from 'vue-router'
import { emitMonitorBusEvent } from '../core/event-bus'
import type {
  BlankScreenCheckPhase,
  BlankScreenReason,
} from '../types/events'

const INITIAL_CHECK_DELAY = 1200
const RECHECK_DELAY = 1200
const MIN_TEXT_LENGTH = 2
const MIN_ELEMENT_SIZE = 8
const FALLBACK_TARGET = '.app-main'

//按路由选关键容器-关键业务区
const PAGE_TARGET_SELECTORS: Record<string, string[]> = {
  '/': ['.storefront-hero', '.catalog-section', '.product-grid'],
  '/dashboard': ['.metric-grid', '.dashboard-grid'],
  '/events': ['.event-table', '.event-table__empty'],
  '/tracking': ['.tracking-lab', '.app-main'],
  '/visual-tracking': ['.visual-tracking-page', '.app-main'],
  '/performance': ['.performance-lab', '.app-main'],
  '/errors': ['.error-lab', '.app-main'],
}

//壳子节点白名单排除 存在不能说明页面真的有内容
const SHELL_SELECTOR_LIST = [
  'html',
  'body',
  '#app',
  '.app-shell',
  '.app-main',
  '.page-header',
]

//占位/骨架类关键词
const PLACEHOLDER_KEYWORDS = ['skeleton', 'loading', 'spinner', 'shimmer']

type BlankScreenCheckResult = {
  target: string
  samplePoints: number
  emptyPointCount: number
  reason: BlankScreenReason
}

//防止旧检测结果污染新路由
let currentCheckToken = 0
//第一次检测
let firstTimer: number | null = null
//复检
let secondTimer: number | null = null

const clearPendingTimers = () => {
  if (firstTimer !== null) {
    window.clearTimeout(firstTimer)
    firstTimer = null
  }

  if (secondTimer !== null) {
    window.clearTimeout(secondTimer)
    secondTimer = null
  }
}

//寻找检测目标 有配置按配置找没配置退回.app-main
const getCandidateSelectors = (path: string) =>
  PAGE_TARGET_SELECTORS[path] ?? [FALLBACK_TARGET]

const resolveTargetElement = (path: string) => {
  const selectors = getCandidateSelectors(path)

  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector)

    if (element) {
      return { selector, element }
    }
  }

  return {
    selector: selectors[0] ?? FALLBACK_TARGET,
    element: null,
  }
}

//识别页面外壳
const isShellElement = (element: Element) =>
  //当前元素匹配任意一条SHELL_SELECTOR_LIST则返回true
  SHELL_SELECTOR_LIST.some((selector) => element.matches(selector))

//识别骨架/loading类节点
const isPlaceholderElement = (element: Element) => {
  const className =
    typeof (element as HTMLElement).className === 'string'
      ? (element as HTMLElement).className.toLowerCase()
      : ''

  return PLACEHOLDER_KEYWORDS.some((keyword) => className.includes(keyword))
}

//css不被隐藏且元素不是特别小
const isVisibleElement = (element: HTMLElement) => {
  //获取元素计算后的真实样式 存入变量style
  const style = window.getComputedStyle(element)
  //获取元素视口占位矩形 包含元素在视口中的真实宽高、坐标
  const rect = element.getBoundingClientRect()

  //三种隐藏场景直接返回不可见
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    Number(style.opacity) === 0
  ) {
    return false
  }

  //过滤掉极小元素
  return rect.width >= MIN_ELEMENT_SIZE && rect.height >= MIN_ELEMENT_SIZE
}

//有效内容元素 判断
const hasMeaningfulText = (element: HTMLElement) =>
  (element.textContent ?? '').trim().length >= MIN_TEXT_LENGTH

//判断标准:自身不被css隐藏且是图片\视频\按钮等元素或自身文字长度达到阈值可见
const isEffectiveContentElement = (element: HTMLElement) => {
  if (!isVisibleElement(element)) {
    return false
  }

  if (isShellElement(element) || isPlaceholderElement(element)) {
    return false
  }

  const tagName = element.tagName

  if (
    tagName === 'BUTTON' ||
    tagName === 'A' ||
    tagName === 'IMG' ||
    tagName === 'VIDEO' ||
    tagName === 'CANVAS' ||
    tagName === 'SVG'
  ) {
    return true
  }

  return hasMeaningfulText(element)
}

//采样点生成
const createSamplePoints = (element: HTMLElement) => {
  const rect = element.getBoundingClientRect()
  //有效区域左边界=元素内部右缩12px,最低不超过屏幕最左侧
  const left = Math.max(rect.left + 12, 0)
  //window.innerWidth - 1 是屏幕最右侧有效像素
  const right = Math.min(rect.right - 12, window.innerWidth - 1)
  const top = Math.max(rect.top + 12, 0)
  const bottom = Math.min(rect.bottom - 12, window.innerHeight - 1)
  //Math.min(中心点X, right)：中心点不能超过有效区域右边界
  //Math.max(结果, left)：中心点不能小于有效区域左边界
  const centerX = Math.max(Math.min(rect.left + rect.width / 2, right), left)
  const centerY = Math.max(Math.min(rect.top + rect.height / 2, bottom), top)

  return [
    { x: centerX, y: centerY },
    { x: left, y: top },
    { x: right, y: top },
    { x: left, y: bottom },
    { x: right, y: bottom },
  ]
}

//判断核心函数:
//根据路径捕获到的主要业务元素,判断该元素的所有采集点有几个是空白以及自身是否为骨架/占位
//返回对应selector及空白/总采集点信息及原因 
const evaluateBlankScreen = (path: string): BlankScreenCheckResult => {
  //寻找目标容器
  const { selector, element } = resolveTargetElement(path)

  //找不到返回main_container_missing
  if (!element) {
    return {
      target: selector,
      samplePoints: 0,
      emptyPointCount: 0,
      reason: 'main_container_missing',
    }
  }

  const points = createSamplePoints(element)
  let emptyPointCount = 0
  let onlyShellVisible = true

  //检查每个采样点顶部堆叠元素
  points.forEach(({ x, y }) => {
    //document.elementsFromPoint(x, y)规则:
    //1.返回坐标点底下所有重叠元素：顶层元素在前
    //2.会穿透 pointer-events: none 的元素
    //3.只返回 Element 类型节点，不含纯文本、注释节点
    const stackedElements = document
      .elementsFromPoint(x, y)
      //只保留 HTMLElement，过滤掉 SVGElement、MathMLElement 等非 HTML 标签
      .filter((entry): entry is HTMLElement => entry instanceof HTMLElement)

    const hasEffectiveContent = stackedElements.some((stackedElement) => {
      if (isEffectiveContentElement(stackedElement)) {
        onlyShellVisible = false
        return true
      }

      return false
    })

    if (!hasEffectiveContent) {
      const hasNonShellVisibleElement = stackedElements.some(
        (stackedElement) =>
          //是应该可见的元素且不是占位骨架
          isVisibleElement(stackedElement) &&
          !isShellElement(stackedElement) &&
          !isPlaceholderElement(stackedElement),
      )

      if (hasNonShellVisibleElement) {
        onlyShellVisible = false
      }

      emptyPointCount += 1
    }
  })

  return {
    target: selector,
    samplePoints: points.length,
    emptyPointCount,
    reason: onlyShellVisible ? 'only_shell_visible' : 'no_effective_content',
  }
}

//延迟+二次确认
const scheduleBlankScreenCheck = (
  path: string,
  checkPhase: BlankScreenCheckPhase,
) => {
  currentCheckToken += 1
  const token = currentCheckToken
  const startedAt = Date.now()

  clearPendingTimers()

  firstTimer = window.setTimeout(() => {
    if (token !== currentCheckToken) {
      return
    }

    const firstResult = evaluateBlankScreen(path)

    if (
      firstResult.reason === 'main_container_missing' ||
      firstResult.emptyPointCount === firstResult.samplePoints
    ) {
      secondTimer = window.setTimeout(() => {
        if (token !== currentCheckToken) {
          return
        }

        const secondResult = evaluateBlankScreen(path)

        if (
          secondResult.reason !== 'main_container_missing' &&
          secondResult.emptyPointCount !== secondResult.samplePoints
        ) {
          return
        }

        emitMonitorBusEvent('dom:blank-screen:detected', {
          route: path,
          target: secondResult.target,
          checkPhase,
          samplePoints: secondResult.samplePoints,
          emptyPointCount: secondResult.emptyPointCount,
          duration: Date.now() - startedAt,
          reason: secondResult.reason,
        })
      }, RECHECK_DELAY)
    }
  }, INITIAL_CHECK_DELAY)
}

//注册入口
export const registerBlankScreenCollector = (router?: Router) => {
  scheduleBlankScreenCheck(window.location.pathname, 'initial_load')

  router?.afterEach((to) => {
    scheduleBlankScreenCheck(to.path, 'route_change')
  })

  window.addEventListener(
    'pagehide',
    () => {
      clearPendingTimers()
    },
    { once: true },
  )
}
