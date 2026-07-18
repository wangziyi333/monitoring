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
  BlankScreen: 'blank_screen',
  NavigationTiming: 'navigation_timing',
  Paint: 'paint',
  LayoutShift: 'layout_shift',
  LongTask: 'longtask',
  WebVital: 'web_vital',
} as const

export type MonitorEventSubType =
  (typeof MonitorEventSubType)[keyof typeof MonitorEventSubType]

export const MonitorEventName = {
  ManualButtonClick: 'manual_button_click',
  AddToCart: 'add_to_cart',
  CouponClaimAttempt: 'coupon_claim_attempt',
  CouponClaimValidateFailed: 'coupon_claim_validate_failed',
  CouponClaimRequestSent: 'coupon_claim_request_sent',
  CouponClaimSuccess: 'coupon_claim_success',
  CouponClaimFailed: 'coupon_claim_failed',
  PromoGuideDownloadClick: 'promo_guide_download_click',
  PromoGuideDownloadSuccess: 'promo_guide_download_success',
  PromoGuideDownloadFailed: 'promo_guide_download_failed',
  MarketingChannelPixelFire: 'marketing_channel_pixel_fire',
  DocumentClick: 'document_click',
  ConfiguredElementClick: 'configured_element_click',
  PageExposure: 'page_exposure',
  ProductCardExposure: 'product_card_exposure',
  RoutePageView: 'route_page_view',
  PageDwellDuration: 'page_dwell_duration',
  WindowError: 'window_error',
  UnhandledRejection: 'unhandled_rejection',
  ResourceLoadFailed: 'resource_load_failed',
  BlankScreenSuspected: 'blank_screen_suspected',
  PageNavigationTiming: 'page_navigation_timing',
  FirstContentfulPaint: 'first_contentful_paint',
  LargestContentfulPaint: 'largest_contentful_paint',
  CumulativeLayoutShift: 'cumulative_layout_shift',
  MainThreadLongTask: 'main_thread_long_task',
  WebVitalsInp: 'web_vitals_inp',
  WebVitalsTtfb: 'web_vitals_ttfb',
} as const

export const ConfiguredClickSource = {
  Declarative: 'declarative',
  VisualSelector: 'visual_selector',
  VisualTrackKey: 'visual_track_key',
} as const

export type ConfiguredClickSource =
  (typeof ConfiguredClickSource)[keyof typeof ConfiguredClickSource]

export const WebVitalRating = {
  Good: 'good',
  NeedsImprovement: 'needs-improvement',
  Poor: 'poor',
} as const

export type WebVitalRating =
  (typeof WebVitalRating)[keyof typeof WebVitalRating]

export type WebVitalNavigationType =
  | 'navigate'
  | 'reload'
  | 'back-forward'
  | 'back-forward-cache'
  | 'prerender'
  | 'restore'

export type BlankScreenCheckPhase = 'initial_load' | 'route_change'

