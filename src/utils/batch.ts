import JSZip from 'jszip'
import type { BatchFile } from '../components/BatchFileList'

export async function downloadAsZip(files: BatchFile[], prefix: string): Promise<void> {
  const zip = new JSZip()

  for (const file of files) {
    if (file.result) {
      const name = `${prefix}-${file.original.name}`
      zip.file(name, file.result.blob)
    }
  }

  const content = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(content)
  const a = document.createElement('a')
  a.href = url
  a.download = `${prefix}-nullupload.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
