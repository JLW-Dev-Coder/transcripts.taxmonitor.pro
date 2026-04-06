const API_BASE = 'https://api.taxmonitor.pro'

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

export async function getAffiliate(account_id: string): Promise<AffiliateData> {
  const res = await fetch(`${API_BASE}/v1/affiliates/${account_id}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch affiliate data')
  return res.json()
}

export async function getAffiliateEvents(account_id: string): Promise<AffiliateEvent[]> {
  const res = await fetch(`${API_BASE}/v1/affiliates/${account_id}/events`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch affiliate events')
  return res.json()
}

export async function startAffiliateOnboarding(): Promise<{ onboard_url: string }> {
  const res = await fetch(`${API_BASE}/v1/affiliates/connect/onboard`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to start onboarding')
  return res.json()
}

export async function requestPayout(amount: number): Promise<{ payout_id: string; amount: number; status: string }> {
  const res = await fetch(`${API_BASE}/v1/affiliates/payout/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ amount }),
  })
  if (!res.ok) throw new Error('Failed to request payout')
  return res.json()
}

export interface TokenPackage {
  price_id: string
  label: string
  tokens: number
  price: number
  badge?: string
}

export async function getTokenBalance(account_id: string): Promise<{ transcript_tokens: number }> {
  const res = await fetch(`${API_BASE}/v1/tokens/balance/${account_id}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch token balance')
  return res.json()
}

export async function getTokenPricing(): Promise<{ packages: TokenPackage[] }> {
  const res = await fetch(`${API_BASE}/v1/tokens/pricing`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch token pricing')
  return res.json()
}

export async function purchaseTokens(price_id: string): Promise<{ session_url: string }> {
  const res = await fetch(`${API_BASE}/v1/tokens/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ price_id }),
  })
  if (!res.ok) throw new Error('Failed to initiate purchase')
  return res.json()
}
