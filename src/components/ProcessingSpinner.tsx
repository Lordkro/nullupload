import { Loader2 } from 'lucide-react'

interface ProcessingSpinnerProps {
  label?: string
  progress?: number
}

export default function ProcessingSpinner({ label = 'Processing…', progress }: ProcessingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
        <div className="absolute inset-0 w-10 h-10 rounded-full bg-brand-400/10 animate-ping" />
      </div>
      <p className="text-surface-200 text-sm font-medium">{label}</p>
      {progress !== undefined && (
        <div className="w-48 h-1.5 bg-surface-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
