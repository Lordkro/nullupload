import { Download } from 'lucide-react'

interface DownloadButtonProps {
  href: string
  filename: string
  label?: string
}

export default function DownloadButton({ href, filename, label = 'Download' }: DownloadButtonProps) {
  return (
    <a
      href={href}
      download={filename}
      className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-brand-600/20"
    >
      <Download className="w-5 h-5" />
      {label}
    </a>
  )
}
