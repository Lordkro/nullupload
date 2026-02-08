import { useState, useCallback, useEffect } from 'react'
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
import AdPlaceholder from '../components/AdPlaceholder'
import { useToast } from '../hooks/useToast'
import { useSEO } from '../hooks/useSEO'
import { useUsageLimits } from '../hooks/useUsageLimits'
import { downloadAsZip } from '../utils/batch'
import { Link as LinkIcon, Unlink } from 'lucide-react'
import type { BatchFile } from '../components/BatchFileList'

const TOOL_ID = 'resizer'

interface Dims {
  width: number
  height: number
}

function getImageDims(file: File): Promise<Dims> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

function resizeImage(file: File, target: Dims): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = target.width
      canvas.height = target.height
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, target.width, target.height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Resize failed'))
        },
        file.type || 'image/png',
        0.92,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export default function Resizer() {
  useSEO({
    title: 'Free Online Image Resizer — No Upload Required | NullUpload',
    description:
      'Resize images by exact dimensions or percentage in your browser. No uploads, no servers, 100% private.',
    canonical: 'https://nullupload.dev/resize',
  })

  const { remaining, dailyLimit, limitReached, recordUsage, canProcess, clampBatch, batchLimit } =
    useUsageLimits(TOOL_ID)

  const [files, setFiles] = useState<BatchFile[]>([])
  const [originalDims, setOriginalDims] = useState<Dims | null>(null)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [lockAspect, setLockAspect] = useState(true)
  const [mode, setMode] = useState<'pixels' | 'percent'>('pixels')
  const [percent, setPercent] = useState(50)
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const singleMode = files.length === 1
  const singleFile = singleMode ? files[0] : null
  const aspectRatio = originalDims ? originalDims.width / originalDims.height : 1

  const handleWidthChange = (w: number) => {
    setWidth(w)
    if (lockAspect) setHeight(Math.round(w / aspectRatio))
  }
  const handleHeightChange = (h: number) => {
    setHeight(h)
    if (lockAspect) setWidth(Math.round(h * aspectRatio))
  }

  useEffect(() => {
    if (mode === 'percent' && originalDims) {
      const w = Math.round(originalDims.width * (percent / 100))
      const h = Math.round(originalDims.height * (percent / 100))
      setWidth(w)
      setHeight(h)
    }
  }, [percent, mode, originalDims])

  const handleFiles = useCallback(
    (incoming: File[]) => {
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
        addToast(`Only ${processable} free uses remaining.`, 'warning')
        const trimmed = clamped.slice(0, processable)
        return handleFilesInternal(trimmed)
      }

      return handleFilesInternal(clamped)
    },
    [limitReached, clampBatch, canProcess, remaining, batchLimit, addToast, originalDims],
  )

  const handleFilesInternal = (incoming: File[]) => {
    const newFiles: BatchFile[] = incoming.map((f) => ({
      id: crypto.randomUUID(),
      original: f,
      processing: false,
    }))
    setFiles((prev) => [...prev, ...newFiles])

    if (!originalDims && incoming.length > 0) {
      getImageDims(incoming[0]).then((dims) => {
        setOriginalDims(dims)
        setWidth(dims.width)
        setHeight(dims.height)
      })
    }
  }

  const doResize = async () => {
    if (width < 1 || height < 1) return

    // Record usage for resize action
    const success = recordUsage(files.length)
    if (!success) {
      setShowUpgrade(true)
      return
    }

    setFiles((prev) =>
      prev.map((f) => {
        if (f.result?.url) URL.revokeObjectURL(f.result.url)
        return { ...f, result: undefined, error: undefined, processing: true }
      }),
    )

    const currentFiles = [...files]
    for (const bf of currentFiles) {
      try {
        let targetDims = { width, height }
        if (mode === 'percent') {
          const dims = await getImageDims(bf.original)
          targetDims = {
            width: Math.round(dims.width * (percent / 100)),
            height: Math.round(dims.height * (percent / 100)),
          }
        }
        const blob = await resizeImage(bf.original, targetDims)
        const url = URL.createObjectURL(blob)
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, result: { blob, url }, processing: false } : f)),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Resize failed'
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, error: msg, processing: false } : f)),
        )
        addToast(`Failed to resize ${bf.original.name}`, 'error')
      }
    }

    if (currentFiles.length > 1) addToast(`${currentFiles.length} images resized!`, 'success')
    else addToast('Image resized!', 'success')
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
    setOriginalDims(null)
  }

  const handleDownloadAll = async () => {
    setDownloadingZip(true)
    try {
      await downloadAsZip(files, 'resized')
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
        <h1 className="text-3xl font-bold text-white mb-2">Image Resizer</h1>
        <p className="text-surface-200 mb-4">
          Resize images by exact dimensions or percentage. Drop multiple files at once.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <PrivacyBadge />
          <UsageIndicator remaining={remaining} dailyLimit={dailyLimit} toolName="Resizer" />
        </div>
      </div>

      <DropZone onFiles={handleFiles} label="Drop images to resize" multiple />

      <div className="mt-6">
        <AdPlaceholder size="leaderboard" />
      </div>

      {files.length > 0 && (
        <div className="space-y-6 mt-6">
          <div className="bg-surface-900 rounded-2xl p-6 border border-surface-800 space-y-5 animate-fade-in">
            {originalDims && (
              <p className="text-sm text-surface-200">
                Reference size:{' '}
                <span className="text-white font-medium">
                  {originalDims.width} × {originalDims.height}
                </span>
              </p>
            )}

            {/* Mode switch */}
            <div className="flex gap-2">
              {(['pixels', 'percent'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    mode === m
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-800 text-surface-200 hover:bg-surface-700'
                  }`}
                >
                  {m === 'pixels' ? 'Pixels' : 'Percentage'}
                </button>
              ))}
            </div>

            {mode === 'pixels' ? (
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <label className="text-xs text-surface-700 block mb-1">Width</label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={width}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                    className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white w-28 text-sm"
                  />
                </div>
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`mt-5 p-2 rounded-lg transition ${
                    lockAspect
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'bg-surface-800 text-surface-700'
                  }`}
                  title={lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                >
                  {lockAspect ? (
                    <LinkIcon className="w-4 h-4" />
                  ) : (
                    <Unlink className="w-4 h-4" />
                  )}
                </button>
                <div>
                  <label className="text-xs text-surface-700 block mb-1">Height</label>
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={height}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                    className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white w-28 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-surface-200">Scale</label>
                  <span className="text-sm text-white font-mono">{percent}%</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={percent}
                  onChange={(e) => setPercent(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <p className="text-xs text-surface-700 mt-1">
                  Output: {width} × {height}
                </p>
              </div>
            )}

            <button
              onClick={doResize}
              disabled={anyProcessing || width < 1 || height < 1}
              className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition"
            >
              {anyProcessing ? 'Resizing…' : `Resize${files.length > 1 ? ' All' : ''}`}
            </button>
          </div>

          {/* Single file previews */}
          {singleFile && (
            <>
              {singleFile.processing ? (
                <ProcessingSpinner label="Resizing image…" />
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
                        label={`Resized (${width}×${height})`}
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
                          filename={`resized-${width}x${height}-${singleFile.original.name}`}
                          label="Download Resized"
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
        <UpgradePrompt onClose={() => setShowUpgrade(false)} toolName="resizing" />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
