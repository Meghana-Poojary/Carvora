import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CarvoraDashboard from './carvora-dashboard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CarvoraDashboard />
  </StrictMode>,
)
