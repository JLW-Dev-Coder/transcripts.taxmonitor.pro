const API_BASE = 'https://api.virtuallaunch.pro'

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
