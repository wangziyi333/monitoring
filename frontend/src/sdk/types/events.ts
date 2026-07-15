export const MonitorEventType = {
  Error: 'error',
  Performance: 'performance',
  Behavior: 'behavior',
  Custom: 'custom',
} as const

export type MonitorEventType =
  (typeof MonitorEventType)[keyof typeof MonitorEventType]

export const MonitorEventSubType = {
  ManualTrack: 'manual_track',
  Click: 'click',
  ConfiguredClick: 'configured_click',
  Exposure: 'exposure',
  PageView: 'page_view',
  PageDwell: 'page_dwell',
  JsError: 'js_error',
  PromiseError: 'promise_error',
  ResourceError: 'resource_error',
  NavigationTiming: 'navigation_timing',
  Paint: 'paint',
  LayoutShift: 'layout_shift',
  LongTask: 'longtask',
} as const

export type MonitorEventSubType =
  (typeof MonitorEventSubType)[keyof typeof MonitorEventSubType]

export const MonitorEventName = {
  ManualButtonClick: 'manual_button_click',
  AddToCart: 'add_to_cart',
  DocumentClick: 'document_click',
  ConfiguredElementClick: 'configured_element_click',
  PageExposure: 'page_exposure',
  ProductCardExposure: 'product_card_exposure',
  RoutePageView: 'route_page_view',
  PageDwellDuration: 'page_dwell_duration',
  WindowError: 'window_error',
  UnhandledRejection: 'unhandled_rejection',
  ResourceLoadFailed: 'resource_load_failed',
  PageNavigationTiming: 'page_navigation_timing',
  FirstContentfulPaint: 'first_contentful_paint',
  LargestContentfulPaint: 'largest_contentful_paint',
  CumulativeLayoutShift: 'cumulative_layout_shift',
  MainThreadLongTask: 'main_thread_long_task',
} as const

export const ConfiguredClickSource = {
  Declarative: 'declarative',
  VisualSelector: 'visual_selector',
  VisualTrackKey: 'visual_track_key',
} as const

export type ConfiguredClickSource =
  (typeof ConfiguredClickSource)[keyof typeof ConfiguredClickSource]

export interface MonitorEventProtocol {
  manual_button_click: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      label: string
    }
  }
  add_to_cart: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      productId: string
      productName: string
      position: number
      quantity: number
      moduleId: string
    }
  }
  document_click: {
    type: typeof MonitorEventType.Behavior
    subType: typeof MonitorEventSubType.Click
    payload: {
      tagName: string
      text: string
      className: string
    }
  }
  configured_element_click: {
    type: typeof MonitorEventType.Behavior
    subType: typeof MonitorEventSubType.ConfiguredClick
    payload: {
      trackId: string
      tagName: string
      text: string
      source: ConfiguredClickSource
      configId?: string
      productId?: string
      productName?: string
      position?: number
    }
  }
  page_exposure: {
    type: typeof MonitorEventType.Behavior
    subType: typeof MonitorEventSubType.Exposure
    payload: {
      page: string
      pageVersion: string
      moduleId: string
    }
  }
  product_card_exposure: {
    type: typeof MonitorEventType.Behavior
    subType: typeof MonitorEventSubType.Exposure
    payload: {
      page: string
      pageVersion: string
      moduleId: string
      productId: string
      productName: string
      position: number
    }
  }
  route_page_view: {
    type: typeof MonitorEventType.Behavior
    subType: typeof MonitorEventSubType.PageView
    payload: {
      to: string
      from: string
    }
  }
  page_dwell_duration: {
    type: typeof MonitorEventType.Behavior
    subType: typeof MonitorEventSubType.PageDwell
    payload: {
      path: string
      duration: number
    }
  }
  window_error: {
    type: typeof MonitorEventType.Error
    subType: typeof MonitorEventSubType.JsError
    payload: {
      message: string
      filename: string
      lineno: number
      colno: number
    }
  }
  unhandled_rejection: {
    type: typeof MonitorEventType.Error
    subType: typeof MonitorEventSubType.PromiseError
    payload: {
      reason: unknown
    }
  }
  resource_load_failed: {
    type: typeof MonitorEventType.Error
    subType: typeof MonitorEventSubType.ResourceError
    payload: {
      tagName: string
      source: string
    }
  }
  page_navigation_timing: {
    type: typeof MonitorEventType.Performance
    subType: typeof MonitorEventSubType.NavigationTiming
    payload: {
      domContentLoaded: number
      loadEvent: number
      response: number
    }
  }
  first_contentful_paint: {
    type: typeof MonitorEventType.Performance
    subType: typeof MonitorEventSubType.Paint
    payload: {
      value: number
    }
  }
  largest_contentful_paint: {
    type: typeof MonitorEventType.Performance
    subType: typeof MonitorEventSubType.Paint
    payload: {
      value: number
      size: number
      element: string
    }
  }
  cumulative_layout_shift: {
    type: typeof MonitorEventType.Performance
    subType: typeof MonitorEventSubType.LayoutShift
    payload: {
      value: number
      cumulativeValue: number
    }
  }
  main_thread_long_task: {
    type: typeof MonitorEventType.Performance
    subType: typeof MonitorEventSubType.LongTask
    payload: {
      duration: number
      startTime: number
    }
  }
}

