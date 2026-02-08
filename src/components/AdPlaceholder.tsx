import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTier } from '../contexts/TierContext'

interface AdPlaceholderProps {
  /** 'leaderboard' = 728x90, 'rectangle' = 300x250 */
  size?: 'leaderboard' | 'rectangle'
}

export default function AdPlaceholder({ size = 'leaderboard' }: AdPlaceholderProps) {
  const { isPro } = useTier()

  if (isPro) return null

  const sizeClasses = size === 'leaderboard'
    ? 'w-full max-w-[728px] h-[90px]'
    : 'w-full max-w-[300px] h-[250px]'

  return (
    <div className={`mx-auto ${sizeClasses} bg-surface-900/50 border border-surface-800/50 rounded-xl flex flex-col items-center justify-center gap-2`}>
      <span className="text-surface-700 text-xs font-medium tracking-wide uppercase">
        Advertisement
      </span>
      <Link
        to="/pro"
        className="flex items-center gap-1.5 text-xs text-surface-700 hover:text-brand-400 transition"
      >
        <Sparkles className="w-3 h-3" />
        <span>Ad-free with Pro</span>
      </Link>
    </div>
  )
}
