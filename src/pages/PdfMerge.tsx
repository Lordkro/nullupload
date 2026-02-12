import { useState, useCallback, useRef, useEffect } from 'react'
import { GripVertical, FileText, Trash2, Plus } from 'lucide-react'
import DropZone from '../components/DropZone'
import PrivacyBadge from '../components/PrivacyBadge'
import FileSizeBar from '../components/FileSizeBar'
import DownloadButton from '../components/DownloadButton'
import ToastContainer from '../components/ToastContainer'
import ProcessingSpinner from '../components/ProcessingSpinner'
import UsageIndicator from '../components/UsageIndicator'
import UpgradePrompt from '../components/UpgradePrompt'
import AdPlaceholder from '../components/AdPlaceholder'
import { useToast } from '../hooks/useToast'
import { useSEO } from '../hooks/useSEO'
import { useUsageLimits } from '../hooks/useUsageLimits'
import { formatFileSize } from '../utils/format'

const TOOL_ID = 'pdf-merge'

interface PdfEntry {
  id: string
  file: File
  pageCount: number | null
}

export default function PdfMerge() {
  useSEO({
    title: 'Free Online PDF Merger — No Upload Required | NullUpload',
    description:
      'Merge multiple PDF files into one — 100% in your browser. No uploads, no servers, no tracking. Drag, drop, reorder, and download.',
    canonical: 'https://nullupload.dev/pdf/merge',
  })

  const { remaining, dailyLimit, limitReached, recordUsage, canProcess } =
    useUsageLimits(TOOL_ID)

  const [entries, setEntries] = useState<PdfEntry[]>([])
  const [merging, setMerging] = useState(false)
  const [result, setResult] = useState<{ url: string; size: number } | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  // Drag-and-drop reorder state
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url)
    }
  }, [result])

  const loadPageCount = async (file: File): Promise<number> => {
    const { loadPdfDocument } = await import('../utils/pdf')
    const doc = await loadPdfDocument(file)
    const count = doc.numPages
    doc.destroy()
    return count
  }

  const handleFiles = useCallback(
    async (incoming: File[]) => {
      const pdfs = incoming.filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
      )
      if (pdfs.length === 0) {
        addToast('Please select PDF files only.', 'warning')
        return
      }

      if (limitReached) {
        setShowUpgrade(true)
        return
      }

      // Clear previous result
      if (result?.url) URL.revokeObjectURL(result.url)
      setResult(null)

      const newEntries: PdfEntry[] = pdfs.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        pageCount: null,
      }))
      setEntries((prev) => [...prev, ...newEntries])

      // Load page counts in background
      for (const entry of newEntries) {
        try {
          const count = await loadPageCount(entry.file)
          setEntries((prev) =>
            prev.map((e) => (e.id === entry.id ? { ...e, pageCount: count } : e)),
          )
        } catch {
          addToast(`Could not read ${entry.file.name}`, 'error')
          setEntries((prev) => prev.filter((e) => e.id !== entry.id))
        }
      }
    },
    [limitReached, addToast, result],
  )

  const handleRemove = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  const handleClear = () => {
    setEntries([])
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    const items = [...entries]
    const [removed] = items.splice(dragItem.current, 1)
    items.splice(dragOverItem.current, 0, removed)
    setEntries(items)
    dragItem.current = null
    dragOverItem.current = null
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  const handleMerge = async () => {
    if (entries.length < 2) {
      addToast('Add at least 2 PDFs to merge.', 'warning')
      return
    }

    if (!canProcess(1)) {
      setShowUpgrade(true)
      return
    }

    const success = recordUsage(1)
    if (!success) {
      setShowUpgrade(true)
      return
    }

    setMerging(true)
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const merged = await PDFDocument.create()

      for (const entry of entries) {
        const bytes = await entry.file.arrayBuffer()
        const doc = await PDFDocument.load(bytes)
        const pages = await merged.copyPages(doc, doc.getPageIndices())
        for (const page of pages) {
          merged.addPage(page)
        }
      }

      const pdfBytes = await merged.save()
      const blob = new Blob([pdfBytes.buffer as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setResult({ url, size: blob.size })
      addToast('PDFs merged successfully!', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Merge failed'
      addToast(`Merge failed: ${msg}`, 'error')
    } finally {
      setMerging(false)
    }
  }

  const totalOriginalSize = entries.reduce((sum, e) => sum + e.file.size, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 page-enter">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">PDF Merge</h1>
        <p className="text-surface-200 mb-4">
          Combine multiple PDF files into one document. Drag to reorder, then merge.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <PrivacyBadge />
          <UsageIndicator remaining={remaining} dailyLimit={dailyLimit} toolName="PDF Merge" />
        </div>
      </div>

      <DropZone
        onFiles={handleFiles}
        accept={{ 'application/pdf': ['.pdf'] }}
        multiple
        label="Drop PDF files here to merge"
      />

      <div className="mt-6">
        <AdPlaceholder size="leaderboard" />
      </div>

      {entries.length > 0 && (
        <div className="space-y-6 mt-6">
          {/* File list with reorder */}
          <div className="bg-surface-900 rounded-2xl border border-surface-800 divide-y divide-surface-800 animate-fade-in">
            <div className="px-6 py-3 flex items-center justify-between">
              <span className="text-sm font-medium text-surface-200">
                {entries.length} PDF{entries.length !== 1 ? 's' : ''} •{' '}
                {formatFileSize(totalOriginalSize)}
              </span>
              <button
                onClick={handleClear}
                className="text-sm text-surface-700 hover:text-red-400 transition"
              >
                Clear all
              </button>
            </div>
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-3 px-6 py-3 hover:bg-surface-800/50 cursor-grab active:cursor-grabbing transition"
              >
                <GripVertical className="w-4 h-4 text-surface-700 shrink-0" />
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{entry.file.name}</p>
                  <p className="text-surface-700 text-xs">
                    {formatFileSize(entry.file.size)}
                    {entry.pageCount !== null && ` • ${entry.pageCount} page${entry.pageCount !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="p-1.5 rounded-lg text-surface-700 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add more button */}
          <button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.pdf,application/pdf'
              input.multiple = true
              input.onchange = (e) => {
                const files = Array.from((e.target as HTMLInputElement).files || [])
                if (files.length > 0) handleFiles(files)
              }
              input.click()
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-surface-700 text-surface-200 hover:border-brand-500/30 hover:text-brand-400 transition"
          >
            <Plus className="w-4 h-4" />
            Add more PDFs
          </button>

          {merging ? (
            <ProcessingSpinner label="Merging PDFs…" />
          ) : (
            <button
              onClick={handleMerge}
              disabled={entries.length < 2}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-brand-600/20"
            >
              Merge {entries.length} PDF{entries.length !== 1 ? 's' : ''}
            </button>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              <FileSizeBar originalSize={totalOriginalSize} processedSize={result.size} />
              <div className="flex flex-wrap gap-3">
                <DownloadButton
                  href={result.url}
                  filename="merged.pdf"
                  label="Download Merged PDF"
                />
                <button
                  onClick={handleClear}
                  className="px-5 py-3 rounded-xl border border-surface-700 text-surface-200 hover:bg-surface-800 transition font-medium"
                >
                  Merge more
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} toolName="PDF Merge" />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
