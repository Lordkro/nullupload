import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type Tier = 'free' | 'pro'

interface TierContextValue {
  tier: Tier
  isPro: boolean
  // Placeholder for future auth integration
  setTier: (tier: Tier) => void
}

const TierContext = createContext<TierContextValue | null>(null)

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTierState] = useState<Tier>('free')

  const setTier = useCallback((newTier: Tier) => {
    setTierState(newTier)
  }, [])

  return (
    <TierContext.Provider value={{ tier, isPro: tier === 'pro', setTier }}>
      {children}
    </TierContext.Provider>
  )
}

export function useTier() {
  const ctx = useContext(TierContext)
  if (!ctx) throw new Error('useTier must be used within a TierProvider')
  return ctx
}
