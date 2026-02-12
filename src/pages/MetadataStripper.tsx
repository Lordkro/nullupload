import { useState, useCallback } from 'react'
import piexif from 'piexifjs'
import DropZone from '../components/DropZone'
import PrivacyBadge from '../components/PrivacyBadge'
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
import { AlertTriangle, MapPin, Camera, Calendar, Tag } from 'lucide-react'
import type { BatchFile } from '../components/BatchFileList'

const TOOL_ID = 'metadata'

interface MetadataEntry {
  section: string
  tag: string
  value: string
  icon: typeof Tag
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) u8arr[n] = bstr.charCodeAt(n)
  return new Blob([u8arr], { type: mime })
}

function formatValue(val: unknown): string {
  if (val === undefined || val === null) return ''
  if (typeof val === 'string') return val.replace(/\0/g, '').trim()
  if (Array.isArray(val)) {
    if (
      val.length === 2 &&
      typeof val[0] === 'number' &&
      typeof val[1] === 'number' &&
      val[1] !== 0
    ) {
      return `${(val[0] / val[1]).toFixed(4)}`
    }
    return val.map(formatValue).join(', ')
  }
  return String(val)
}

function getIcon(section: string, tagName: string) {
  if (section === 'GPS') return MapPin
  if (tagName.toLowerCase().includes('date') || tagName.toLowerCase().includes('time'))
    return Calendar
  if (
    tagName.toLowerCase().includes('make') ||
    tagName.toLowerCase().includes('model') ||
    tagName.toLowerCase().includes('lens')
  )
    return Camera
  return Tag
}

function extractMetadata(exifData: piexif.ExifData): MetadataEntry[] {
  const entries: MetadataEntry[] = []
  const sections = ['0th', 'Exif', 'GPS', 'Interop', '1st'] as const

  for (const section of sections) {
    const tags = exifData[section]
    if (!tags) continue
    const tagNames = piexif.TAGS[section] || {}
    for (const [tagId, val] of Object.entries(tags)) {
      if (val === undefined || val === null) continue
      const formatted = formatValue(val)
      if (!formatted) continue
      const tagName = tagNames[parseInt(tagId)] || `Tag ${tagId}`
      entries.push({
        section:
          section === '0th' ? 'Image' : section === '1st' ? 'Thumbnail' : section,
        tag: tagName,
        value: formatted.slice(0, 120),
        icon: getIcon(section, tagName),
      })
    }
  }
  return entries
}

