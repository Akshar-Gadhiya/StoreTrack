import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initDemoData } from './utils/initDemoData'

// Initialize demo data on app start removed - using real backend
// initDemoData()

import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster position="top-right" reverseOrder={false} />
    <App />
  </StrictMode>,
)
