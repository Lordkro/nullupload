import { useState } from 'react'
import {
  Sparkles,
  Zap,
  Sliders,
  Layers,
  Ban,
  Palette,
  Shield,
  CheckCircle2,
  ArrowRight,
  Mail,
  Crown,
} from 'lucide-react'
import { useSEO } from '../hooks/useSEO'

const WAITLIST_KEY = 'nullupload_waitlist'

const benefits = [
  {
    icon: Zap,
    title: 'Unlimited Processing',
    desc: 'No daily file limits. Process as many images as you need, all day, every day.',
    free: '5 files per tool per day',
    pro: 'Unlimited',
  },
  {
    icon: Sliders,
    title: 'Maximum Quality Settings',
    desc: 'Unlock the full quality range. Get the best possible output for your images.',
    free: 'Up to 80% quality',
    pro: 'Full 100% quality',
  },
  {
    icon: Layers,
    title: 'Unlimited Batch Processing',
    desc: 'Drop as many files as you want in a single batch. No caps.',
    free: '3 files per batch',
    pro: 'Unlimited batch size',
  },
  {
    icon: Ban,
    title: 'Ad-Free Experience',
    desc: 'Clean, distraction-free workspace. No ads, no interruptions.',
    free: 'Ad-supported',
    pro: 'Zero ads',
  },
  {
    icon: Palette,
    title: 'Custom Export Presets',
    desc: 'Save your favorite settings and apply them instantly. Coming soon!',
    free: 'Default settings only',
    pro: 'Custom presets',
    comingSoon: true,
  },
  {
    icon: Shield,
    title: 'Priority Support',
    desc: 'Get help when you need it. Priority access to our support team.',
    free: 'Community support',
    pro: 'Priority support',
    comingSoon: true,
  },
]

export default function Pro() {
  useSEO({
    title: 'NullUpload Pro — Unlock Unlimited Image Processing',
    description:
      'Upgrade to NullUpload Pro for unlimited file processing, maximum quality, unlimited batch processing, and an ad-free experience.',
    canonical: 'https://nullupload.dev/pro',
  })

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [alreadyJoined, setAlreadyJoined] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      const existing = JSON.parse(localStorage.getItem(WAITLIST_KEY) || '[]') as string[]
      if (existing.includes(email.trim().toLowerCase())) {
        setAlreadyJoined(true)
        return
      }
      existing.push(email.trim().toLowerCase())
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(existing))
    } catch {
      localStorage.setItem(WAITLIST_KEY, JSON.stringify([email.trim().toLowerCase()]))
    }

    setSubmitted(true)
    setEmail('')
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-brand-500/8 to-purple-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/20 rounded-full px-6 py-3 mb-8">
              <Crown className="w-6 h-6 text-brand-400" />
              <span className="text-lg font-semibold bg-gradient-to-r from-brand-300 to-purple-300 bg-clip-text text-transparent">
                Coming Soon
              </span>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4 tracking-tight">
              NullUpload{' '}
              <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pro
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-surface-200 max-w-2xl mx-auto mb-4">
              Unlock the full power of NullUpload. No limits, no ads, maximum quality.
            </p>
            <p className="text-surface-200/60 max-w-xl mx-auto">
              Same privacy-first approach. Same client-side processing. Just more of everything.
            </p>
          </div>
        </div>
      </section>

      {/* Free vs Pro Comparison Table */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14 animate-fade-in">
            Everything you get with Pro
          </h2>

          <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden animate-fade-in-up">
            {/* Table Header */}
            <div className="grid grid-cols-3 border-b border-surface-800">
              <div className="px-6 py-5">
                <span className="text-surface-200 font-semibold text-sm uppercase tracking-wider">Feature</span>
              </div>
              <div className="px-6 py-5 text-center bg-surface-800/30">
                <span className="text-surface-200 font-semibold text-sm uppercase tracking-wider">Free</span>
              </div>
              <div className="px-6 py-5 text-center bg-brand-500/5">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 text-brand-400" />
                  <span className="text-brand-400 font-semibold text-sm uppercase tracking-wider">Pro</span>
                </div>
              </div>
            </div>

            {/* Table Rows */}
            {benefits.map(({ icon: Icon, title, desc, free, pro, comingSoon }, i) => (
              <div
                key={title}
                className={`grid grid-cols-3 items-center border-b border-surface-800/50 last:border-b-0 ${
                  i % 2 === 0 ? '' : 'bg-surface-800/10'
                }`}
              >
                {/* Feature Column */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/10 to-purple-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-brand-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-sm">{title}</h3>
                        {comingSoon && (
                          <span className="bg-purple-500/15 border border-purple-500/25 text-purple-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                            Soon
                          </span>
                        )}
                      </div>
                      <p className="text-surface-200/60 text-xs mt-0.5 hidden md:block">{desc}</p>
                    </div>
                  </div>
                </div>

                {/* Free Column */}
                <div className="px-6 py-5 text-center bg-surface-800/20">
                  <span className="text-surface-200 text-sm">{free}</span>
                </div>

                {/* Pro Column */}
                <div className="px-6 py-5 text-center bg-brand-500/5">
                  <span className="text-white font-medium text-sm">{pro}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-lg mx-auto px-4 text-center relative">
          <div className="animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-brand-400" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">
              Coming Soon — Join the Waitlist
            </h2>
            <p className="text-surface-200 mb-8">
              Be the first to know when NullUpload Pro launches. We'll send you one email — no spam, ever.
            </p>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 animate-scale-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-300 font-semibold text-lg">You're on the list!</p>
                <p className="text-emerald-200/70 text-sm mt-1">
                  We'll let you know as soon as Pro is ready.
                </p>
              </div>
            ) : alreadyJoined ? (
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-6 animate-scale-in">
                <CheckCircle2 className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                <p className="text-brand-300 font-semibold text-lg">You're already on the list!</p>
                <p className="text-brand-200/70 text-sm mt-1">
                  We'll notify you when Pro launches. Thanks for your interest!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-700" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-surface-900 border border-surface-800 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-surface-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-semibold px-6 py-3.5 rounded-xl transition shadow-lg shadow-brand-600/25 shrink-0"
                >
                  Join Waitlist
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <p className="text-surface-700 text-xs mt-4">
              No spam, unsubscribe anytime. Your email stays in your browser until we add a backend.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
