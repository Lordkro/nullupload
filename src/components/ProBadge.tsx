import { Lock, Sparkles } from 'lucide-react'

interface ProBadgeProps {
  /** 'inline' = small inline badge, 'overlay' = overlay on a disabled area */
  variant?: 'inline' | 'overlay'
  label?: string
}

export default function ProBadge({ variant = 'inline', label }: ProBadgeProps) {
  if (variant === 'overlay') {
    return (
      <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10">
        <div className="flex items-center gap-2 bg-surface-900/90 border border-brand-500/30 rounded-full px-4 py-2">
          <Lock className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-sm font-medium bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            {label || 'Pro'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-brand-500/15 to-purple-500/15 border border-brand-500/25 rounded-full px-2.5 py-0.5 text-xs font-semibold">
      <Sparkles className="w-3 h-3 text-brand-400" />
      <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
        Pro
      </span>
    </span>
  )
}