function stripViaCanvas(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Re-encode failed'))),
        file.type || 'image/png',
        0.95,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

async function stripFile(
  file: File,
): Promise<{ blob: Blob; url: string; metadata: MetadataEntry[]; isJpeg: boolean }> {
  const jpeg =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg')

  if (jpeg) {
    const dataUrl = await fileToDataURL(file)
    try {
      const exifData = piexif.load(dataUrl)
      const metadata = extractMetadata(exifData)
      const cleaned = piexif.remove(dataUrl)
      const blob = dataURLtoBlob(cleaned)
      return { blob, url: URL.createObjectURL(blob), metadata, isJpeg: true }
    } catch {
      const blob = dataURLtoBlob(dataUrl)
      return { blob, url: URL.createObjectURL(blob), metadata: [], isJpeg: true }
    }
  } else {
    const blob = await stripViaCanvas(file)
    return { blob, url: URL.createObjectURL(blob), metadata: [], isJpeg: false }
  }
}

export default function MetadataStripper() {
  useSEO({
    title: 'Free Online EXIF Metadata Remover — No Upload Required | NullUpload',
    description:
      'Strip EXIF metadata, GPS location, and camera info from images in your browser. No uploads, no servers, 100% private.',
    canonical: 'https://nullupload.dev/metadata',
  })

  const { remaining, dailyLimit, limitReached, recordUsage, canProcess, clampBatch, batchLimit } =
    useUsageLimits(TOOL_ID)

  const [files, setFiles] = useState<BatchFile[]>([])
  const [metadata, setMetadata] = useState<MetadataEntry[]>([])
  const [isJpeg, setIsJpeg] = useState(false)
  const [downloadingZip, setDownloadingZip] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const singleMode = files.length === 1
  const singleFile = singleMode ? files[0] : null

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
        addToast(`Only ${processable} free uses remaining.`, 'warning')
        const trimmed = clamped.slice(0, processable)
        return handleFilesInternal(trimmed)
      }

      return handleFilesInternal(clamped)
    },
    [limitReached, clampBatch, canProcess, remaining, batchLimit, addToast],
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

    let totalMeta: MetadataEntry[] = []
    let lastJpeg = false

    for (const bf of newFiles) {
      try {
        const result = await stripFile(bf.original)
        totalMeta = result.metadata
        lastJpeg = result.isJpeg
        setFiles((prev) =>
          prev.map((f) =>
            f.id === bf.id
              ? { ...f, result: { blob: result.blob, url: result.url }, processing: false }
              : f,
          ),
        )
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Strip failed'
        setFiles((prev) =>
          prev.map((f) => (f.id === bf.id ? { ...f, error: msg, processing: false } : f)),
        )
        addToast(`Failed to strip ${bf.original.name}`, 'error')
      }
    }

    if (incoming.length === 1) {
      setMetadata(totalMeta)
      setIsJpeg(lastJpeg)
    }

    if (incoming.length > 1) addToast(`${incoming.length} images stripped!`, 'success')
    else addToast('Metadata stripped!', 'success')
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
    setMetadata([])
  }

  const handleDownloadAll = async () => {
    setDownloadingZip(true)
    try {
      await downloadAsZip(files, 'clean')
      addToast('ZIP downloaded!', 'success')
    } catch {
      addToast('Failed to create ZIP', 'error')
    } finally {
      setDownloadingZip(false)
    }
  }

  const gpsEntries = metadata.filter((m) => m.section === 'GPS')

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 page-enter">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Strip Metadata</h1>
        <p className="text-surface-200 mb-4">
          Remove hidden metadata from your images — GPS location, camera info, timestamps, and
          more. Drop multiple files at once.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <PrivacyBadge />
          <UsageIndicator remaining={remaining} dailyLimit={dailyLimit} toolName="Metadata Stripper" />
        </div>
      </div>

      <DropZone onFiles={handleFiles} label="Drop images to strip metadata" multiple />

      <div className="mt-6">
        <AdPlaceholder size="leaderboard" />
      </div>

      {files.length > 0 && (
        <div className="space-y-6 mt-6">
          {/* Single file details */}
          {singleFile && (
            <>
              {singleFile.processing ? (
                <ProcessingSpinner label="Stripping metadata…" />
              ) : (
                <>
                  {/* GPS Warning */}
                  {gpsEntries.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 animate-scale-in">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-300 font-medium text-sm">
                          GPS location data found!
                        </p>
                        <p className="text-amber-200/70 text-xs mt-1">
                          This image contained GPS coordinates that could reveal where it was
                          taken. They have been removed.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Metadata found */}
                  {metadata.length > 0 && (
                    <div className="bg-surface-900 rounded-2xl border border-surface-800 overflow-hidden animate-fade-in">
                      <div className="px-6 py-4 border-b border-surface-800">
                        <h3 className="text-white font-semibold">
                          Found {metadata.length} metadata{' '}
                          {metadata.length === 1 ? 'entry' : 'entries'} —{' '}
                          <span className="text-emerald-400">all removed ✓</span>
                        </h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-surface-800">
                        {metadata.map((entry, i) => {
                          const Icon = entry.icon
                          return (
                            <div
                              key={i}
                              className="px-6 py-3 flex items-start gap-3 text-sm"
                            >
                              <Icon className="w-4 h-4 text-surface-700 shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <span className="text-surface-200">{entry.section} → </span>
                                <span className="text-white font-medium">{entry.tag}</span>
                                <p className="text-surface-700 text-xs mt-0.5 truncate">
                                  {entry.value}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {metadata.length === 0 && !singleFile.processing && (
                    <div className="bg-surface-900 rounded-xl p-6 text-center border border-surface-800 animate-fade-in">
                      <p className="text-surface-200">
                        {isJpeg
                          ? "No EXIF metadata found in this image — it's already clean!"
                          : 'Non-JPEG image: re-encoded via Canvas to strip any embedded metadata.'}
                      </p>
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
                          filename={`clean-${singleFile.original.name}`}
                          label="Download Clean Image"
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
        <UpgradePrompt onClose={() => setShowUpgrade(false)} toolName="metadata stripping" />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
