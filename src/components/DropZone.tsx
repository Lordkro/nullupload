import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImageIcon } from 'lucide-react'

interface DropZoneProps {
  onFiles: (files: File[]) => void
  accept?: Record<string, string[]>
  multiple?: boolean
  label?: string
}

export default function DropZone({ onFiles, accept, multiple = true, label }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) onFiles(accepted)
    },
    [onFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ?? { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.bmp'] },
    multiple,
  })

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 dropzone-glow animate-fade-in ${
        isDragActive
          ? 'border-brand-400 bg-brand-500/10 scale-[1.02] shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]'
          : 'border-surface-700 bg-surface-900/50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragActive
              ? 'bg-brand-500/20 text-brand-400 scale-110'
              : 'bg-surface-800 text-surface-200'
          }`}
        >
          {isDragActive ? (
            <Upload className="w-9 h-9 animate-bounce" />
          ) : (
            <ImageIcon className="w-9 h-9" />
          )}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">
            {isDragActive ? 'Drop it here!' : label || 'Drop images here, or click to select'}
          </p>
          <p className="text-surface-700 text-sm mt-2">
            Supports JPG, PNG, WebP, AVIF{multiple ? ' • Multiple files supported' : ''}
          </p>
        </div>
        {!isDragActive && (
          <div className="mt-2 px-5 py-2.5 bg-surface-800 hover:bg-surface-700 rounded-xl text-sm font-medium text-surface-200 transition">
            Browse files
          </div>
        )}
      </div>
    </div>
  )
}
