import { useState, useCallback, useEffect } from 'react'
import { FileText, Check } from 'lucide-react'
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

const TOOL_ID = 'pdf-split'

interface PageInfo {
  num: number
  thumbnail: string | null
  selected: boolean
}

export default function PdfSplit() {
  useSEO({
    title: 'Free Online PDF Splitter — Extract Pages, No Upload | NullUpload',
    description:
      'Split and extract pages from PDF files — 100% in your browser. Select pages or ranges, download a new PDF. No uploads, no servers.',
    canonical: 'https://nullupload.dev/pdf/split',
  })

  const { remaining, dailyLimit, limitReached, recordUsage, canProcess } =
    useUsageLimits(TOOL_ID)

  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PageInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [splitting, setSplitting] = useState(false)
  const [rangeInput, setRangeInput] = useState('')
  const [result, setResult] = useState<{ url: string; size: number } | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url)
    }
  }, [result])

  const handleFiles = useCallback(
    async (incoming: File[]) => {
      const pdf = incoming.find(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
      )
      if (!pdf) {
        addToast('Please select a PDF file.', 'warning')
        return
      }

      if (limitReached) {
        setShowUpgrade(true)
        return
      }

      if (result?.url) URL.revokeObjectURL(result.url)
      setResult(null)
      setFile(pdf)
      setLoading(true)
      setPages([])
      setRangeInput('')

      try {
        const { loadPdfDocument, renderPageThumbnail } = await import('../utils/pdf')
        const doc = await loadPdfDocument(pdf)
        const pageInfos: PageInfo[] = []

        for (let i = 1; i <= doc.numPages; i++) {
          let thumb: string | null = null
          try {
            thumb = await renderPageThumbnail(doc, i, 120)
          } catch {
            // thumbnail failed, that's okay
          }
          pageInfos.push({ num: i, thumbnail: thumb, selected: true })
        }

        doc.destroy()
        setPages(pageInfos)
        setRangeInput(`1-${pageInfos.length}`)
      } catch {
        addToast('Failed to read PDF.', 'error')
        setFile(null)
      } finally {
        setLoading(false)
      }
    },
    [limitReached, addToast, result],
  )

  const togglePage = (num: number) => {
    setPages((prev) => prev.map((p) => (p.num === num ? { ...p, selected: !p.selected } : p)))
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  const selectAll = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: true })))
    setRangeInput(`1-${pages.length}`)
  }

  const selectNone = () => {
    setPages((prev) => prev.map((p) => ({ ...p, selected: false })))
    setRangeInput('')
  }

  const parseRanges = (input: string, max: number): Set<number> => {
    const result = new Set<number>()
    const parts = input.split(',').map((s) => s.trim())
    for (const part of parts) {
      if (!part) continue
      const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/)
      if (rangeMatch) {
        const start = Math.max(1, parseInt(rangeMatch[1]))
        const end = Math.min(max, parseInt(rangeMatch[2]))
        for (let i = start; i <= end; i++) result.add(i)
      } else {
        const num = parseInt(part)
        if (!isNaN(num) && num >= 1 && num <= max) result.add(num)
      }
    }
    return result
  }

  const applyRanges = () => {
    const selected = parseRanges(rangeInput, pages.length)
    setPages((prev) => prev.map((p) => ({ ...p, selected: selected.has(p.num) })))
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  const handleSplit = async () => {
    const selectedPages = pages.filter((p) => p.selected)
    if (selectedPages.length === 0) {
      addToast('Select at least one page.', 'warning')
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

    setSplitting(true)
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const bytes = await file!.arrayBuffer()
      const srcDoc = await PDFDocument.load(bytes)
      const newDoc = await PDFDocument.create()

      const indices = selectedPages.map((p) => p.num - 1) // 0-indexed
      const copiedPages = await newDoc.copyPages(srcDoc, indices)
      for (const page of copiedPages) {
        newDoc.addPage(page)
      }

      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes.buffer as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setResult({ url, size: blob.size })
      addToast(
        `Extracted ${selectedPages.length} page${selectedPages.length !== 1 ? 's' : ''}!`,
        'success',
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Split failed'
      addToast(`Split failed: ${msg}`, 'error')
    } finally {
      setSplitting(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPages([])
    setRangeInput('')
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  const selectedCount = pages.filter((p) => p.selected).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 page-enter">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">PDF Split</h1>
        <p className="text-surface-200 mb-4">
          Extract specific pages from a PDF. Select pages or enter ranges, then download.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <PrivacyBadge />
          <UsageIndicator remaining={remaining} dailyLimit={dailyLimit} toolName="PDF Split" />
        </div>
      </div>

      {!file && (
        <DropZone
          onFiles={handleFiles}
          accept={{ 'application/pdf': ['.pdf'] }}
          multiple={false}
          label="Drop a PDF file here to split"
        />
      )}

      <div className="mt-6">
        <AdPlaceholder size="leaderboard" />
      </div>

      {loading && <ProcessingSpinner label="Reading PDF…" />}

      {file && pages.length > 0 && (
        <div className="space-y-6 mt-6">
          {/* File info */}
          <div className="bg-surface-900 rounded-2xl border border-surface-800 px-6 py-4 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{file.name}</p>
              <p className="text-surface-700 text-sm">
                {formatFileSize(file.size)} • {pages.length} page{pages.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-sm text-surface-700 hover:text-red-400 transition"
            >
              Remove
            </button>
          </div>

          {/* Range input */}
          <div className="bg-surface-900 rounded-2xl border border-surface-800 p-6 space-y-4 animate-fade-in">
            <div>
              <label className="text-sm font-medium text-surface-200 mb-2 block">
                Page range
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-10"
                  className="flex-1 bg-surface-800 border border-surface-700 rounded-xl px-4 py-2.5 text-white placeholder:text-surface-700 text-sm focus:outline-none focus:border-brand-500 transition"
                />
                <button
                  onClick={applyRanges}
                  className="bg-surface-800 hover:bg-surface-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  Apply
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={selectAll}
                className="text-sm text-brand-400 hover:text-brand-300 transition"
              >
                Select all
              </button>
              <button
                onClick={selectNone}
                className="text-sm text-surface-200 hover:text-white transition"
              >
                Select none
              </button>
              <span className="text-sm text-surface-700">
                {selectedCount} of {pages.length} selected
              </span>
            </div>
          </div>

          {/* Page thumbnails */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 animate-fade-in">
            {pages.map((page) => (
              <button
                key={page.num}
                onClick={() => togglePage(page.num)}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                  page.selected
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-surface-700 opacity-50 hover:opacity-80'
                }`}
              >
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={`Page ${page.num}`}
                    className="w-full aspect-[3/4] object-cover bg-white"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-surface-800 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-surface-700" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-surface-950/80 text-center py-0.5">
                  <span className="text-xs text-white font-medium">{page.num}</span>
                </div>
                {page.selected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {splitting ? (
            <ProcessingSpinner label="Extracting pages…" />
          ) : (
            <button
              onClick={handleSplit}
              disabled={selectedCount === 0}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-brand-600/20"
            >
              Extract {selectedCount} page{selectedCount !== 1 ? 's' : ''}
            </button>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              <FileSizeBar originalSize={file.size} processedSize={result.size} />
              <div className="flex flex-wrap gap-3">
                <DownloadButton
                  href={result.url}
                  filename={`split-${file.name}`}
                  label="Download Extracted PDF"
                />
                <button
                  onClick={handleClear}
                  className="px-5 py-3 rounded-xl border border-surface-700 text-surface-200 hover:bg-surface-800 transition font-medium"
                >
                  Split another PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showUpgrade && <UpgradePrompt onClose={() => setShowUpgrade(false)} toolName="PDF Split" />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
