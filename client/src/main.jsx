import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import CarvoraDashboard from './carvora-dashboard.jsx'
import Carvora from './carvora.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Carvora />
  </StrictMode>,
)
