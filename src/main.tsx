import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TierProvider } from './contexts/TierContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TierProvider>
        <App />
      </TierProvider>
    </BrowserRouter>
  </StrictMode>,
)
