import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
  Shield,
  Minimize2,
  RefreshCw,
  Scaling,
  FileX2,
  Sparkles,
  FileText,
  Scissors,
  Merge,
  Image,
  FileType,
  ChevronDown,
} from 'lucide-react'
import Logo from './Logo'

const imageNav = [
  { to: '/compress', label: 'Compress', icon: Minimize2 },
  { to: '/convert', label: 'Convert', icon: RefreshCw },
  { to: '/resize', label: 'Resize', icon: Scaling },
  { to: '/metadata', label: 'Strip Metadata', icon: FileX2 },
]

const pdfNav = [
  { to: '/pdf/merge', label: 'Merge', icon: Merge },
  { to: '/pdf/split', label: 'Split', icon: Scissors },
  { to: '/pdf/compress', label: 'Compress', icon: FileText },
]

function NavDropdown({ label, icon: Icon, items }: { label: string; icon: React.ElementType; items: typeof imageNav }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const isGroupActive = items.some(item => location.pathname === item.to)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
          isGroupActive
            ? 'bg-brand-600/20 text-brand-400'
            : 'text-surface-200 hover:bg-surface-800 hover:text-white'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-surface-900 border border-surface-800 rounded-xl shadow-xl shadow-black/30 py-1.5 min-w-[180px] z-50 animate-fade-in">
          {items.map(({ to, label: itemLabel, icon: ItemIcon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600/15 text-brand-400'
                    : 'text-surface-200 hover:bg-surface-800 hover:text-white'
                }`
              }
            >
              <ItemIcon className="w-4 h-4" />
              {itemLabel}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-white font-bold text-xl hover:opacity-90 transition"
          >
            <Logo size={28} />
            <span>
              Null<span className="text-brand-400">Upload</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavDropdown label="Image Tools" icon={Image} items={imageNav} />
            <NavDropdown label="PDF Tools" icon={FileType} items={pdfNav} />
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink
              to="/pro"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500/15 to-purple-500/15 border-brand-500/30 text-brand-400'
                    : 'border-brand-500/20 text-brand-400 hover:bg-brand-500/10'
                }`
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pro
            </NavLink>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <Shield className="w-3.5 h-3.5" />
              100% Client-Side
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-surface-200 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface-900 border-t border-surface-800 absolute top-16 left-0 right-0 shadow-xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 space-y-2">
              {/* Image Tools section */}
              <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Image Tools</div>
              {imageNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-400'
                        : 'text-surface-200 hover:bg-surface-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}

              {/* PDF Tools section */}
              <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mt-4 mb-2">PDF Tools</div>
              {pdfNav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-400'
                        : 'text-surface-200 hover:bg-surface-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}

              {/* Pro link */}
              <div className="mt-4 pt-4 border-t border-surface-800">
                <NavLink
                  to="/pro"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500/15 to-purple-500/15 text-brand-400'
                        : 'text-brand-400 hover:bg-brand-500/10'
                    }`
                  }
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Pro — $5.99/mo
                </NavLink>
              </div>

              {/* Privacy badge */}
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg mt-2">
                <Shield className="w-4 h-4" />
                100% Client-Side Processing
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <Logo size={24} />
                <span className="text-white font-bold text-lg">
                  Null<span className="text-brand-400">Upload</span>
                </span>
              </div>
              <p className="text-surface-200 text-sm leading-relaxed max-w-xs">
                Privacy-first file tools. Everything runs in your browser.
                Your files go nowhere.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Image Tools</h3>
              <ul className="space-y-2">
                {imageNav.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-surface-200 hover:text-white text-sm transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">PDF Tools</h3>
              <ul className="space-y-2">
                {pdfNav.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-surface-200 hover:text-white text-sm transition"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Our Promise</h3>
              <ul className="text-surface-200 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  Zero data leaves your device — ever
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  No accounts, no tracking, no analytics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  Works offline after first load
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  Open processing — inspect the code yourself
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-surface-800 text-center text-surface-700 text-xs">
            NullUpload — Your files go nowhere. All processing happens in your browser.
          </div>
        </div>
      </footer>
    </div>
  )
}
