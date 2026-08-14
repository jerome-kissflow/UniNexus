import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONNECTORS, FUNNEL_SEED, PROGRAMS } from '../data/seed'
import { compact, usdK, when } from '../lib/format'
import { useCampus } from '../state/store'
import { Cascade } from '../viz'
import { AppFrame, Glance } from '../ui'
import { ROLES } from '../roles'
import { DelightToast, useDelight } from '../chrome'
import { cabinetBrief } from '../insights'

export function ControlTower() {
  const { state, dispatch } = useCampus()
  const [role, setRole] = useState('provost')
  const deposited = state.students.filter((s) => s.depositPaid).length
  const blocked = state.students.filter((s) => s.risk === 'blocked')
  const intl = state.students.filter((s) => s.residency === 'international' && !['alumni', 'enquiry'].includes(s.stage))
  const aidCommitted = state.funds.reduce((n, f) => n + f.committed, 0)
  const net = state.students
    .filter((s) => !['enquiry', 'alumni'].includes(s.stage))
    .reduce((n, s) => n + s.tuition - s.awards.filter((a) => a.status === 'approved').reduce((m, a) => m + a.approved, 0), 0)
  const csat = Math.round(
    state.students.filter((s) => s.csat).reduce((n, s) => n + s.csat, 0) / Math.max(1, state.students.filter((s) => s.csat).length),
  )
  const { msg, cheer, clear } = useDelight()
  const origins = [
    { code: 'US', x: 70, y: 118, n: 5 },
    { code: 'IN', x: 210, y: 90, n: 3 },
    { code: 'JP', x: 250, y: 70, n: 1 },
    { code: 'IT', x: 155, y: 78, n: 1 },
    { code: 'NG', x: 148, y: 120, n: 1 },
    { code: 'SN', x: 128, y: 110, n: 1 },
  ]

  return (
    <AppFrame kicker="Control Tower" title="Fall 2026" roles={ROLES.tower} role={role} onRole={setRole}>
      <DelightToast msg={msg} onClose={clear} />
      {role === 'provost' && (
        <div>
          <div className="split">
          <div className="panel">
            <Glance
              items={[
                { k: 'Deposited', v: String(deposited) },
                { k: 'Intl pre-census', v: String(intl.length) },
                { k: 'Blocked', v: String(blocked.length), tone: blocked.length ? 'var(--coral)' : undefined },
                { k: 'Enquiry aging', v: String(state.students.filter((s) => s.stage === 'enquiry').length) },
                { k: 'CSAT', v: String(csat) },
              ]}
            />
            <button
              type="button"
              className="btn alt"
              style={{ marginBottom: 10 }}
              onClick={() => {
                void navigator.clipboard?.writeText(cabinetBrief(state))
                cheer('Brief copied', 'Paste into the cabinet deck — one paragraph, no slides required.')
              }}
            >
              Copy cabinet brief
            </button>
            <h3>Origin of the class</h3>
            <div className="geo">
              <svg viewBox="0 0 320 180">
                {origins.map((o) => (
                  <g key={o.code}>
                    <path d={`M ${o.x} ${o.y} Q 160 ${o.y * 0.4} 168 86`} fill="none" stroke="rgba(201,163,106,0.55)" strokeWidth={Math.min(4, 0.8 + o.n)} />
                    <circle cx={o.x} cy={o.y} r={4 + o.n} fill="#8eb9c8" />
                    <text x={o.x + 8} y={o.y + 4} fill="#1c1914" fontSize="10">
                      {o.code}
                    </text>
                  </g>
                ))}
                <circle cx="168" cy="86" r="6" fill="#2f6fed" />
              </svg>
            </div>
            <p className="meta">{intl.length} international files still pre-census.</p>
            <div className="roster" style={{ marginTop: 12, maxHeight: 240 }}>
              {intl.map((s) => (
                <button key={s.id} type="button" onClick={() => dispatch({ type: 'focus', id: s.id })}>
                  <b>{s.name}</b>
                  <span className="meta">
                    {s.country} · {s.stage} · due {when(s.due)}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="panel">
            <h3>Program pressure</h3>
            {PROGRAMS.map((p) => {
              const n = state.students.filter((s) => s.programId === p.id && s.depositPaid).length
              const people = state.students.filter((s) => s.programId === p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => people[0] && dispatch({ type: 'focus', id: people[0].id })}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 0, color: 'inherit', margin: '10px 0' }}
                >
                  <div>{p.name}</div>
                  <div className="inkfill">
                    <i style={{ width: `${Math.min(100, ((n + p.yieldTarget * 0.7) / p.seats) * 100)}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
          </div>
        </div>
      )}

      {role === 'cfo' && (
        <div>
          <Glance
            items={[
              { k: 'Net in play', v: usdK(net) },
              { k: 'Aid committed', v: usdK(aidCommitted) },
              { k: 'August lag', v: '$1.1M', tone: 'var(--coral)' },
              { k: 'Census', v: compact(8240 + deposited) },
            ]}
          />
          <div className="horizon">
            <div className="giant">
              <div className="kicker">Net tuition in play</div>
              <div className="num">{usdK(net)}</div>
              <div className="delta">Aid committed {usdK(aidCommitted)}</div>
            </div>
            <Link to="/finance" className="panel" style={{ display: 'grid', alignContent: 'center' }}>
              <div className="kicker">August lag</div>
              <b style={{ fontFamily: 'var(--serif)', fontSize: 28, color: 'var(--coral)' }}>$1.1M</b>
              <p className="meta">Open Treasury</p>
            </Link>
            <div className="panel" style={{ display: 'grid', alignContent: 'center' }}>
              <div className="kicker">Census</div>
              <b style={{ fontFamily: 'var(--serif)', fontSize: 28 }}>{compact(8240 + deposited)}</b>
            </div>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Tuition</th>
                <th>Paid</th>
                <th>Aid posted</th>
              </tr>
            </thead>
            <tbody>
              {state.students
                .filter((s) => !['enquiry', 'alumni'].includes(s.stage))
                .map((s) => (
                  <tr key={s.id} className={s.id === state.focusId ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                    <td>{s.name}</td>
                    <td>{usdK(s.tuition)}</td>
                    <td>{usdK(s.paid)}</td>
                    <td>{usdK(s.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0))}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {role === 'cio' && (
        <div>
          <Glance
            items={[
              { k: 'Connectors', v: String(CONNECTORS.length) },
              { k: 'Mean health', v: `${Math.round(CONNECTORS.reduce((n, c) => n + c.health, 0) / CONNECTORS.length)}%` },
              { k: 'Below 96%', v: String(CONNECTORS.filter((c) => c.health < 96).length) },
            ]}
          />
          <div className="heat">
          {CONNECTORS.map((c) => (
            <Link key={c.id} to="/systems" className="heat-cell" style={{ background: `rgba(90,168,154,${c.health / 400})` }}>
              <span className="kicker">{c.vendor}</span>
              <b style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{c.health}%</b>
              <span className="meta">
                {c.product} · {c.latencyMs} ms
              </span>
            </Link>
          ))}
          </div>
        </div>
      )}

      {role === 'admit' && (
        <div>
          <Glance
            items={[
              { k: 'Blocked', v: String(blocked.length), tone: blocked.length ? 'var(--coral)' : undefined },
              { k: 'Deposited', v: String(deposited) },
              { k: 'CSAT', v: String(csat) },
            ]}
          />
          <div className="split">
          <div className="panel">
            <h3>Conversion river</h3>
            <Cascade rows={FUNNEL_SEED.map((r) => ({ label: r.stage, n: r.n }))} />
          </div>
          <div className="panel">
            <h3>Blocked · {blocked.length}</h3>
            <p className="meta">Experience index {csat}</p>
            <div className="roster" style={{ maxHeight: 360, marginTop: 10 }}>
              {blocked.map((s) => (
                <button key={s.id} type="button" onClick={() => dispatch({ type: 'focus', id: s.id })}>
                  <b>{s.name}</b>
                  <span className="meta">{s.nextAction}</span>
                </button>
              ))}
            </div>
            <Link to="/admissions" className="btn" style={{ display: 'inline-block', marginTop: 12 }}>
              Open workbench
            </Link>
          </div>
          </div>
        </div>
      )}

      {role === 'registrar' && (
        <div>
          <Glance
            items={[
              { k: 'Census headcount', v: compact(8240 + deposited) },
              { k: 'Deposits this term', v: String(deposited) },
              { k: 'Enrolled mosaic', v: String(state.students.filter((s) => s.stage === 'enrolled' || s.stage === 'onboarding').length) },
              { k: 'Intl pre-census', v: String(intl.length) },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Program</th>
                <th>Deposited</th>
                <th>In mosaic</th>
                <th>Seats</th>
                <th>Fill</th>
              </tr>
            </thead>
            <tbody>
              {PROGRAMS.map((p) => {
                const people = state.students.filter((s) => s.programId === p.id)
                const dep = people.filter((s) => s.depositPaid).length
                return (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{dep}</td>
                    <td>{people.length}</td>
                    <td>{p.seats}</td>
                    <td>{Math.round((people.length / p.seats) * 100)}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {role === 'success' && (
        <div>
          <Glance
            items={[
              { k: 'Blocked', v: String(blocked.length), tone: 'var(--coral)' },
              { k: 'Watch', v: String(state.students.filter((s) => s.risk === 'watch').length) },
              { k: 'Waiting on student', v: String(state.students.filter((s) => s.nextActor === 'student' && s.stage !== 'alumni').length) },
              { k: 'CSAT', v: String(csat) },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Risk</th>
                <th>Stage</th>
                <th>Next</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {state.students
                .filter((s) => s.risk !== 'clear' && s.stage !== 'alumni')
                .map((s) => (
                  <tr key={s.id} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                    <td>{s.name}</td>
                    <td>{s.risk}</td>
                    <td>{s.stage}</td>
                    <td>{s.nextAction}</td>
                    <td>{when(s.due)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </AppFrame>
  )
}
