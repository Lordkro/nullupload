import { Link } from 'react-router-dom'
import {
  Shield,
  Minimize2,
  RefreshCw,
  Scaling,
  FileX2,
  Zap,
  Wifi,
  Eye,
  Upload,
  Cpu,
  Download,
  Server,
  ShieldOff,
  ArrowRight,
} from 'lucide-react'
import Logo from '../components/Logo'
import { useSEO } from '../hooks/useSEO'

const tools = [
  {
    to: '/compress',
    icon: Minimize2,
    title: 'Image Compressor',
    desc: 'Reduce file sizes with adjustable quality — perfect for web and email.',
    color: 'text-blue-400 bg-blue-500/10',
    cta: 'Compress Images',
  },
  {
    to: '/convert',
    icon: RefreshCw,
    title: 'Format Converter',
    desc: 'Convert between JPG, PNG, WebP, and AVIF effortlessly.',
    color: 'text-purple-400 bg-purple-500/10',
    cta: 'Convert Images',
  },
  {
    to: '/resize',
    icon: Scaling,
    title: 'Image Resizer',
    desc: 'Resize by exact dimensions or percentage, with aspect ratio lock.',
    color: 'text-amber-400 bg-amber-500/10',
    cta: 'Resize Images',
  },
  {
    to: '/metadata',
    icon: FileX2,
    title: 'EXIF / Metadata Stripper',
    desc: 'Remove hidden metadata from photos — GPS, camera info, and more.',
    color: 'text-rose-400 bg-rose-500/10',
    cta: 'Strip Metadata',
  },
]

const features = [
  {
    icon: Shield,
    title: 'Zero Uploads',
    desc: 'Every operation happens in your browser. Files never touch a server.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    desc: 'Native browser APIs mean instant processing — no waiting for uploads.',
  },
  {
    icon: Wifi,
    title: 'Works Offline',
    desc: 'After loading once, NullUpload works even without an internet connection.',
  },
  {
    icon: Eye,
    title: 'No Tracking',
    desc: 'No analytics, no cookies, no accounts. Just tools that work.',
  },
]

const trustSignals = [
  { icon: Server, label: 'No servers' },
  { icon: Upload, label: 'No uploads' },
  { icon: Eye, label: 'No tracking' },
  { icon: ShieldOff, label: 'No accounts' },
]

const steps = [
  {
    num: '01',
    icon: Upload,
    title: 'Drop your file',
    desc: 'Drag & drop or click to select images from your device. Multiple files supported.',
  },
  {
    num: '02',
    icon: Cpu,
    title: 'We process it in your browser',
    desc: 'Using Canvas API, Web Workers, and modern browser tech. Nothing leaves your device.',
  },
  {
    num: '03',
    icon: Download,
    title: 'Download the result',
    desc: 'Get your processed files individually or as a ZIP. That\'s it — no sign-up needed.',
  },
]

export default function Home() {
  useSEO({
    title: 'NullUpload — Free Privacy-First Image Tools | No Upload Required',
    description:
      'Compress, convert, resize, and strip metadata from images — 100% in your browser. No uploads, no servers, no tracking. Your files go nowhere.',
    canonical: 'https://nullupload.com/',
  })

  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">
                100% client-side — your files never leave your browser
              </span>
            </div>
          </div>

          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Logo size={56} />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-4 tracking-tight">
              Privacy-first
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                image tools
              </span>
            </h1>

            <p className="text-2xl md:text-3xl font-bold text-surface-200 mb-6">
              Your files go <span className="text-brand-400">nowhere</span>.
            </p>

            <p className="text-lg text-surface-200/80 max-w-2xl mx-auto mb-10">
              Compress, convert, resize, and strip metadata from images — all client-side,
              all private, all free. No accounts required.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 animate-fade-in stagger-3">
            <Link
              to="/compress"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-7 py-3.5 rounded-xl transition shadow-lg shadow-brand-600/25 flex items-center gap-2"
            >
              Start Compressing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#tools"
              className="bg-surface-800 hover:bg-surface-700 text-white font-semibold px-7 py-3.5 rounded-xl transition border border-surface-700"
            >
              View All Tools
            </a>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-8 border-y border-surface-800 bg-surface-900/50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustSignals.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 text-surface-200 animate-fade-in stagger-${i + 1}`}
              >
                <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <span className="font-semibold text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section id="tools" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Everything you need, right in your browser
            </h2>
            <p className="text-surface-200 max-w-lg mx-auto">
              Professional image tools that respect your privacy. Pick a tool and get started.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {tools.map(({ to, icon: Icon, title, desc, color, cta }, i) => (
              <Link
                key={to}
                to={to}
                className={`group bg-surface-900 border border-surface-800 hover:border-brand-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/5 animate-fade-in-up stagger-${i + 1}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} transition-transform group-hover:scale-110`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-brand-400 transition">
                  {title}
                </h3>
                <p className="text-surface-200 text-sm mb-4">{desc}</p>
                <span className="text-brand-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  {cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-surface-900/50 border-y border-surface-800">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14 animate-fade-in">
            Why NullUpload is different
          </h2>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Others */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 animate-fade-in-up stagger-1">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-5">
                <Server className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-red-300 font-semibold text-lg mb-3">Other image tools</h3>
              <ul className="space-y-3 text-sm">
                {[
                  'Upload your files to their servers',
                  'Files stored and potentially shared',
                  'Require accounts and sign-ups',
                  'Track your usage and data',
                  'Dependent on server speed',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-surface-200">
                    <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* NullUpload */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 animate-fade-in-up stagger-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-emerald-300 font-semibold text-lg mb-3">NullUpload</h3>
              <ul className="space-y-3 text-sm">
                {[
                  'Process everything in your browser',
                  'Nothing leaves your device. Ever.',
                  'No accounts, no sign-ups needed',
                  'Zero tracking, zero analytics',
                  'Instant — no upload/download wait',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-surface-200">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-surface-200 mt-10 text-lg max-w-2xl mx-auto animate-fade-in stagger-3">
            Other tools upload your files to their servers.{' '}
            <span className="text-white font-semibold">
              We process everything in your browser. Nothing leaves your device. Ever.
            </span>
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14 animate-fade-in">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map(({ num, icon: Icon, title, desc }, i) => (
              <div
                key={num}
                className={`text-center animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-brand-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-brand-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {num}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-surface-200 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-surface-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-14 animate-fade-in">
            Why NullUpload?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className={`text-center animate-fade-in-up stagger-${i + 1}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center mx-auto mb-4 transition-transform hover:scale-110">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-surface-200 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-4 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to process your images?
          </h2>
          <p className="text-surface-200 text-lg mb-8">
            No sign-up. No uploads. Just pick a tool and go.
          </p>
          <Link
            to="/compress"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg shadow-brand-600/25 text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
