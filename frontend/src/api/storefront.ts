export interface ClaimCouponRequest {
  name: string
  phone: string
}

export interface ClaimCouponResponse {
  ok: true
  couponCode: string
  message: string
}

export class StorefrontApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.status = status
    this.name = 'StorefrontApiError'
  }
}

export const claimCoupon = async (payload: ClaimCouponRequest) => {
  const response = await fetch('/api/coupon/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as
    | Partial<ClaimCouponResponse> & { message?: string }
    | null

  if (!response.ok || data?.ok !== true || typeof data.couponCode !== 'string') {
    throw new StorefrontApiError(
      typeof data?.message === 'string'
        ? data.message
        : `claim coupon failed with status ${response.status}`,
      response.status,
    )
  }

  return data as ClaimCouponResponse
}

export const downloadPromoGuide = async () => {
  const response = await fetch('/api/downloads/promo-guide')

  if (!response.ok) {
    throw new StorefrontApiError(
      `download promo guide failed with status ${response.status}`,
      response.status,
    )
  }

  return response.blob()
}
