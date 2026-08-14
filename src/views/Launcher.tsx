import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { APPS } from '../apps'
import { useCampus } from '../state/store'
import { usdK } from '../lib/format'

export function Launcher() {
  const { state } = useCampus()
  const live = state.students.filter((s) => s.stage !== 'alumni')
  const metrics: Record<string, string> = {
    student: `${live.length} open files`,
    admissions: `${live.filter((s) => s.risk === 'blocked').length} blocked`,
    scholarship: `${usdK(state.funds.reduce((n, f) => n + f.remaining, 0))} remaining`,
    tower: `${live.filter((s) => s.depositPaid).length} deposits`,
    finance: `${usdK(live.reduce((n, s) => n + s.paid, 0))} collected`,
    onboarding: `${live.filter((s) => s.onboard.some((t) => t.status !== 'done')).length} open stamps`,
    systems: `${Math.round(state.connectors.reduce((n, c) => n + c.health, 0) / state.connectors.length)}% health`,
    grants: `${state.grants.filter((g) => g.compliance !== 'current').length} compliance flags`,
  }

  return (
    <div className="launch-simple">
      <div className="launch-brand">
        <div className="suite-mark">UniNexus Suite</div>
        <a className="powered-by" href="https://kissflow.com" target="_blank" rel="noreferrer">
          <span>Powered by</span>
          <img src="./kissflow-logo.png" alt="Kissflow" />
        </a>
      </div>
      <h1>Student lifecycle, one operating system</h1>
      <p>
        Eight applications share one canonical person at Northhaven University. Open any product — the same file,
        the same truth, from enquiry through sponsored research.
      </p>
      <div className="icon-grid">
        {APPS.map((app) => {
          const Icon = app.icon
          return (
            <Link key={app.id} to={app.path} className="app-icon" style={{ '--tile': app.accent } as CSSProperties}>
              <span className="app-icon-mark">
                <Icon size={20} strokeWidth={1.75} />
              </span>
              <b>{app.label}</b>
              <small>{app.kicker}</small>
              <p>{app.blurb}</p>
              <div className="live">{metrics[app.id]}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
