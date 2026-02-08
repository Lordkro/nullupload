import { ShieldCheck } from 'lucide-react'

export default function PrivacyBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5">
      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
      <span className="text-sm font-medium text-emerald-300">
        Your files never leave your browser
      </span>
    </div>
  )
}
