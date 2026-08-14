import { useEffect, useState, type ReactNode } from 'react'
import type { Role } from './roles'

export function useCompose(key: string) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(false)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => setReady(true), reduce ? 40 : 160)
    return () => window.clearTimeout(t)
  }, [key])
  return ready
}

export function RoleBar({
  roles,
  value,
  onChange,
}: {
  roles: readonly Role[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="role-bar" role="tablist" aria-label="Persona dashboards">
      {roles.map((r) => (
        <button
          key={r.id}
          type="button"
          role="tab"
          aria-selected={r.id === value}
          className={`role-pill ${r.id === value ? 'on' : ''}`}
          onClick={() => onChange(r.id)}
        >
          <span className="av">{r.initials}</span>
          <span>
            <b>{r.name}</b>
            <small>{r.title}</small>
          </span>
        </button>
      ))}
    </div>
  )
}

export function Compose({
  ready,
  label,
  children,
}: {
  ready: boolean
  label: string
  children: ReactNode
}) {
  if (!ready) {
    return (
      <div className="compose" role="status" aria-live="polite">
        <div className="compose-mark" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <p>Opening {label}</p>
      </div>
    )
  }
  return <div className="view-enter">{children}</div>
}

export function Search({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <input className="search" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  )
}

export function Filters({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <div className="filters">
      {options.map((o) => (
        <button key={o.id} type="button" className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Glance({ items }: { items: { k: string; v: string; tone?: string }[] }) {
  return (
    <div className="glance">
      {items.map((it) => (
        <div key={it.k} className="glance-cell">
          <span>{it.k}</span>
          <b style={it.tone ? { color: it.tone } : undefined}>{it.v}</b>
        </div>
      ))}
    </div>
  )
}

export function AppFrame({
  kicker,
  title,
  roles,
  role,
  onRole,
  children,
}: {
  kicker: string
  title: string
  roles: readonly Role[]
  role: string
  onRole: (id: string) => void
  children: ReactNode
}) {
  const ready = useCompose(role)
  const current = roles.find((r) => r.id === role) ?? roles[0]
  return (
    <div>
      <div className="app-head">
        <div>
          <div className="kicker">UniNexus Suite · {kicker}</div>
          <h1>{title}</h1>
        </div>
        <RoleBar roles={roles} value={role} onChange={onRole} />
      </div>
      <Compose ready={ready} label={current.title}>
        {children}
      </Compose>
    </div>
  )
}
