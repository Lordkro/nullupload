import { useState, useCallback } from 'react'
import DropZone from '../components/DropZone'
import PrivacyBadge from '../components/PrivacyBadge'
import ImagePreview from '../components/ImagePreview'
import FileSizeBar from '../components/FileSizeBar'
import DownloadButton from '../components/DownloadButton'
import BatchFileList from '../components/BatchFileList'
import ToastContainer from '../components/ToastContainer'
import ProcessingSpinner from '../components/ProcessingSpinner'
import UsageIndicator from '../components/UsageIndicator'
import UpgradePrompt from '../components/UpgradePrompt'
import ProBadge from '../components/ProBadge'
import AdPlaceholder from '../components/AdPlaceholder'
import { useToast } from '../hooks/useToast'
import { useSEO } from '../hooks/useSEO'
import { useUsageLimits } from '../hooks/useUsageLimits'
import { useTier } from '../contexts/TierContext'
import { downloadAsZip } from '../utils/batch'
import type { BatchFile } from '../components/BatchFileList'

const TOOL_ID = 'converter'
const FREE_MAX_QUALITY = 0.8

type Format = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif'

const formats: { value: Format; label: string; ext: string }[] = [
  { value: 'image/jpeg', label: 'JPEG', ext: '.jpg' },
  { value: 'image/png', label: 'PNG', ext: '.png' },
  { value: 'image/webp', label: 'WebP', ext: '.webp' },
  { value: 'image/avif', label: 'AVIF', ext: '.avif' },
]

function convertImage(file: File, targetFormat: Format, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const tempUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(tempUrl)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Conversion failed — format may not be supported by your browser'))
        },
        targetFormat,
        quality,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl)
      reject(new Error('Failed to load image'))
    }
    img.src = tempUrl
  })
}

