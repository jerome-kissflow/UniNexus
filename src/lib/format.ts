export function usd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function usdK(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return usd(n)
}

export function compact(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

export function when(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function whenFull(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function daysBetween(iso: string, now = '2026-08-14') {
  const a = new Date(iso + (iso.length <= 10 ? 'T12:00:00' : ''))
  const b = new Date(now + 'T12:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export function hashHue(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % 360
}
