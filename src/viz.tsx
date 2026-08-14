import type { CSSProperties } from 'react'

export function RadarField({
  points,
  onPick,
  activeId,
}: {
  points: { id: string; r: number; a: number; tone: string; label: string; sub: string }[]
  onPick: (id: string) => void
  activeId?: string
}) {
  const size = 420
  const c = size / 2
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg" role="img" aria-label="Admissions radar">
      <defs>
        <radialGradient id="radg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="rgba(142,185,200,0.18)" />
          <stop offset="70%" stopColor="rgba(142,185,200,0.04)" />
          <stop offset="100%" stopColor="rgba(142,185,200,0)" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r="198" fill="url(#radg)" />
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <circle key={t} cx={c} cy={c} r={190 * t} fill="none" stroke="rgba(28,25,20,0.12)" />
      ))}
      {[0, 45, 90, 135].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const x = c + Math.cos(rad) * 190
        const y = c + Math.sin(rad) * 190
        return <line key={deg} x1={c * 2 - x} y1={c * 2 - y} x2={x} y2={y} stroke="rgba(28,25,20,0.08)" />
      })}
      <g className="radar-sweep">
        <path d={`M ${c} ${c} L ${c} ${c - 190} A 190 190 0 0 1 ${c + 80} ${c - 172} Z`} fill="rgba(142,185,200,0.12)" />
      </g>
      <text x={c} y={c - 198} textAnchor="middle" className="radar-label">
        14d
      </text>
      <text x={c + 52} y={c - 88} className="radar-label">
        7d
      </text>
      <text x={c + 28} y={c - 38} className="radar-label">
        3d
      </text>
      {points.map((p) => {
        const rad = ((p.a - 90) * Math.PI) / 180
        const rr = 28 + p.r * 162
        const x = c + Math.cos(rad) * rr
        const y = c + Math.sin(rad) * rr
        const on = p.id === activeId
        return (
          <g key={p.id} className="radar-blip" onClick={() => onPick(p.id)} style={{ cursor: 'pointer' }}>
            {on && <circle cx={x} cy={y} r="16" fill="none" stroke={p.tone} strokeOpacity="0.6" />}
            <circle cx={x} cy={y} r={on ? 7 : 5} fill={p.tone} />
            <title>{`${p.label} · ${p.sub}`}</title>
          </g>
        )
      })}
    </svg>
  )
}

export function Cascade({
  rows,
}: {
  rows: { label: string; n: number }[]
}) {
  const max = rows[0]?.n ?? 1
  return (
    <div className="cascade">
      {rows.map((r, i) => {
        const w = 42 + (r.n / max) * 58
        const next = rows[i + 1]
        const conv = next ? Math.round((next.n / r.n) * 100) : null
        return (
          <div key={r.label} className="cascade-row" style={{ '--w': `${w}%` } as CSSProperties}>
            <div className="cascade-slab">
              <span>{r.label}</span>
              <b>{r.n.toLocaleString('en-US')}</b>
            </div>
            {conv != null && <em>{conv}%</em>}
          </div>
        )
      })}
    </div>
  )
}

export function Stream({
  series,
}: {
  series: { month: string; billed: number; collected: number }[]
}) {
  const w = 560
  const h = 160
  const max = Math.max(...series.flatMap((s) => [s.billed, s.collected]))
  const sx = (i: number) => (i / (series.length - 1)) * (w - 24) + 12
  const sy = (v: number) => h - 18 - (v / max) * (h - 36)
  const path = (key: 'billed' | 'collected') =>
    series.map((s, i) => `${i === 0 ? 'M' : 'L'} ${sx(i)} ${sy(s[key])}`).join(' ')
  const area = `${path('collected')} L ${sx(series.length - 1)} ${h - 18} L ${sx(0)} ${h - 18} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="stream-svg" aria-label="Collections pulse">
      <path d={area} fill="rgba(90,168,154,0.16)" />
      <path d={path('billed')} fill="none" stroke="rgba(201,163,106,0.85)" strokeWidth="1.6" />
      <path d={path('collected')} fill="none" stroke="rgba(90,168,154,0.95)" strokeWidth="2" />
      {series.map((s, i) => (
        <text key={s.month} x={sx(i)} y={h - 4} textAnchor="middle" className="radar-label">
          {s.month}
        </text>
      ))}
    </svg>
  )
}

export function Rings({
  items,
}: {
  items: { label: string; used: number; total: number; color: string }[]
}) {
  return (
    <div className="rings">
      {items.map((it, i) => {
        const p = Math.min(1, it.used / it.total)
        const r = 54 - i * 10
        const c = 2 * Math.PI * r
        return (
          <svg key={it.label} className="ring-svg" viewBox="0 0 140 140" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(28,25,20,0.1)" strokeWidth="7" />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={it.color}
              strokeWidth="7"
              strokeDasharray={`${c * p} ${c}`}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
        )
      })}
    </div>
  )
}

export function JourneyPath({
  stages,
  current,
}: {
  stages: { id: string; label: string }[]
  current: string
}) {
  const idx = Math.max(0, stages.findIndex((s) => s.id === current))
  return (
    <ol className="jpath">
      {stages.map((s, i) => (
        <li key={s.id} className={i < idx ? 'done' : i === idx ? 'now' : 'later'}>
          <i />
          <span>{s.label}</span>
        </li>
      ))}
    </ol>
  )
}

export const LIFE = [
  { id: 'enquiry', label: 'Enquiry' },
  { id: 'applied', label: 'Applied' },
  { id: 'verifying', label: 'Evidence' },
  { id: 'departmental', label: 'Faculty' },
  { id: 'scholarship', label: 'Aid' },
  { id: 'offer', label: 'Offer' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'enrolled', label: 'Enrolled' },
  { id: 'onboarding', label: 'Welcome' },
  { id: 'alumni', label: 'Alumni' },
]
