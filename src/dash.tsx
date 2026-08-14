export function Dash({
  items,
}: {
  items: { label: string; value: string; hint?: string; tone?: string }[]
}) {
  return (
    <div className="dash">
      {items.map((it) => (
        <div key={it.label} className="dash-cell">
          <span>{it.label}</span>
          <b style={it.tone ? { color: it.tone } : undefined}>{it.value}</b>
          {it.hint && <em>{it.hint}</em>}
        </div>
      ))}
    </div>
  )
}

export function Gauge({
  value,
  label,
  color = '#1557e0',
  ink = '#1c1914',
}: {
  value: number
  label: string
  color?: string
  ink?: string
}) {
  const p = Math.max(0, Math.min(1, value))
  const r = 36
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 100 88" className="gauge" aria-label={label}>
      <path d="M14 72 A 36 36 0 1 1 86 72" fill="none" stroke="rgba(26,23,18,0.1)" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M14 72 A 36 36 0 1 1 86 72"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${c * 0.75 * p} ${c}`}
      />
      <text x="50" y="62" textAnchor="middle" fill={ink} fontFamily="Space Grotesk, Syne, sans-serif" fontSize="14" fontWeight="600">
        {Math.round(p * 100)}%
      </text>
      <text x="50" y="76" textAnchor="middle" fill={ink} fontSize="7" opacity="0.7">
        {label}
      </text>
    </svg>
  )
}

export function Spark({ values, color = '#5aa89a' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1)
  const w = 120
  const h = 36
  const step = w / Math.max(1, values.length - 1)
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - (v / max) * (h - 4)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="spark" aria-hidden>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={color} opacity="0.18" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" />
    </svg>
  )
}

export function SegBar({
  parts,
}: {
  parts: { n: number; color: string; label: string }[]
}) {
  const t = parts.reduce((s, p) => s + p.n, 0) || 1
  return (
    <div>
      <div className="segbar">
        {parts.map((p) => (
          <i key={p.label} style={{ width: `${(p.n / t) * 100}%`, background: p.color }} title={`${p.label} ${p.n}`} />
        ))}
      </div>
      <div className="seglabels">
        {parts.map((p) => (
          <span key={p.label}>
            <i style={{ background: p.color }} />
            {p.label} {p.n}
          </span>
        ))}
      </div>
    </div>
  )
}
