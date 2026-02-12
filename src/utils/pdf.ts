import type { PDFDocumentProxy } from 'pdfjs-dist'

let pdfjsLib: typeof import('pdfjs-dist') | null = null

export async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib
  pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
  return pdfjsLib
}

export async function loadPdfDocument(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfjs()
  const arrayBuffer = await file.arrayBuffer()
  return pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
}

export async function renderPageThumbnail(
  pdf: PDFDocumentProxy,
  pageNum: number,
  maxWidth = 150,
): Promise<string> {
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1 })
  const scale = maxWidth / viewport.width
  const scaledViewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = scaledViewport.width
  canvas.height = scaledViewport.height

  await page.render({ canvas, viewport: scaledViewport }).promise
  return canvas.toDataURL('image/png')
}

/**
 * Render a PDF page to canvas at the given DPI.
 * Returns the canvas element.
 */
export async function renderPageToCanvas(
  pdf: PDFDocumentProxy,
  pageNum: number,
  targetDpi: number,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNum)
  const viewport = page.getViewport({ scale: 1 })
  const scale = targetDpi / 72
  const scaledViewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width * scale)
  canvas.height = Math.floor(scaledViewport.height)

  await page.render({ canvas, viewport: scaledViewport }).promise
  return canvas
}
