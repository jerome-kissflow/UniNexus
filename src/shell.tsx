import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { APPS, HOME } from './apps'

const SHORT: Record<string, string> = {
  mosaic: 'Suite',
  student: 'Pulse',
  admissions: 'Admit',
  scholarship: 'Aid',
  tower: 'Tower',
  finance: 'Cash',
  onboarding: 'Arrive',
  systems: 'Systems',
  grants: 'Grants',
}

export function Shell({ children }: { children: ReactNode }) {
  const loc = useLocation()
  const home = loc.pathname === '/'
  return (
    <div className="app-root">
      <main className="stage">{children}</main>
      {!home && (
        <nav className="dock" aria-label="UniNexus Suite">
          <NavLink to={HOME.path} title="UniNexus Suite" className="dock-btn">
            <HOME.icon size={16} />
            <span>{SHORT.mosaic}</span>
          </NavLink>
          {APPS.map((a) => (
            <NavLink key={a.id} to={a.path} title={a.label} className={({ isActive }) => (isActive ? 'on' : '')}>
              <a.icon size={16} />
              <span>{SHORT[a.id] ?? a.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
