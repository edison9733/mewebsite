import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import PulseFitDemo from './demos/PulseFitDemo.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/demos/pulsefit" element={<PulseFitDemo />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
