import { X, Sparkles, Zap, Layers, Ban, Sliders, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

interface UpgradePromptProps {
  onClose: () => void
  toolName?: string
}

const benefits = [
  { icon: Zap, text: 'Unlimited file processing' },
  { icon: Sliders, text: 'Maximum quality settings unlocked' },
  { icon: Layers, text: 'Unlimited batch processing' },
  { icon: Ban, text: 'Ad-free experience' },
  { icon: Sparkles, text: 'Custom export presets' },
]

export default function UpgradePrompt({ onClose, toolName }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-900 border border-surface-800 rounded-2xl max-w-md w-full p-8 animate-scale-in shadow-2xl shadow-brand-500/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-surface-700 hover:text-white hover:bg-surface-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Upgrade to NullUpload{' '}
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Pro
            </span>
          </h2>
          <p className="text-surface-200 text-sm mt-2">
            You've used all your free {toolName ? `${toolName} ` : ''}uses for today.
            Unlock unlimited processing with Pro.
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-3 mb-6">
          {benefits.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-brand-400" />
              </div>
              <span className="text-surface-200">{text}</span>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to="/pro"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-brand-600/25"
          >
            <Sparkles className="w-4 h-4" />
            Learn More About Pro
          </Link>
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 text-surface-200 hover:text-white text-sm py-2.5 rounded-xl hover:bg-surface-800 transition"
          >
            <Clock className="w-4 h-4" />
            Or come back tomorrow — your uses reset at midnight
          </button>
        </div>
      </div>
    </div>
  )
}
