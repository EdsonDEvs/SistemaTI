import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './ui/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Services from './pages/Services.jsx'
import Orders from './pages/Orders.jsx'
import Finance from './pages/Finance.jsx'
import Tickets from './pages/Tickets.jsx'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}> 
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/finance" element={<Finance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

