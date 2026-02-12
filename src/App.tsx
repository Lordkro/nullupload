import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProcessingSpinner from './components/ProcessingSpinner'

const Home = lazy(() => import('./pages/Home'))
const Compressor = lazy(() => import('./pages/Compressor'))
const Converter = lazy(() => import('./pages/Converter'))
const Resizer = lazy(() => import('./pages/Resizer'))
const MetadataStripper = lazy(() => import('./pages/MetadataStripper'))
const PdfMerge = lazy(() => import('./pages/PdfMerge'))
const PdfSplit = lazy(() => import('./pages/PdfSplit'))
const PdfCompress = lazy(() => import('./pages/PdfCompress'))
const Pro = lazy(() => import('./pages/Pro'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <ProcessingSpinner label="Loading…" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/compress" element={<Compressor />} />
          <Route path="/convert" element={<Converter />} />
          <Route path="/resize" element={<Resizer />} />
          <Route path="/metadata" element={<MetadataStripper />} />
          <Route path="/pdf/merge" element={<PdfMerge />} />
          <Route path="/pdf/split" element={<PdfSplit />} />
          <Route path="/pdf/compress" element={<PdfCompress />} />
          <Route path="/pro" element={<Pro />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
