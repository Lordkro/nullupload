import { Download, CheckCircle2, Loader2, AlertCircle, X, Trash2 } from 'lucide-react'
import { formatFileSize, calcSavings } from '../utils/format'

export interface BatchFile {
  id: string
  original: File
  result?: { blob: Blob; url: string }
  error?: string
  processing: boolean
}

interface BatchFileListProps {
  files: BatchFile[]
  onRemove: (id: string) => void
  onDownloadAll: () => void
  onClear: () => void
  downloadingZip: boolean
}

export default function BatchFileList({
  files,
  onRemove,
  onDownloadAll,
  onClear,
  downloadingZip,
}: BatchFileListProps) {
  const completedCount = files.filter((f) => f.result && !f.error).length
  const totalSavedBytes = files.reduce((acc, f) => {
    if (f.result) return acc + (f.original.size - f.result.blob.size)
    return acc
  }, 0)

  return (
    <div className="bg-surface-900 rounded-2xl border border-surface-800 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-800 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-white font-semibold">
            {completedCount}/{files.length} files processed
          </h3>
          {totalSavedBytes > 0 && (
            <p className="text-emerald-400 text-xs mt-0.5">
              Total saved: {formatFileSize(Math.abs(totalSavedBytes))}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {completedCount > 1 && (
            <button
              onClick={onDownloadAll}
              disabled={downloadingZip}
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              {downloadingZip ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download All (ZIP)
            </button>
          )}
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 text-surface-200 hover:text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-surface-800 transition"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* File list */}
      <div className="divide-y divide-surface-800 max-h-96 overflow-y-auto">
        {files.map((file, index) => (
          <div
            key={file.id}
            className="px-6 py-3 flex items-center gap-4 animate-slide-in-right"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Status icon */}
            <div className="shrink-0">
              {file.processing ? (
                <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
              ) : file.error ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : file.result ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : null}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{file.original.name}</p>
              <div className="flex items-center gap-2 text-xs text-surface-700 mt-0.5">
                <span>{formatFileSize(file.original.size)}</span>
                {file.result && (
                  <>
                    <span>→</span>
                    <span className="text-surface-200">{formatFileSize(file.result.blob.size)}</span>
                    <span
                      className={
                        file.result.blob.size < file.original.size
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }
                    >
                      ({calcSavings(file.original.size, file.result.blob.size)} saved)
                    </span>
                  </>
                )}
                {file.error && <span className="text-red-400">{file.error}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {file.result && (
                <a
                  href={file.result.url}
                  download={file.original.name}
                  className="p-2 rounded-lg hover:bg-surface-800 text-brand-400 transition"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => onRemove(file.id)}
                className="p-2 rounded-lg hover:bg-surface-800 text-surface-700 hover:text-red-400 transition"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
