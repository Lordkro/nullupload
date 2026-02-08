import { Gauge } from 'lucide-react'
import { useTier } from '../contexts/TierContext'

interface UsageIndicatorProps {
  remaining: number
  dailyLimit: number
  toolName?: string
}

export default function UsageIndicator({ remaining, dailyLimit, toolName }: UsageIndicatorProps) {
  const { isPro } = useTier()

  if (isPro) return null

  const used = dailyLimit - remaining
  const pct = (used / dailyLimit) * 100

  const getColor = () => {
    if (remaining <= 0) return 'text-red-400'
    if (remaining <= 2) return 'text-amber-400'
    return 'text-brand-400'
  }

  const getBgColor = () => {
    if (remaining <= 0) return 'bg-red-500/10 border-red-500/20'
    if (remaining <= 2) return 'bg-amber-500/10 border-amber-500/20'
    return 'bg-brand-500/10 border-brand-500/20'
  }

  const getBarColor = () => {
    if (remaining <= 0) return 'bg-red-500'
    if (remaining <= 2) return 'bg-amber-500'
    return 'bg-brand-500'
  }

  return (
    <div className={`inline-flex items-center gap-3 rounded-xl px-4 py-2.5 border ${getBgColor()} animate-fade-in`}>
      <Gauge className={`w-4 h-4 ${getColor()} shrink-0`} />
      <div className="flex flex-col gap-1 min-w-0">
        <span className={`text-sm font-medium ${getColor()}`}>
          {remaining > 0
            ? `${remaining} of ${dailyLimit} free uses remaining today`
            : `Daily free limit reached${toolName ? ` for ${toolName}` : ''}`}
        </span>
        <div className="w-32 h-1.5 bg-surface-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
