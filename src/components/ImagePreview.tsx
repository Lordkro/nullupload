import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface ImagePreviewProps {
  src: string
  label: string
  className?: string
  allowCopy?: boolean
}

export default function ImagePreview({ src, label, className = '', allowCopy = false }: ImagePreviewProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
    <div className={`space-y-2 animate-scale-in ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-surface-700 uppercase tracking-wider">{label}</p>
        {allowCopy && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs font-medium text-surface-200 hover:text-brand-400 transition px-2 py-1 rounded-lg hover:bg-surface-800"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        )}
      </div>
      <div className="bg-surface-900 rounded-xl border border-surface-800 overflow-hidden flex items-center justify-center p-2 min-h-[200px]">
        <img
          src={src}
          alt={label}
          className="max-w-full max-h-[350px] object-contain rounded-lg"
        />
      </div>
    </div>
  )
}
