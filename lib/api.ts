const API_BASE = 'https://api.taxmonitor.pro'

export class ApiError extends Error {
  status: number
  upgrade_url?: string

  constructor(message: string, status: number, upgrade_url?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.upgrade_url = upgrade_url
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean
}

async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { auth = true, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers as Record<string, string>,
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    credentials: auth ? 'include' : 'omit',
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const msg =
      (body as { error?: string }).error || `API error ${res.status}`
    const upgrade_url = (body as { upgrade_url?: string }).upgrade_url
    throw new ApiError(msg, res.status, upgrade_url)
  }

  return res.json()
}

export interface AffiliateData {
  referral_code: string
  connect_status: string
  balance_pending: number
  balance_paid: number
  referral_url: string
}

export interface AffiliateEvent {
  platform: string
  gross_amount: number
  commission_amount: number
  status: string
  created_at: string
}

export interface TokenPackage {
  price_id: string
  label: string
  tokens: number
  price: number
  badge?: string
}

export const api = {
  // Auth
  requestMagicLink: (email: string, redirectUri?: string) =>
    apiFetch('/v1/auth/magic-link/request', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, redirectUri }),
    }),

  getSession: () =>
    apiFetch<{
      ok: boolean
      session: {
        account_id: string
        email: string
        membership: string
        platform?: string
        expires_at?: string
        referral_code?: string | null
        transcript_tokens?: number
      }
    }>('/v1/auth/session'),

  logout: () =>
    apiFetch('/v1/auth/logout', { method: 'POST' }),

  exchangeHandoffToken: (token: string) =>
    apiFetch<{
      ok: boolean
      sessionId: string
      email: string
    }>(`/v1/auth/handoff/exchange?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    }),

  // Affiliates
  getAffiliate: (account_id: string) =>
    apiFetch<AffiliateData>(`/v1/affiliates/${account_id}`),

  getAffiliateEvents: (account_id: string) =>
    apiFetch<AffiliateEvent[]>(`/v1/affiliates/${account_id}/events`),

  startAffiliateOnboarding: () =>
    apiFetch<{ onboard_url: string }>('/v1/affiliates/connect/onboard', {
      method: 'POST',
    }),

  requestPayout: (amount: number) =>
    apiFetch<{ payout_id: string; amount: number; status: string }>(
      '/v1/affiliates/payout/request',
      {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }
    ),

  // Tokens
  getTokenBalance: (account_id: string) =>
    apiFetch<{ transcript_tokens: number }>(
      `/v1/tokens/balance/${account_id}`
    ),

  getTokenPricing: () =>
    apiFetch<{ packages: TokenPackage[] }>('/v1/tokens/pricing', {
      credentials: 'include',
    }),

  purchaseTokens: (price_id: string) =>
    apiFetch<{ session_url: string }>('/v1/tokens/purchase', {
      method: 'POST',
      body: JSON.stringify({ price_id }),
    }),

  // Support
  createTicket: (data: { subject: string; message: string; priority?: string }) =>
    apiFetch('/v1/support/tickets', {
      method: 'POST',
      body: JSON.stringify({ ...data, platform: 'ttmp' }),
    }),
}

// Named exports for backward compatibility
export const getAffiliate = api.getAffiliate
export const getAffiliateEvents = api.getAffiliateEvents
export const startAffiliateOnboarding = api.startAffiliateOnboarding
export const requestPayout = api.requestPayout
export const getTokenBalance = api.getTokenBalance
export const getTokenPricing = api.getTokenPricing
export const purchaseTokens = api.purchaseTokens
export type { TokenPackage as TokenPackageType }
