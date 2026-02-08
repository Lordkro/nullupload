import { formatFileSize, calcSavings } from '../utils/format'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface FileSizeBarProps {
  originalSize: number
  processedSize: number
}

export default function FileSizeBar({ originalSize, processedSize }: FileSizeBarProps) {
  const savings = calcSavings(originalSize, processedSize)
  const ratio = processedSize / originalSize
  const grew = processedSize > originalSize

  return (
    <div className="bg-surface-900 rounded-xl p-5 space-y-3 border border-surface-800 animate-scale-in">
      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="text-surface-700 text-xs uppercase tracking-wider">Original</span>
          <p className="text-white font-semibold">{formatFileSize(originalSize)}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
          grew ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
        }`}>
          {grew ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {grew ? `+${calcSavings(processedSize, originalSize)}` : `-${savings}`}
        </div>
        <div className="text-right">
          <span className="text-surface-700 text-xs uppercase tracking-wider">Processed</span>
          <p className="text-white font-semibold">{formatFileSize(processedSize)}</p>
        </div>
      </div>
      <div className="h-2.5 bg-surface-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${grew ? 'bg-amber-500' : 'bg-emerald-500'}`}
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}
