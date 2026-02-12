import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  Crown,
  Settings,
  Loader2,
} from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import { useTier } from '../contexts/TierContext'

const benefits = [
  {
    icon: Zap,
    title: 'Unlimited Processing',
    desc: 'No daily file limits. Process as many images and PDFs as you need, all day, every day.',
    free: '5 files per tool per day',
    pro: 'Unlimited',
  },
  {
    icon: Sliders,
    title: 'Maximum Quality Settings',
    desc: 'Unlock the full quality range. Get the best possible output for your files.',
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
    title: 'NullUpload Pro — Unlock Unlimited Image & PDF Processing',
    description:
      'Upgrade to NullUpload Pro for unlimited image and PDF processing, maximum quality, unlimited batch processing, and an ad-free experience.',
    canonical: 'https://nullupload.dev/pro',
  })

  const { isPro, loading, checkout, openPortal, refreshStatus, subscription } = useTier()
  const [searchParams, setSearchParams] = useSearchParams()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showCanceled, setShowCanceled] = useState(false)

  // Handle post-checkout redirect
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    if (success === 'true' && sessionId) {
      // Activate the session via status endpoint
      refreshStatus(sessionId).then(() => {
        setShowSuccess(true)
        // Clean up URL params
        setSearchParams({}, { replace: true })
      })
    } else if (canceled === 'true') {
      setShowCanceled(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, refreshStatus, setSearchParams])

  const handleCheckout = async () => {
    setCheckoutLoading(true)
    try {
      await checkout()
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      await openPortal()
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-br from-brand-500/8 to-purple-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="animate-fade-in">
            {isPro ? (
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 to-brand-500/10 border border-emerald-500/20 rounded-full px-6 py-3 mb-8">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-semibold text-emerald-300">Active Subscription</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-brand-500/10 to-purple-500/10 border border-brand-500/20 rounded-full px-6 py-3 mb-8">
                <Crown className="w-6 h-6 text-brand-400" />
                <span className="text-lg font-semibold bg-gradient-to-r from-brand-300 to-purple-300 bg-clip-text text-transparent">
                  $5.99/month
                </span>
              </div>
            )}
          </div>

          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4 tracking-tight">
              NullUpload{' '}
              <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pro
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-surface-200 max-w-2xl mx-auto mb-4">
              {isPro
                ? 'You have full access to all Pro features. Thank you for subscribing!'
                : 'Unlock the full power of NullUpload. No limits, no ads, maximum quality.'}
            </p>
            <p className="text-surface-200/60 max-w-xl mx-auto">
              Same privacy-first approach. Same client-side processing. Just more of everything.
            </p>
          </div>
        </div>
      </section>

      {/* Success / Canceled banners */}
      {showSuccess && (
        <section className="pb-8">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 animate-scale-in text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-300 font-semibold text-lg">Welcome to Pro!</p>
              <p className="text-emerald-200/70 text-sm mt-1">
                Your subscription is active. Enjoy unlimited processing, ad-free experience, and
                more.
              </p>
            </div>
          </div>
        </section>
      )}

      {showCanceled && (
        <section className="pb-8">
          <div className="max-w-lg mx-auto px-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 animate-scale-in text-center">
              <p className="text-amber-300 font-semibold text-lg">Checkout canceled</p>
              <p className="text-amber-200/70 text-sm mt-1">
                No worries — you can upgrade anytime. Your free tier remains active.
              </p>
            </div>
          </div>
        </section>
      )}

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
                <span className="text-surface-200 font-semibold text-sm uppercase tracking-wider">
                  Feature
                </span>
              </div>
              <div className="px-6 py-5 text-center bg-surface-800/30">
                <span className="text-surface-200 font-semibold text-sm uppercase tracking-wider">
                  Free
                </span>
              </div>
              <div className="px-6 py-5 text-center bg-brand-500/5">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 text-brand-400" />
                  <span className="text-brand-400 font-semibold text-sm uppercase tracking-wider">
                    Pro
                  </span>
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

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-lg mx-auto px-4 text-center relative">
          <div className="animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-brand-400" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
                <span className="text-surface-200">Checking subscription status…</span>
              </div>
            ) : isPro ? (
              <>
                <h2 className="text-3xl font-bold text-white mb-3">Manage Your Subscription</h2>
                <p className="text-surface-200 mb-8">
                  Update your payment method, change your plan, or view billing history.
                  {subscription?.currentPeriodEnd && (
                    <>
                      <br />
                      <span className="text-surface-200/60 text-sm">
                        Current period ends{' '}
                        {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </p>
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-brand-600/25"
                >
                  {portalLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4" />
                  )}
                  Manage Subscription
                </button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-white mb-3">Ready to go Pro?</h2>
                <p className="text-surface-200 mb-8">
                  Unlock unlimited processing, ad-free experience, and maximum quality for just{' '}
                  <span className="text-white font-semibold">$5.99/month</span>. Cancel anytime.
                </p>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-brand-600/25"
                >
                  {checkoutLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Subscribe — $5.99/month
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-surface-700 text-xs mt-4">
                  Powered by Stripe. Secure payment processing. Cancel anytime.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