export default function Converter() {
  useSEO({
    title: 'Free Online Image Converter — No Upload Required | NullUpload',
    description:
      'Convert images between JPG, PNG, WebP, and AVIF in your browser. No uploads, no servers, 100% private.',
    canonical: 'https://nullupload.dev/convert',
  })

  const { isPro } = useTier()
  const { remaining, dailyLimit, limitReached, recordUsage, canProcess, clampBatch, batchLimit } =
    useUsageLimits(TOOL_ID)

  const [targetFormat, setTargetFormat] = useState<Format>('image/webp')
  const [quality, setQuality] = useState(0.85)
  const [files, setFiles] = useState<BatchFile[]>([])
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const effectiveMaxQuality = isPro ? 1 : FREE_MAX_QUALITY
  const effectiveQuality = Math.min(quality, effectiveMaxQuality)

  const ext = formats.find((f) => f.value === targetFormat)?.ext ?? '.bin'

  const singleMode = files.length === 1
  const singleFile = singleMode ? files[0] : null

  const convertFile = async (file: File, fmt: Format, q: number): Promise<{ blob: Blob; url: string }> => {
    const blob = await convertImage(file, fmt, q)
    const url = URL.createObjectURL(blob)
    return { blob, url }
  }

  const handleFiles = useCallback(
    async (incoming: File[]) => {
      if (limitReached) {
        setShowUpgrade(true)
        return
      }

      const clamped = incoming.slice(0, clampBatch(incoming.length))
      if (clamped.length < incoming.length) {
        addToast(`Free tier allows ${batchLimit} files at once. ${incoming.length - clamped.length} files were skipped.`, 'warning')
      }

      if (!canProcess(clamped.length)) {
        const processable = remaining
        if (processable <= 0) {
          setShowUpgrade(true)
          return
        }
        const trimmed = clamped.slice(0, processable)
        addToast(`Only ${processable} free uses remaining. Processing ${trimmed.length} of ${clamped.length} files.`, 'warning')
        return handleFilesInternal(trimmed)
      }

      return handleFilesInternal(clamped)
    },
    [limitReached, clampBatch, canProcess, remaining, batchLimit, addToast, targetFormat, effectiveQuality],
  )

  const handleFilesInternal = async (incoming: File[]) => {
    const success = recordUsage(incoming.length)
    if (!success) {
      setShowUpgrade(true)
      return
    }

    const newFiles: BatchFile[] = incoming.map((f) => ({
      id: crypto.randomUUID(),
      original: f,
      processing: true,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    for (const bf of newFiles) {
      try {
        const result = await convertFile(bf.original, targetFormat, effectiveQuality)
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, result, processing: false } : f)),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Conversion failed'
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, error: msg, processing: false } : f)),
        )
        addToast(`Failed to convert ${bf.original.name}`, 'error')
      }
    }

    if (incoming.length > 1) addToast(`${incoming.length} images converted!`, 'success')
    else if (incoming.length === 1) addToast('Image converted!', 'success')
  }

  const reconvert = async () => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.result?.url) URL.revokeObjectURL(f.result.url)
        return { ...f, result: undefined, error: undefined, processing: true }
      }),
    )

    const currentFiles = [...files]
    for (const bf of currentFiles) {
      try {
        const result = await convertFile(bf.original, targetFormat, effectiveQuality)
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, result, processing: false } : f)),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Conversion failed'
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, error: msg, processing: false } : f)),
        )
      }
    }
    addToast('Re-conversion complete!', 'success')
  }

  const handleRemove = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.result?.url) URL.revokeObjectURL(file.result.url)
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleClear = () => {
    files.forEach((f) => {
      if (f.result?.url) URL.revokeObjectURL(f.result.url)
    })
    setFiles([])
  }

  const handleDownloadAll = async () => {
    setDownloadingZip(true)
    try {
      await downloadAsZip(files, 'converted')
      addToast('ZIP downloaded!', 'success')
    } catch {
      addToast('Failed to create ZIP', 'error')
    } finally {
      setDownloadingZip(false)
    }
  }

  const anyProcessing = files.some((f) => f.processing)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 page-enter">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Format Converter</h1>
        <p className="text-surface-200 mb-4">
          Convert images between JPG, PNG, WebP, and AVIF. Drop multiple files at once.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <PrivacyBadge />
          <UsageIndicator remaining={remaining} dailyLimit={dailyLimit} toolName="Converter" />
        </div>
      </div>

      <DropZone onFiles={handleFiles} label="Drop images to convert" multiple />

      <div className="mt-6">
        <AdPlaceholder size="leaderboard" />
      </div>

      {files.length > 0 && (
        <div className="space-y-6 mt-6">
          {/* Controls */}
          <div className="bg-surface-900 rounded-2xl p-6 border border-surface-800 space-y-5 animate-fade-in">
            <div>
              <label className="text-sm font-medium text-surface-200 mb-2 block">Target format</label>
              <div className="flex flex-wrap gap-2">
                {formats.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setTargetFormat(value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      targetFormat === value
                        ? 'bg-brand-600 text-white'
                        : 'bg-surface-800 text-surface-200 hover:bg-surface-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-surface-200 flex items-center gap-2">
                  Quality
                  {!isPro && quality > FREE_MAX_QUALITY && (
                    <ProBadge />
                  )}
                </label>
                <span className="text-sm text-white font-mono">
                  {Math.round(effectiveQuality * 100)}%
                  {!isPro && quality > FREE_MAX_QUALITY && (
                    <span className="text-surface-700 ml-1">(max {Math.round(FREE_MAX_QUALITY * 100)}% on free)</span>
                  )}
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-brand-500"
                />
                {!isPro && (
                  <div
                    className="absolute top-0 h-full pointer-events-none"
                    style={{ left: `${FREE_MAX_QUALITY * 100}%`, right: 0 }}
                  >
                    <div className="h-full bg-surface-950/50 rounded-r-lg" />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={reconvert}
              disabled={anyProcessing}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition"
            >
              {anyProcessing ? 'Converting…' : 'Re-convert All'}
            </button>
          </div>

          {/* Single file previews */}
          {singleFile && (
            <>
              {singleFile.processing ? (
                <ProcessingSpinner label="Converting image…" />
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ImagePreview
                      src={URL.createObjectURL(singleFile.original)}
                      label={`Original (${singleFile.original.type || 'unknown'})`}
                    />
                    {singleFile.result && (
                      <ImagePreview
                        src={singleFile.result.url}
                        label={`Converted (${targetFormat})`}
                        allowCopy
                      />
                    )}
                  </div>
                  {singleFile.error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-xl p-4">
                      {singleFile.error}
                    </div>
                  )}
                  {singleFile.result && (
                    <>
                      <FileSizeBar
                        originalSize={singleFile.original.size}
                        processedSize={singleFile.result.blob.size}
                      />
                      <div className="flex flex-wrap gap-3">
                        <DownloadButton
                          href={singleFile.result.url}
                          filename={`converted-${singleFile.original.name.replace(/\.\w+$/, ext)}`}
                          label="Download Converted"
                        />
                        <button
                          onClick={handleClear}
                          className="px-5 py-3 rounded-xl border border-surface-700 text-surface-200 hover:bg-surface-800 transition font-medium"
                        >
                          Process more
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Batch file list */}
          {!singleMode && (
            <BatchFileList
              files={files}
              onRemove={handleRemove}
              onDownloadAll={handleDownloadAll}
              onClear={handleClear}
              downloadingZip={downloadingZip}
            />
          )}
        </div>
      )}

      {showUpgrade && (
        <UpgradePrompt onClose={() => setShowUpgrade(false)} toolName="conversion" />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