export type BlankScreenReason =
  | 'main_container_missing'
  | 'no_effective_content'
  | 'only_shell_visible'

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
  coupon_claim_attempt: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      moduleId: string
      source: string
    }
  }
  coupon_claim_validate_failed: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      moduleId: string
      reason: string
    }
  }
  coupon_claim_request_sent: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      moduleId: string
      phoneTail: string
    }
  }
  coupon_claim_success: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      moduleId: string
      couponCode: string
    }
  }
  coupon_claim_failed: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      moduleId: string
      reason: string
      stage: 'network' | 'business' | 'validation'
    }
  }
  promo_guide_download_click: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      moduleId: string
      fileName: string
    }
  }
  promo_guide_download_success: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      moduleId: string
      fileName: string
    }
  }
  promo_guide_download_failed: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      moduleId: string
      fileName: string
      reason: string
    }
  }
  marketing_channel_pixel_fire: {
    type: typeof MonitorEventType.Custom
    subType: typeof MonitorEventSubType.ManualTrack
    payload: {
      campaignId: string
      placement: string
      target: string
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
  blank_screen_suspected: {
    type: typeof MonitorEventType.Error
    subType: typeof MonitorEventSubType.BlankScreen
    payload: {
      //哪个路由疑似白屏
      route: string
      //检测的是哪个关键容器
      target: string
      //首屏还是切路由后
      checkPhase: BlankScreenCheckPhase
      //采样了几个点
      samplePoints: number
      //其中几个点没有有效内容
      emptyPointCount: number
      //从开始观察到最终判定耗时多久
      duration: number
      //为什么判定它疑似白屏
      reason: BlankScreenReason
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
  web_vitals_inp: {
    type: typeof MonitorEventType.Performance
    subType: typeof MonitorEventSubType.WebVital
    payload: {
      value: number
      delta: number
      rating: WebVitalRating
      metricId: string
      navigationType: WebVitalNavigationType
      entryCount: number
    }
  }
  web_vitals_ttfb: {
    type: typeof MonitorEventType.Performance
    subType: typeof MonitorEventSubType.WebVital
    payload: {
      value: number
      delta: number
      rating: WebVitalRating
      metricId: string
      navigationType: WebVitalNavigationType
      entryCount: number
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
    CouponClaimAttempt: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.CouponClaimAttempt,
    },
    CouponClaimValidateFailed: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.CouponClaimValidateFailed,
    },
    CouponClaimRequestSent: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.CouponClaimRequestSent,
    },
    CouponClaimSuccess: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.CouponClaimSuccess,
    },
    CouponClaimFailed: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.CouponClaimFailed,
    },
    PromoGuideDownloadClick: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.PromoGuideDownloadClick,
    },
    MarketingChannelPixelFire: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.MarketingChannelPixelFire,
    },
    PromoGuideDownloadSuccess: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.PromoGuideDownloadSuccess,
    },
    PromoGuideDownloadFailed: {
      type: MonitorEventType.Custom,
      subType: MonitorEventSubType.ManualTrack,
      name: MonitorEventName.PromoGuideDownloadFailed,
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
    BlankScreenSuspected: {
      type: MonitorEventType.Error,
      subType: MonitorEventSubType.BlankScreen,
      name: MonitorEventName.BlankScreenSuspected,
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
    WebVitalsInp: {
      type: MonitorEventType.Performance,
      subType: MonitorEventSubType.WebVital,
      name: MonitorEventName.WebVitalsInp,
    },
    WebVitalsTtfb: {
      type: MonitorEventType.Performance,
      subType: MonitorEventSubType.WebVital,
      name: MonitorEventName.WebVitalsTtfb,
    },
  },
} as const satisfies {
  Custom: {
    ManualButtonClick: MonitorEventDefinitionItem<'manual_button_click'>
    AddToCart: MonitorEventDefinitionItem<'add_to_cart'>
    CouponClaimAttempt: MonitorEventDefinitionItem<'coupon_claim_attempt'>
    CouponClaimValidateFailed: MonitorEventDefinitionItem<'coupon_claim_validate_failed'>
    CouponClaimRequestSent: MonitorEventDefinitionItem<'coupon_claim_request_sent'>
    CouponClaimSuccess: MonitorEventDefinitionItem<'coupon_claim_success'>
    CouponClaimFailed: MonitorEventDefinitionItem<'coupon_claim_failed'>
    PromoGuideDownloadClick: MonitorEventDefinitionItem<'promo_guide_download_click'>
    MarketingChannelPixelFire: MonitorEventDefinitionItem<'marketing_channel_pixel_fire'>
    PromoGuideDownloadSuccess: MonitorEventDefinitionItem<'promo_guide_download_success'>
    PromoGuideDownloadFailed: MonitorEventDefinitionItem<'promo_guide_download_failed'>
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
    BlankScreenSuspected: MonitorEventDefinitionItem<'blank_screen_suspected'>
  }
  Performance: {
    PageNavigationTiming: MonitorEventDefinitionItem<'page_navigation_timing'>
    FirstContentfulPaint: MonitorEventDefinitionItem<'first_contentful_paint'>
    LargestContentfulPaint: MonitorEventDefinitionItem<'largest_contentful_paint'>
    CumulativeLayoutShift: MonitorEventDefinitionItem<'cumulative_layout_shift'>
    MainThreadLongTask: MonitorEventDefinitionItem<'main_thread_long_task'>
    WebVitalsInp: MonitorEventDefinitionItem<'web_vitals_inp'>
    WebVitalsTtfb: MonitorEventDefinitionItem<'web_vitals_ttfb'>
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
