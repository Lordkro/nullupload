import { Outlet, NavLink, Link } from 'react-router-dom'
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
} from 'lucide-react'
import Logo from './Logo'

const imageNav = [
  { to: '/compress', label: 'Compress', icon: Minimize2 },
  { to: '/convert', label: 'Convert', icon: RefreshCw },
  { to: '/resize', label: 'Resize', icon: Scaling },
  { to: '/metadata', label: 'Strip EXIF', icon: FileX2 },
]

const pdfNav = [
  { to: '/pdf/merge', label: 'Merge PDF', icon: Merge },
  { to: '/pdf/split', label: 'Split PDF', icon: Scissors },
  { to: '/pdf/compress', label: 'Compress PDF', icon: FileText },
]

const allNav = [...imageNav, ...pdfNav]

export default function Layout() {
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

          <nav className="hidden md:flex items-center gap-1">
            {/* Image tools */}
            {imageNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-surface-200 hover:bg-surface-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}

            {/* Separator */}
            <div className="w-px h-6 bg-surface-800 mx-1" />

            {/* PDF tools */}
            {pdfNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-400'
                      : 'text-surface-200 hover:bg-surface-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Pro link */}
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

            {/* Privacy badge */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
              <Shield className="w-3.5 h-3.5" />
              100% Client-Side
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex overflow-x-auto border-t border-surface-800 px-2">
          {allNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                  isActive
                    ? 'text-brand-400 border-b-2 border-brand-400'
                    : 'text-surface-200'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/pro"
            className={({ isActive }) =>
              `flex items-center gap-1 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? 'text-brand-400 border-b-2 border-brand-400'
                  : 'text-brand-400/70'
              }`
            }
          >
            <Sparkles className="w-4 h-4" />
            Pro
          </NavLink>
        </nav>
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
