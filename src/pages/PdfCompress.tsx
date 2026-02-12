import { useState, useCallback, useEffect } from 'react'
import { FileText } from 'lucide-react'
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

const TOOL_ID = 'pdf-compress'

type Quality = 'low' | 'medium' | 'high'

const qualitySettings: Record<Quality, { label: string; desc: string; dpi: number; jpegQuality: number }> = {
  low: { label: 'Low', desc: 'Smallest file, lower quality images', dpi: 72, jpegQuality: 0.5 },
  medium: { label: 'Medium', desc: 'Balanced file size and quality', dpi: 120, jpegQuality: 0.7 },
  high: { label: 'High', desc: 'Best quality, moderate compression', dpi: 200, jpegQuality: 0.85 },
}

export default function PdfCompress() {
  useSEO({
    title: 'Free Online PDF Compressor — Reduce PDF Size, No Upload | NullUpload',
    description:
      'Compress PDF files to reduce file size — 100% in your browser. Adjustable quality settings. No uploads, no servers, no tracking.',
    canonical: 'https://nullupload.dev/pdf/compress',
  })

  const { remaining, dailyLimit, limitReached, recordUsage, canProcess } =
    useUsageLimits(TOOL_ID)

  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState<Quality>('medium')
  const [compressing, setCompressing] = useState(false)
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
    },
    [limitReached, addToast, result],
  )

  const handleCompress = async () => {
    if (!file) return

    if (!canProcess(1)) {
      setShowUpgrade(true)
      return
    }

    const success = recordUsage(1)
    if (!success) {
      setShowUpgrade(true)
      return
    }

    setCompressing(true)
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)

    try {
      const { PDFDocument } = await import('pdf-lib')
      const { loadPdfDocument, renderPageToCanvas } = await import('../utils/pdf')

      const bytes = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(bytes)
      const pdfJsDoc = await loadPdfDocument(file)

      const settings = qualitySettings[quality]
      const newDoc = await PDFDocument.create()

      for (let i = 0; i < pdfJsDoc.numPages; i++) {
        const canvas = await renderPageToCanvas(pdfJsDoc, i + 1, settings.dpi)

        // Convert to JPEG
        const jpegDataUrl = canvas.toDataURL('image/jpeg', settings.jpegQuality)
        const base64 = jpegDataUrl.split(',')[1]
        const binary = atob(base64)
        const jpegBytes = new Uint8Array(binary.length)
        for (let j = 0; j < binary.length; j++) {
          jpegBytes[j] = binary.charCodeAt(j)
        }

        const jpegImage = await newDoc.embedJpg(jpegBytes)

        // Get original page dimensions
        const srcPage = srcDoc.getPage(i)
        const { width, height } = srcPage.getSize()

        const newPage = newDoc.addPage([width, height])
        newPage.drawImage(jpegImage, {
          x: 0,
          y: 0,
          width,
          height,
        })
      }

      pdfJsDoc.destroy()

      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setResult({ url, size: blob.size })

      if (blob.size < file.size) {
        const pct = (((file.size - blob.size) / file.size) * 100).toFixed(1)
        addToast(`PDF compressed! Saved ${pct}% (${formatFileSize(file.size - blob.size)})`, 'success')
      } else {
        addToast('Compression complete. This PDF is already well-optimized — size stayed similar.', 'info')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Compression failed'
      addToast(`Compression failed: ${msg}`, 'error')
    } finally {
      setCompressing(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    if (result?.url) URL.revokeObjectURL(result.url)
    setResult(null)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 page-enter">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">PDF Compress</h1>
        <p className="text-surface-200 mb-4">
          Reduce PDF file size by re-rendering pages at lower quality. Great for sharing.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <PrivacyBadge />
          <UsageIndicator remaining={remaining} dailyLimit={dailyLimit} toolName="PDF Compress" />
        </div>
      </div>

      {!file && (
        <DropZone
          onFiles={handleFiles}
          accept={{ 'application/pdf': ['.pdf'] }}
          multiple={false}
          label="Drop a PDF file here to compress"
        />
      )}

      <div className="mt-6">
        <AdPlaceholder size="leaderboard" />
      </div>

      {file && (
        <div className="space-y-6 mt-6">
          {/* File info */}
          <div className="bg-surface-900 rounded-2xl border border-surface-800 px-6 py-4 flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{file.name}</p>
              <p className="text-surface-700 text-sm">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={handleClear}
              className="text-sm text-surface-700 hover:text-red-400 transition"
            >
              Remove
            </button>
          </div>

          {/* Quality selector */}
          <div className="bg-surface-900 rounded-2xl border border-surface-800 p-6 animate-fade-in">
            <label className="text-sm font-medium text-surface-200 mb-4 block">
              Compression quality
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(qualitySettings) as [Quality, typeof qualitySettings.low][]).map(
                ([key, { label, desc }]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setQuality(key)
                      if (result?.url) URL.revokeObjectURL(result.url)
                      setResult(null)
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      quality === key
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-surface-700 hover:border-surface-600'
                    }`}
                  >
                    <p
                      className={`font-semibold text-sm ${
                        quality === key ? 'text-brand-400' : 'text-white'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="text-surface-700 text-xs mt-1">{desc}</p>
                  </button>
                ),
              )}
            </div>
          </div>

          {compressing ? (
            <ProcessingSpinner label="Compressing PDF…" />
          ) : (
            <button
              onClick={handleCompress}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-brand-600/20"
            >
              Compress PDF ({qualitySettings[quality].label})
            </button>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              <FileSizeBar originalSize={file.size} processedSize={result.size} />
              <div className="flex flex-wrap gap-3">
                <DownloadButton
                  href={result.url}
                  filename={`compressed-${file.name}`}
                  label="Download Compressed PDF"
                />
                <button
                  onClick={handleClear}
                  className="px-5 py-3 rounded-xl border border-surface-700 text-surface-200 hover:bg-surface-800 transition font-medium"
                >
                  Compress another PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showUpgrade && (
        <UpgradePrompt onClose={() => setShowUpgrade(false)} toolName="PDF Compress" />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
