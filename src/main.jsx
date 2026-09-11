import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Tracker from './finance/Tracker.jsx'
import PulseFitDemo from './demos/PulseFitDemo.jsx'
import Landing from './intelligence/Landing.jsx'
import Study from './study/Study.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Primary interface: the money tracker. */}
        <Route path="/" element={<Tracker />} />
        {/* The study division: active recall and spaced repetition. */}
        <Route path="/study" element={<Study />} />
        {/* The original portfolio, one click away. */}
        <Route path="/portfolio" element={<App />} />
        <Route path="/demos/pulsefit" element={<PulseFitDemo />} />
        <Route path="/intelligence" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
