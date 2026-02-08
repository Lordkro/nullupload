import { useState, useCallback, useRef } from 'react'
import imageCompression from 'browser-image-compression'
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

const TOOL_ID = 'compressor'
const FREE_MAX_QUALITY = 0.8

export default function Compressor() {
  useSEO({
    title: 'Free Online Image Compressor — No Upload Required | NullUpload',
    description:
      'Compress images in your browser with adjustable quality. No uploads, no servers, 100% private. Supports JPG, PNG, WebP, and AVIF.',
    canonical: 'https://nullupload.dev/compress',
  })

  const { isPro } = useTier()
  const { remaining, dailyLimit, limitReached, recordUsage, canProcess, clampBatch, batchLimit } =
    useUsageLimits(TOOL_ID)

  const [quality, setQuality] = useState(0.7)
  const [maxSizeMB, setMaxSizeMB] = useState(1)
  const [files, setFiles] = useState<BatchFile[]>([])
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  const processingRef = useRef(false)

  // Gate quality: free tier max 80%
  const effectiveMaxQuality = isPro ? 1 : FREE_MAX_QUALITY
  const effectiveQuality = Math.min(quality, effectiveMaxQuality)

  const singleMode = files.length === 1
  const singleFile = singleMode ? files[0] : null

  const compressFile = async (file: File, q: number, maxMB: number): Promise<{ blob: Blob; url: string }> => {
    const compressed = await imageCompression(file, {
      maxSizeMB: maxMB,
      maxWidthOrHeight: 4096,
      initialQuality: q,
      useWebWorker: true,
    })
    const url = URL.createObjectURL(compressed)
    return { blob: compressed, url }
  }

  const handleFiles = useCallback(
    async (incoming: File[]) => {
      // Gate: check limits
      if (limitReached) {
        setShowUpgrade(true)
        return
      }

      // Gate: batch limit
      const clamped = incoming.slice(0, clampBatch(incoming.length))
      if (clamped.length < incoming.length) {
        addToast(`Free tier allows ${batchLimit} files at once. ${incoming.length - clamped.length} files were skipped.`, 'warning')
      }

      // Check if we can process this many
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
    [limitReached, clampBatch, canProcess, remaining, batchLimit, addToast, quality, maxSizeMB, effectiveQuality],
  )

  const handleFilesInternal = async (incoming: File[]) => {
    // Record usage
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
        const result = await compressFile(bf.original, effectiveQuality, maxSizeMB)
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, result, processing: false } : f)),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Compression failed'
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, error: msg, processing: false } : f)),
        )
        addToast(`Failed to compress ${bf.original.name}`, 'error')
      }
    }

    const successCount = incoming.length
    if (successCount > 1) {
      addToast(`${successCount} images compressed!`, 'success')
    } else if (successCount === 1) {
      addToast('Image compressed!', 'success')
    }
  }

  const recompress = async () => {
    if (processingRef.current) return
    processingRef.current = true

    setFiles((prev) =>
      prev.map((f) => {
        if (f.result?.url) URL.revokeObjectURL(f.result.url)
        return { ...f, result: undefined, error: undefined, processing: true }
      }),
    )

    const currentFiles = [...files]
    for (const bf of currentFiles) {
      try {
        const result = await compressFile(bf.original, effectiveQuality, maxSizeMB)
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, result, processing: false } : f)),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Compression failed'
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, error: msg, processing: false } : f)),
        )
      }
    }

    processingRef.current = false
    addToast('Re-compression complete!', 'success')
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
      await downloadAsZip(files, 'compressed')
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
        <h1 className="text-3xl font-bold text-white mb-2">Image Compressor</h1>
        <p className="text-surface-200 mb-4">
          Reduce image file sizes while preserving visual quality. Drop multiple images at once.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <PrivacyBadge />
          <UsageIndicator remaining={remaining} dailyLimit={dailyLimit} toolName="Compressor" />
        </div>
      </div>

      <DropZone onFiles={handleFiles} label="Drop images to compress" multiple />

      {/* Ad placeholder */}
      <div className="mt-6">
        <AdPlaceholder size="leaderboard" />
      </div>

      {files.length > 0 && (
        <div className="space-y-6 mt-6">
          {/* Controls */}
          <div className="bg-surface-900 rounded-2xl p-6 border border-surface-800 space-y-5 animate-fade-in">
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
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-surface-200">Max file size (MB)</label>
                <span className="text-sm text-white font-mono">{maxSizeMB} MB</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={10}
                step={0.1}
                value={maxSizeMB}
                onChange={(e) => setMaxSizeMB(parseFloat(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
            <button
              onClick={recompress}
              disabled={anyProcessing}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition"
            >
              {anyProcessing ? 'Compressing…' : 'Re-compress All'}
            </button>
          </div>

          {/* Single file previews */}
          {singleFile && (
            <>
              {singleFile.processing ? (
                <ProcessingSpinner label="Compressing image…" />
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ImagePreview
                      src={URL.createObjectURL(singleFile.original)}
                      label="Original"
                    />
                    {singleFile.result && (
                      <ImagePreview
                        src={singleFile.result.url}
                        label="Compressed"
                        allowCopy
                      />
                    )}
                  </div>
                  {singleFile.result && (
                    <>
                      <FileSizeBar
                        originalSize={singleFile.original.size}
                        processedSize={singleFile.result.blob.size}
                      />
                      <div className="flex flex-wrap gap-3">
                        <DownloadButton
                          href={singleFile.result.url}
                          filename={`compressed-${singleFile.original.name}`}
                          label="Download Compressed"
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
        <UpgradePrompt onClose={() => setShowUpgrade(false)} toolName="compression" />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
