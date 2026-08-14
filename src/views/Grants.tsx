import { useMemo, useState } from 'react'
import { usd, usdK } from '../lib/format'
import { useCampus } from '../state/store'
import { AppFrame, Filters, Glance, Search } from '../ui'
import { ROLES } from '../roles'

export function Grants() {
  const { state, dispatch } = useCampus()
  const [role, setRole] = useState('pi')
  const [id, setId] = useState(state.grants[0].id)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [spend, setSpend] = useState(25000)
  const g = state.grants.find((x) => x.id === id) ?? state.grants[0]
  const nih = state.grants[0]
  const used = g.spent / g.amount

  const list = useMemo(() => {
    return state.grants.filter((row) => {
      if (q && !`${row.title} ${row.pi} ${row.sponsor}`.toLowerCase().includes(q.toLowerCase())) return false
      if (filter !== 'all' && row.compliance !== filter) return false
      return true
    })
  }, [state.grants, q, filter])

  return (
    <AppFrame kicker="Research Atlas" title="Sponsored programs" roles={ROLES.grants} role={role} onRole={setRole}>
      {role === 'pi' && (
        <div>
          <Glance
            items={[
              { k: 'Drawn', v: `${Math.round((nih.spent / nih.amount) * 100)}%` },
              { k: 'Spent', v: usdK(nih.spent) },
              { k: 'Award', v: usdK(nih.amount) },
              { k: 'Compliance', v: nih.compliance },
              { k: 'Team', v: 'Park + Okeke' },
            ]}
          />
          <div className="split">
          <div className="panel" style={{ maxWidth: 'none' }}>
          <div className="kicker">{nih.sponsor}</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{nih.title}</h2>
          <p className="meta">
            {nih.pi} · Daniel Okeke RA · {nih.start} → {nih.end}
          </p>
          <div style={{ margin: '20px 0', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 180 180" width="120">
              <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(28,25,20,0.12)" strokeWidth="16" />
              <circle
                cx="90"
                cy="90"
                r="70"
                fill="none"
                stroke="#5aa89a"
                strokeWidth="16"
                strokeDasharray={`${2 * Math.PI * 70 * (nih.spent / nih.amount)} ${2 * Math.PI * 70}`}
                transform="rotate(-90 90 90)"
              />
              <text x="90" y="86" textAnchor="middle" fill="#1c1914" fontFamily="Space Grotesk, sans-serif" fontSize="22">
                {Math.round((nih.spent / nih.amount) * 100)}%
              </text>
            </svg>
          </div>
          <p>{nih.paperTrail}</p>
          <div className="field">
            <input type="number" value={spend} onChange={(e) => setSpend(Number(e.target.value))} />
            <button type="button" className="btn" onClick={() => dispatch({ type: 'log-grant-spend', grantId: nih.id, amount: spend })}>
              Log spend
            </button>
            <button type="button" className="btn alt" onClick={() => dispatch({ type: 'submit-grant-report', grantId: nih.id })}>
              Submit RPPR
            </button>
          </div>
        </div>
          <div className="side-list">
            <div className="panel">
              <h3>Other awards</h3>
              {state.grants
                .filter((row) => row.id !== nih.id)
                .map((row) => (
                  <div key={row.id} className="rule" style={{ marginBottom: 8 }}>
                    <b>{row.pi}</b>
                    <div className="meta">
                      {row.sponsor} · {Math.round((row.spent / row.amount) * 100)}% drawn · {row.compliance}
                    </div>
                  </div>
                ))}
            </div>
            <div className="panel">
              <h3>RA on Pulse</h3>
              <p className="meta">Daniel’s Park BME Lab group is live. Appointment letter is still the open stamp.</p>
            </div>
          </div>
          </div>
        </div>
      )}

      {role === 'admin' && (
        <div>
          <Glance
            items={[
              { k: 'Awards', v: String(list.length) },
              { k: 'Due', v: String(state.grants.filter((x) => x.compliance === 'due').length), tone: 'var(--copper)' },
              { k: 'Overdue', v: String(state.grants.filter((x) => x.compliance === 'overdue').length), tone: 'var(--coral)' },
              { k: 'Drawn', v: `${Math.round(used * 100)}%` },
            ]}
          />
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search awards" />
            <Filters
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: 'All' },
                { id: 'current', label: 'Current' },
                { id: 'due', label: 'Due' },
                { id: 'overdue', label: 'Overdue' },
              ]}
            />
          </div>
          <div className="atlas">
            <div>
              {list.map((row) => (
                <button key={row.id} type="button" className={`grant-card ${row.id === g.id ? 'on' : ''}`} onClick={() => setId(row.id)}>
                  <div className="chips">
                    <span className={`chip ${row.compliance === 'current' ? 'clear' : row.compliance === 'due' ? 'watch' : 'blocked'}`}>
                      {row.compliance}
                    </span>
                    <span className="chip">{row.sponsor}</span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: 18, margin: '6px 0' }}>{row.title}</h2>
                  <div className="inkfill">
                    <i style={{ width: `${(row.spent / row.amount) * 100}%` }} />
                  </div>
                </button>
              ))}
            </div>
            <div className="panel">
              <h3>Paper trail</h3>
              <p>{g.paperTrail}</p>
              <p className="meta" style={{ marginTop: 10 }}>
                {usd(g.spent)} of {usd(g.amount)} · {Math.round(used * 100)}% drawn
              </p>
              <div className="field">
                <input type="number" value={spend} onChange={(e) => setSpend(Number(e.target.value))} />
                <button type="button" className="btn" onClick={() => dispatch({ type: 'log-grant-spend', grantId: g.id, amount: spend })}>
                  Log spend
                </button>
              </div>
              <div className="row-btns">
                <button type="button" className="btn alt" onClick={() => dispatch({ type: 'submit-grant-report', grantId: g.id })}>
                  Submit report
                </button>
                <button type="button" className="btn alt" onClick={() => dispatch({ type: 'clear-compliance', grantId: g.id })}>
                  Clear compliance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'provost' && (
        <div>
          <Glance
            items={[
              { k: 'Portfolio', v: usdK(state.grants.reduce((n, x) => n + x.amount, 0)) },
              { k: 'Spent', v: usdK(state.grants.reduce((n, x) => n + x.spent, 0)) },
              { k: 'Awards', v: String(state.grants.length) },
              { k: 'Compliance flags', v: String(state.grants.filter((x) => x.compliance !== 'current').length) },
            ]}
          />
          <div className="heat">
          {['Engineering', 'Arts & Sciences', 'Health Sciences'].map((college) => {
            const rows = state.grants.filter((x) => x.college === college)
            const amt = rows.reduce((n, x) => n + x.amount, 0)
            return (
              <button
                key={college}
                type="button"
                className="heat-cell"
                style={{ background: 'rgba(90,168,154,0.12)', textAlign: 'left', color: 'inherit' }}
                onClick={() => rows[0] && setId(rows[0].id)}
              >
                <span className="kicker">{college}</span>
                <b style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{usdK(amt)}</b>
                <span className="meta">{rows.length} active awards</span>
              </button>
            )
          })}
          </div>
        </div>
      )}

      {role === 'compliance' && (
        <div>
          <Glance
            items={[
              { k: 'Current', v: String(state.grants.filter((x) => x.compliance === 'current').length) },
              { k: 'Due', v: String(state.grants.filter((x) => x.compliance === 'due').length) },
              { k: 'Overdue', v: String(state.grants.filter((x) => x.compliance === 'overdue').length), tone: 'var(--coral)' },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Award</th>
                <th>PI</th>
                <th>Status</th>
                <th>Drawn</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state.grants.map((row) => (
                <tr key={row.id} className={row.id === g.id ? 'on' : ''} onClick={() => setId(row.id)}>
                  <td>{row.title}</td>
                  <td>{row.pi}</td>
                  <td>{row.compliance}</td>
                  <td>{Math.round((row.spent / row.amount) * 100)}%</td>
                  <td>
                    <button type="button" className="btn" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'clear-compliance', grantId: row.id }) }}>
                      Clear
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {role === 'ra' && (
        <div>
          <Glance
            items={[
              { k: 'Award', v: nih.title.split(':')[0] },
              { k: 'Drawn', v: `${Math.round((nih.spent / nih.amount) * 100)}%` },
              { k: 'Remaining', v: usdK(nih.amount - nih.spent) },
              { k: 'RA hours', v: '20 / wk' },
            ]}
          />
          <div className="split">
            <div className="panel">
              <h3>Log spend · {nih.pi}</h3>
              <p className="meta">{nih.paperTrail}</p>
              <div className="field">
                <input type="number" value={spend} onChange={(e) => setSpend(Number(e.target.value))} />
                <button type="button" className="btn" onClick={() => dispatch({ type: 'log-grant-spend', grantId: nih.id, amount: spend })}>
                  Log spend
                </button>
              </div>
              <h3 style={{ marginTop: 16 }}>This week</h3>
              {[
                ['Mon', 'Bench — shear-stress assay', '6 hrs'],
                ['Tue', 'Journal club prep', '3 hrs'],
                ['Wed', 'Imaging core', '5 hrs'],
                ['Thu', 'Journal club + lab meeting', '4 hrs'],
                ['Fri', 'Notebook + spend log', '2 hrs'],
              ].map(([d, t, h]) => (
                <div key={d} className="rule" style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <span>
                    <b>{d}</b> · {t}
                  </span>
                  <span className="meta">{h}</span>
                </div>
              ))}
            </div>
            <div className="side-list">
              <div className="panel">
                <h3>Deliverables</h3>
                <ul className="why">
                  <li>Year-2 RPPR figures due 30 Sep</li>
                  <li>Workday appointment letter still open</li>
                  <li>Lab safety module on Canvas</li>
                </ul>
                <button type="button" className="btn alt" onClick={() => dispatch({ type: 'submit-grant-report', grantId: nih.id })}>
                  Flag figures ready
                </button>
              </div>
              <div className="panel">
                <h3>Lab roster</h3>
                <div className="rule" style={{ marginBottom: 8 }}>
                  <b>Dr. Helen Park</b>
                  <div className="meta">PI · Engineering</div>
                </div>
                <div className="rule" style={{ marginBottom: 8 }}>
                  <b>Daniel Okeke</b>
                  <div className="meta">RA 20 hrs · Pulse / Campus · Park BME Lab</div>
                </div>
                <p className="meta">Post updates in the Park BME Lab group so the cohort sees bench hours.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppFrame>
  )
}
