import { Link } from 'react-router-dom'
import { Home, ArrowRight } from 'lucide-react'
import Logo from '../components/Logo'
import { useSEO } from '../hooks/useSEO'

export default function NotFound() {
  useSEO({
    title: '404 — Page Not Found | NullUpload',
    description: 'This page doesn\'t exist. Just like our servers.',
  })

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 text-center animate-fade-in">
      <Logo size={64} className="mb-8 opacity-50" />

      <h1 className="text-6xl md:text-8xl font-black text-white mb-4">404</h1>

      <p className="text-2xl font-bold text-surface-200 mb-2">
        Page not found
      </p>
      <p className="text-surface-700 mb-10 max-w-md">
        This page doesn't exist. Just like our servers — we don't have any.
        Your files still go nowhere, though.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-brand-600/20"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Link>
        <Link
          to="/compress"
          className="inline-flex items-center gap-2 bg-surface-800 hover:bg-surface-700 text-white font-semibold px-6 py-3 rounded-xl transition border border-surface-700"
        >
          Try a Tool
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
