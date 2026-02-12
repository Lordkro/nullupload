import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'

export type Tier = 'free' | 'pro'

interface SubscriptionInfo {
  status: string
  currentPeriodEnd: number
}

interface TierContextValue {
  tier: Tier
  isPro: boolean
  loading: boolean
  subscription: SubscriptionInfo | null
  checkout: () => Promise<void>
  openPortal: () => Promise<void>
  refreshStatus: (sessionId?: string) => Promise<void>
}

const TierContext = createContext<TierContextValue | null>(null)

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>('free')
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)

  const refreshStatus = useCallback(async (sessionId?: string) => {
    try {
      const params = new URLSearchParams()
      if (sessionId) params.set('session_id', sessionId)
      const url = `/api/status${params.toString() ? `?${params}` : ''}`
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error('Status check failed')
      const data = await res.json()
      setTier(data.isPro ? 'pro' : 'free')
      setSubscription(data.subscription ?? null)
    } catch (err) {
      console.error('Failed to check subscription status:', err)
      setTier('free')
      setSubscription(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Check status on mount
  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  const checkout = useCallback(async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Checkout failed')
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Failed to create checkout session:', err)
    }
  }, [])

  const openPortal = useCallback(async () => {
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Portal failed')
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Failed to open customer portal:', err)
    }
  }, [])

  return (
    <TierContext.Provider
      value={{
        tier,
        isPro: tier === 'pro',
        loading,
        subscription,
        checkout,
        openPortal,
        refreshStatus,
      }}
    >
      {children}
    </TierContext.Provider>
  )
}

export function useTier() {
  const ctx = useContext(TierContext)
  if (!ctx) throw new Error('useTier must be used within a TierProvider')
  return ctx
}
