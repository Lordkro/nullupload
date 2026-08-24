interface AdPlaceholderProps {
  /** 'leaderboard' = 728x90, 'rectangle' = 300x250 */
  size?: 'leaderboard' | 'rectangle'
}

export default function AdPlaceholder({ size = 'leaderboard' }: AdPlaceholderProps) {
  const sizeClasses = size === 'leaderboard'
    ? 'w-full max-w-[728px] h-[90px]'
    : 'w-full max-w-[300px] h-[250px]'

  return (
    <div className={`mx-auto ${sizeClasses} bg-surface-900/50 border border-surface-800/50 rounded-xl flex items-center justify-center`}>
      <span className="text-surface-700 text-xs font-medium tracking-wide uppercase">
        Advertisement
      </span>
    </div>
  )
}