export type MonitorEventName = keyof MonitorEventProtocol

type MonitorEventDefinitionItem<TName extends MonitorEventName> = {
  type: MonitorEventProtocol[TName]['type']
  subType: MonitorEventProtocol[TName]['subType']
  name: TName
}

export const MonitorEventDefinition = {
  Custom: {
    ManualButtonClick: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.ManualButtonClick,
    },
    AddToCart: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.AddToCart,
    },
  },
  Behavior: {
    DocumentClick: {
      type: MonitorEventType.Behavior,
      subType: MonitorEventSubType.Click,
      name: MonitorEventName.DocumentClick,
    },
    ConfiguredElementClick: {
      type: MonitorEventType.Behavior,
      subType: MonitorEventSubType.ConfiguredClick,
      name: MonitorEventName.ConfiguredElementClick,
    },
    PageExposure: {
      type: MonitorEventType.Behavior,
      subType: MonitorEventSubType.Exposure,
      name: MonitorEventName.PageExposure,
    },
    ProductCardExposure: {
      type: MonitorEventType.Behavior,
      subType: MonitorEventSubType.Exposure,
      name: MonitorEventName.ProductCardExposure,
    },
    RoutePageView: {
      type: MonitorEventType.Behavior,
      subType: MonitorEventSubType.PageView,
      name: MonitorEventName.RoutePageView,
    },
    PageDwellDuration: {
      type: MonitorEventType.Behavior,
      subType: MonitorEventSubType.PageDwell,
      name: MonitorEventName.PageDwellDuration,
    },
  },
  Error: {
    WindowError: {
      type: MonitorEventType.Error,
      subType: MonitorEventSubType.JsError,
      name: MonitorEventName.WindowError,
    },
    UnhandledRejection: {
      type: MonitorEventType.Error,
      subType: MonitorEventSubType.PromiseError,
      name: MonitorEventName.UnhandledRejection,
    },
    ResourceLoadFailed: {
      type: MonitorEventType.Error,
      subType: MonitorEventSubType.ResourceError,
      name: MonitorEventName.ResourceLoadFailed,
    },
  },
  Performance: {
    PageNavigationTiming: {
      type: MonitorEventType.Performance,
      subType: MonitorEventSubType.NavigationTiming,
      name: MonitorEventName.PageNavigationTiming,
    },
    FirstContentfulPaint: {
      type: MonitorEventType.Performance,
      subType: MonitorEventSubType.Paint,
      name: MonitorEventName.FirstContentfulPaint,
    },
    LargestContentfulPaint: {
      type: MonitorEventType.Performance,
      subType: MonitorEventSubType.Paint,
      name: MonitorEventName.LargestContentfulPaint,
    },
    CumulativeLayoutShift: {
      type: MonitorEventType.Performance,
      subType: MonitorEventSubType.LayoutShift,
      name: MonitorEventName.CumulativeLayoutShift,
    },
    MainThreadLongTask: {
      type: MonitorEventType.Performance,
      subType: MonitorEventSubType.LongTask,
      name: MonitorEventName.MainThreadLongTask,
    },
  },
} as const satisfies {//检查上方对象是否匹配以下意向中的结构，但保留它自己的真实推断结果
  Custom: {
    ManualButtonClick: MonitorEventDefinitionItem<'manual_button_click'>
    AddToCart: MonitorEventDefinitionItem<'add_to_cart'>
  }
  Behavior: {
    DocumentClick: MonitorEventDefinitionItem<'document_click'>
    ConfiguredElementClick: MonitorEventDefinitionItem<'configured_element_click'>
    PageExposure: MonitorEventDefinitionItem<'page_exposure'>
    ProductCardExposure: MonitorEventDefinitionItem<'product_card_exposure'>
    RoutePageView: MonitorEventDefinitionItem<'route_page_view'>
    PageDwellDuration: MonitorEventDefinitionItem<'page_dwell_duration'>
  }
  Error: {
    WindowError: MonitorEventDefinitionItem<'window_error'>
    UnhandledRejection: MonitorEventDefinitionItem<'unhandled_rejection'>
    ResourceLoadFailed: MonitorEventDefinitionItem<'resource_load_failed'>
  }
  Performance: {
    PageNavigationTiming: MonitorEventDefinitionItem<'page_navigation_timing'>
    FirstContentfulPaint: MonitorEventDefinitionItem<'first_contentful_paint'>
    LargestContentfulPaint: MonitorEventDefinitionItem<'largest_contentful_paint'>
    CumulativeLayoutShift: MonitorEventDefinitionItem<'cumulative_layout_shift'>
    MainThreadLongTask: MonitorEventDefinitionItem<'main_thread_long_task'>
  }
}

export type TrackEventArgs = {
  [TName in MonitorEventName]: [
    definition: MonitorEventDefinitionItem<TName>,
    payload: MonitorEventProtocol[TName]['payload'],
  ]
}[MonitorEventName]

interface MonitorEventCommon {
  id: string
  timestamp: number
  url: string
  appId: string
  sessionId: string
}

export type MonitorEvent = {
  [TName in MonitorEventName]: MonitorEventCommon & {
    type: MonitorEventProtocol[TName]['type']
    subType: MonitorEventProtocol[TName]['subType']
    name: TName
    payload: MonitorEventProtocol[TName]['payload']
  }
}[MonitorEventName]
