import { useMemo, useState } from 'react'
import { FUNDS, PROGRAMS } from '../data/seed'
import { usd, usdK } from '../lib/format'
import { useCampus } from '../state/store'
import { AppFrame, Filters, Glance, Search } from '../ui'
import { ROLES } from '../roles'
import { DelightToast, useDelight } from '../chrome'

export function Scholarship() {
  const { state, student, dispatch } = useCampus()
  const [role, setRole] = useState('director')
  const [q, setQ] = useState('')
  const [fundFilter, setFundFilter] = useState('all')
  const [fundId, setFundId] = useState(student.awards[0]?.fundId ?? state.funds[0].id)
  const fund = state.funds.find((f) => f.id === fundId) ?? state.funds[0]
  const pending = state.students.flatMap((s) => s.awards.map((a) => ({ s, a }))).filter((x) => x.a.status !== 'approved' && x.a.status !== 'declined')
  const tuition = state.students.filter((s) => !['enquiry', 'alumni'].includes(s.stage)).reduce((n, s) => n + s.tuition, 0)
  const posted$ = state.students.flatMap((s) => s.awards).filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0)
  const pending$ = pending.reduce((n, x) => n + x.a.recommended, 0)
  const { msg, cheer, clear } = useDelight()

  const packaged = useMemo(() => {
    return state.students.filter((s) => {
      if (!s.awards.length) return false
      const hit = s.name.toLowerCase().includes(q.toLowerCase())
      if (!hit) return false
      if (fundFilter === 'all') return true
      return s.awards.some((a) => a.fundId === fundFilter)
    })
  }, [state.students, q, fundFilter])

  return (
    <AppFrame kicker="Aid Atelier" title="Packaging" roles={ROLES.scholarship} role={role} onRole={setRole}>
      <DelightToast msg={msg} onClose={clear} />
      {role === 'director' && (
        <>
          <Glance
            items={[
              { k: 'Pending $', v: usdK(pending$), tone: pending$ ? 'var(--copper)' : undefined },
              { k: 'Posted', v: usdK(posted$) },
              { k: 'Unsigned', v: String(pending.length) },
              { k: 'Funds', v: String(state.funds.length) },
              { k: 'Packaged', v: String(packaged.length) },
              { k: 'Open file', v: student.preferred },
            ]}
          />
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search students" />
            <Filters
              value={fundFilter}
              onChange={setFundFilter}
              options={[{ id: 'all', label: 'All funds' }, ...state.funds.map((f) => ({ id: f.id, label: f.name }))]}
            />
          </div>
          <div className="fund-mosaic">
            {state.funds.map((f) => (
              <button key={f.id} type="button" className={`fund ${f.id === fund.id ? 'on' : ''}`} onClick={() => setFundId(f.id)}>
                <div className="tile-kicker">{f.kind}</div>
                <h2 style={{ fontSize: 20 }}>{f.name}</h2>
                <p className="meta">
                  {usdK(f.remaining)} left of {usdK(f.budget)}
                </p>
                <div className="bar">
                  <i style={{ width: `${Math.min(100, (f.committed / f.budget) * 100)}%` }} />
                </div>
              </button>
            ))}
          </div>
          <div className="workbench" style={{ marginTop: 16 }}>
            <div className="roster">
              {packaged.map((s) => (
                <button key={s.id} type="button" className={s.id === student.id ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                  <b>{s.name}</b>
                  <span className="meta">
                    {usd(s.awards.reduce((n, a) => n + (a.approved || a.recommended), 0))} · {s.awards.filter((a) => a.status === 'approved').length}/{s.awards.length} posted
                  </span>
                </button>
              ))}
            </div>
            <div className="panel">
              <h3>
                {student.name} · {PROGRAMS.find((p) => p.id === student.programId)?.name}
              </h3>
              {student.awards.length === 0 && <p className="meta">No rules fired on this file.</p>}
              {student.awards.map((a) => {
                const f = state.funds.find((x) => x.id === a.fundId) ?? FUNDS[0]
                return (
                  <div key={a.id} style={{ marginBottom: 18 }}>
                    <div className="chips">
                      <span className="chip">{a.status}</span>
                      <span className="chip">{f.name}</span>
                    </div>
                    <div className="field">
                      <input
                        type="number"
                        value={a.recommended}
                        disabled={a.status === 'approved' || a.status === 'declined'}
                        onChange={(e) => dispatch({ type: 'adjust-award', awardId: a.id, amount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="rule-stack">
                      {a.rationale.map((r) => (
                        <div key={r} className="rule">
                          Pass · {r}
                        </div>
                      ))}
                      {a.exceptions.map((r) => (
                        <div key={r} className="rule">
                          Hold · {r}
                        </div>
                      ))}
                    </div>
                    <div className="row-btns">
                      <button
                        type="button"
                        className="btn"
                        disabled={a.status === 'approved' || a.status === 'declined'}
                        onClick={() => {
                          dispatch({ type: 'approve-award', awardId: a.id })
                          cheer('Posted to the student account', `${student.preferred} sees this in Pulse immediately.`)
                        }}
                      >
                        Approve {usd(a.recommended)}
                      </button>
                      <button type="button" className="btn alt" disabled={a.status === 'approved' || a.status === 'declined'} onClick={() => dispatch({ type: 'decline-award', awardId: a.id })}>
                        Decline
                      </button>
                      <button type="button" className="btn alt" onClick={() => { dispatch({ type: 'send-award-letter', id: student.id }); cheer('Letter delivered', 'Official package is in the student inbox.') }}>
                        Send letter
                      </button>
                    </div>
                  </div>
                )
              })}
              <p className="meta">{fund.rule}</p>
            </div>
          </div>
        </>
      )}

      {role === 'cfo' && (
        <div>
          <Glance
            items={[
              { k: 'Unsigned aid', v: usdK(pending$) },
              { k: 'Gross tuition', v: usdK(tuition) },
              { k: 'Posted', v: usdK(posted$) },
              { k: 'To sign', v: String(pending.length) },
            ]}
          />
          <div className="scale">
            <div className="left">
              <div className="kicker">Unsigned aid</div>
              <div className="num" style={{ fontSize: 28 }}>
                {usdK(pending$)}
              </div>
            </div>
            <div className="right">
              <div className="kicker">Gross tuition</div>
              <div className="num" style={{ fontSize: 28 }}>
                {usdK(tuition)}
              </div>
              <p className="meta">Posted {usdK(posted$)}</p>
            </div>
          </div>
          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Fund</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map(({ s, a }) => (
                <tr key={a.id}>
                  <td>{s.name}</td>
                  <td>{state.funds.find((f) => f.id === a.fundId)?.name}</td>
                  <td>{usd(a.recommended)}</td>
                  <td>
                    <button type="button" className="btn" onClick={() => dispatch({ type: 'approve-award', awardId: a.id })}>
                      Sign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {role === 'student' && (
        <>
          <Glance
            items={[
              { k: 'Tuition', v: usd(student.tuition) },
              { k: 'Aid', v: usd(student.awards.reduce((n, a) => n + (a.approved || a.recommended), 0)) },
              { k: 'Net', v: usd(Math.max(0, student.tuition - student.awards.reduce((n, a) => n + (a.approved || a.recommended), 0))) },
              { k: 'Deposit', v: student.depositPaid ? 'Paid' : usd(student.deposit) },
              { k: 'Plan', v: student.paymentPlan ? usd(student.paymentPlan) + '/mo' : 'None' },
            ]}
          />
          <div className="split">
            <article className="award-letter">
              <div className="kicker" style={{ color: '#8a7d68' }}>
                {student.awards.every((a) => a.status === 'approved' || a.status === 'declined') ? 'Posted package' : 'Preview — not official'}
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>Dear {student.preferred},</h2>
              {student.awards.length === 0 && <p>Aid packaging has not started on this file yet. Estimates appear on Pulse after admission.</p>}
              {student.awards.map((a) => (
                <p key={a.id}>
                  {FUNDS.find((f) => f.id === a.fundId)?.name}: {usd(a.approved || a.recommended)} ({a.status})
                  {a.rationale[0] ? ` — ${a.rationale[0]}` : ''}
                </p>
              ))}
              <p>
                Estimated net tuition {usd(Math.max(0, student.tuition - student.awards.reduce((n, a) => n + (a.approved || a.recommended), 0)))}.
              </p>
              <div className="row-btns">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    dispatch({ type: 'send-award-letter', id: student.id })
                    cheer('Letter sent', `Visible in ${student.preferred}’s Pulse inbox.`)
                  }}
                >
                  Send to Pulse
                </button>
                <button
                  type="button"
                  className="btn alt"
                  onClick={() => dispatch({ type: 'set-payment-plan', id: student.id, monthly: Math.max(250, Math.round(Math.max(0, student.tuition - student.awards.reduce((n, a) => n + (a.approved || a.recommended), 0)) / 4)) })}
                >
                  4-month plan
                </button>
              </div>
            </article>
            <div className="side-list">
              <div className="panel">
                <h3>Cost stack</h3>
                {[
                  ['Tuition', usd(student.tuition)],
                  ['Recommended aid', usd(student.awards.reduce((n, a) => n + a.recommended, 0))],
                  ['Posted aid', usd(student.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0))],
                  ['Already paid', usd(student.paid)],
                  ['Balance', usd(Math.max(0, student.tuition - student.paid - student.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0)))],
                ].map(([k, v]) => (
                  <div key={k} className="rule" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>{k}</span>
                    <b className="mono">{v}</b>
                  </div>
                ))}
              </div>
              <div className="panel">
                <h3>What this means</h3>
                <ul className="why">
                  <li>A human still signs before Workday posts the package.</li>
                  <li>International students: I-20 uses posted aid, not the preview.</li>
                  <li>You can split the balance into four months from Pulse.</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {role === 'counselor' && (
        <div>
          <Glance
            items={[
              { k: 'To package', v: String(pending.length) },
              { k: 'Exceptions', v: String(pending.filter((x) => x.a.exceptions.length).length) },
              { k: 'This file', v: student.preferred },
              { k: 'Need', v: usd(Math.max(0, student.tuition - student.awards.reduce((n, a) => n + (a.approved || a.recommended), 0))) },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Fund</th>
                <th>Amount</th>
                <th>Hold</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map(({ s, a }) => (
                <tr key={a.id} className={s.id === student.id ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                  <td>{s.name}</td>
                  <td>{state.funds.find((f) => f.id === a.fundId)?.name}</td>
                  <td>{usd(a.recommended)}</td>
                  <td>{a.exceptions[0] ?? '—'}</td>
                  <td>
                    <button type="button" className="btn" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'approve-award', awardId: a.id }) }}>
                      Package
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {role === 'donor' && (
        <div>
          <Glance
            items={[
              { k: 'Funds', v: String(state.funds.length) },
              { k: 'Remaining', v: usdK(state.funds.reduce((n, f) => n + f.remaining, 0)) },
              { k: 'Committed', v: usdK(state.funds.reduce((n, f) => n + f.committed, 0)) },
              { k: 'Named awards', v: String(state.students.flatMap((s) => s.awards).length) },
              { k: 'First-gen', v: String(state.students.filter((s) => s.firstGen && s.awards.length).length) },
            ]}
          />
          <div className="split">
            <table className="table">
              <thead>
                <tr>
                  <th>Fund</th>
                  <th>Kind</th>
                  <th>Budget</th>
                  <th>Left</th>
                  <th>Recipients</th>
                </tr>
              </thead>
              <tbody>
                {state.funds.map((f) => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td>{f.kind}</td>
                    <td>{usdK(f.budget)}</td>
                    <td>{usdK(f.remaining)}</td>
                    <td>{state.students.filter((s) => s.awards.some((a) => a.fundId === f.id)).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="side-list">
              {state.students
                .filter((s) => s.awards.some((a) => a.status === 'approved' || a.status === 'pending-approval' || a.status === 'recommended'))
                .slice(0, 6)
                .map((s) => {
                  const line = s.awards.find((a) => a.status === 'approved') ?? s.awards[0]
                  const fund = FUNDS.find((f) => f.id === line?.fundId)
                  return (
                    <div key={s.id} className="impact">
                      <div className="kicker">{fund?.name}</div>
                      <b>
                        {s.preferred} · {PROGRAMS.find((p) => p.id === s.programId)?.name}
                      </b>
                      <p>
                        {usd(line?.approved || line?.recommended || 0)} · {s.city}, {s.country}
                        {s.firstGen ? ' · first-gen' : ''}
                      </p>
                      <p>{line?.rationale[0]}</p>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </AppFrame>
  )
}
