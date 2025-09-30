import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

export default function AppLayout(){
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Sistema TI</div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/services">Serviços</NavLink>
          <NavLink to="/orders">OS</NavLink>
          <NavLink to="/tickets">Chamados</NavLink>
          <NavLink to="/finance">Financeiro</NavLink>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}

