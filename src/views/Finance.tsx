import { useMemo, useState } from 'react'
import { MONTHLY_CASH } from '../data/seed'
import { usd, usdK } from '../lib/format'
import { useCampus } from '../state/store'
import { Stream } from '../viz'
import { AppFrame, Filters, Glance, Search } from '../ui'
import { ROLES } from '../roles'
import { DelightToast, useDelight } from '../chrome'
import { netBalance } from '../insights'

export function Finance() {
  const { state, dispatch } = useCampus()
  const [role, setRole] = useState('cfo')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [amt, setAmt] = useState(800)
  const billedOpen = state.students.filter((s) => !['enquiry', 'alumni'].includes(s.stage)).reduce((n, s) => n + s.tuition, 0)
  const awarded = state.students.flatMap((s) => s.awards).filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0)
  const collected = state.students.reduce((n, s) => n + s.paid, 0)
  const intlAtRisk = state.students.filter((s) => s.residency === 'international' && ['departmental', 'scholarship', 'offer', 'verifying'].includes(s.stage))

  const rows = useMemo(() => {
    return state.students.filter((s) => {
      if (['enquiry', 'alumni'].includes(s.stage)) return false
      if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false
      if (filter === 'unpaid') return !s.depositPaid
      if (filter === 'intl') return s.residency === 'international'
      if (filter === 'paid') return s.paid > 0
      return true
    })
  }, [state.students, q, filter])

  const focus = state.students.find((s) => s.id === state.focusId)
  const till = focus ?? rows[0]
  const { msg, cheer, clear } = useDelight()
  const aging = [
    { k: '0–30d', v: rows.filter((s) => s.stage === 'offer' || s.stage === 'deposit').length },
    { k: '31–60d', v: rows.filter((s) => ['scholarship', 'departmental'].includes(s.stage)).length },
    { k: '60d+', v: rows.filter((s) => ['verifying', 'applied'].includes(s.stage)).length },
  ]

  return (
    <AppFrame kicker="Treasury Pulse" title="Cash" roles={ROLES.finance} role={role} onRole={setRole}>
      <DelightToast msg={msg} onClose={clear} />
      {role === 'cfo' && (
        <>
          <Glance
            items={[
              { k: 'August lag', v: '$1.1M', tone: 'var(--coral)' },
              { k: 'Gross funnel', v: usdK(billedOpen) },
              { k: 'Aid posted', v: usdK(awarded) },
              { k: 'Collected', v: usd(collected) },
              { k: 'Intl at risk', v: usdK(intlAtRisk.reduce((n, s) => n + s.tuition, 0)) },
            ]}
          />
          <Glance items={aging.map((a) => ({ k: `Aging ${a.k}`, v: String(a.v) }))} />
          <div className="horizon">
            <div className="giant">
              <div className="kicker">August lag</div>
              <div className="num">
                $1.1M
              </div>
            </div>
            <div className="panel" style={{ display: 'grid', alignContent: 'center' }}>
              <div className="kicker">Gross in funnel</div>
              <b style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{usdK(billedOpen)}</b>
              <p className="meta">Aid posted {usdK(awarded)} · collected {usd(collected)}</p>
            </div>
            <div className="panel" style={{ display: 'grid', alignContent: 'center' }}>
              <div className="kicker">Intl at risk</div>
              <b style={{ fontFamily: 'var(--serif)', fontSize: 24 }}>{usdK(intlAtRisk.reduce((n, s) => n + s.tuition, 0))}</b>
            </div>
          </div>
          <div className="panel">
            <h3>Billed vs collected · $M</h3>
            <Stream series={MONTHLY_CASH} />
          </div>
        </>
      )}

      {role === 'controller' && (
        <div>
          <Glance
            items={[
              { k: 'Open accounts', v: String(rows.length) },
              { k: 'No deposit', v: String(state.students.filter((s) => !s.depositPaid && !['enquiry', 'alumni'].includes(s.stage)).length) },
              { k: 'Collected', v: usd(collected) },
              { k: 'Selected', v: focus?.preferred ?? '—' },
            ]}
          />
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search receivables" />
            <Filters
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: 'Open funnel' },
                { id: 'unpaid', label: 'No deposit' },
                { id: 'paid', label: 'Has payment' },
                { id: 'intl', label: 'International' },
              ]}
            />
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Stage</th>
                <th>Tuition</th>
                <th>Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className={s.id === state.focusId ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                  <td>{s.name}</td>
                  <td>{s.stage}</td>
                  <td>{usd(s.tuition)}</td>
                  <td>{usd(s.paid)}</td>
                  <td>{usd(Math.max(0, s.tuition - s.paid - s.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {focus && (
            <div className="panel" style={{ marginTop: 14 }}>
              <h3>Post payment · {focus.name}</h3>
              <div className="field">
                <input type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} />
                <button type="button" className="btn" onClick={() => dispatch({ type: 'record-payment', id: focus.id, amount: amt })}>
                  Post to Workday
                </button>
                <button type="button" className="btn alt" disabled={focus.depositPaid} onClick={() => dispatch({ type: 'pay-deposit', id: focus.id })}>
                  Take deposit {usd(focus.deposit)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {role === 'aid' && (
        <div>
          <Glance
            items={[
              { k: 'Funds', v: String(state.funds.length) },
              { k: 'Remaining', v: usdK(state.funds.reduce((n, f) => n + f.remaining, 0)) },
              { k: 'Committed', v: usdK(state.funds.reduce((n, f) => n + f.committed, 0)) },
              { k: 'To package', v: String(state.students.flatMap((s) => s.awards).filter((a) => a.status !== 'approved' && a.status !== 'declined').length) },
            ]}
          />
          <div className="split">
            <div className="panel">
              <h3>Fund remaining</h3>
              {state.funds.map((f) => (
                <div key={f.id} style={{ margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{f.name}</span>
                    <span className="mono">{usdK(f.remaining)}</span>
                  </div>
                  <div className="inkfill">
                    <i style={{ width: `${(f.remaining / f.budget) * 100}%`, background: 'var(--copper)' }} />
                  </div>
                  <p className="meta">{f.rule}</p>
                </div>
              ))}
            </div>
            <div className="panel">
              <h3>Packaging queue</h3>
              {state.students
                .flatMap((s) => s.awards.map((a) => ({ s, a })))
                .filter((x) => x.a.status !== 'approved' && x.a.status !== 'declined')
                .map(({ s, a }) => (
                  <div key={a.id} className="rule" style={{ marginBottom: 10 }}>
                    <b>
                      {s.name} · {usd(a.recommended)}
                    </b>
                    <div className="meta">
                      {state.funds.find((f) => f.id === a.fundId)?.name} · {a.status}
                      {a.exceptions[0] ? ` · ${a.exceptions[0]}` : ''}
                    </div>
                    <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'approve-award', awardId: a.id })}>
                      Package
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      {role === 'bursar' && (
        <div>
          <Glance
            items={[
              { k: 'Open balances', v: usd(rows.reduce((n, s) => n + Math.max(0, s.tuition - s.paid - s.awards.filter((a) => a.status === 'approved').reduce((m, a) => m + a.approved, 0)), 0)) },
              { k: 'Collected', v: usd(collected) },
              { k: 'No deposit', v: String(rows.filter((s) => !s.depositPaid).length) },
              { k: 'Selected', v: focus?.preferred ?? '—' },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Tuition</th>
                <th>Aid</th>
                <th>Paid</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className={s.id === state.focusId ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                  <td>{s.name}</td>
                  <td>{usd(s.tuition)}</td>
                  <td>{usd(s.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0))}</td>
                  <td>{usd(s.paid)}</td>
                  <td>{usd(Math.max(0, s.tuition - s.paid - s.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {role === 'cashier' && till && (
        <div>
          <Glance
            items={[
              { k: 'Window', v: till.preferred },
              { k: 'Balance', v: usd(Math.max(0, till.tuition - till.paid - till.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0))) },
              { k: 'Deposit', v: till.depositPaid ? 'Paid' : usd(till.deposit) },
            ]}
          />
          <div className="people-switch" style={{ marginBottom: 12 }}>
            {rows.map((s) => (
              <button key={s.id} type="button" className={s.id === till.id ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                {s.preferred}
              </button>
            ))}
          </div>
          <div className="split">
          <div className="panel">
            <h3>Take payment · {till.name}</h3>
            <p className="meta">
              {till.email} · {till.canonicalId}
              {till.paymentPlan ? ` · plan ${usd(till.paymentPlan)}/mo` : ''}
            </p>
            <div className="field">
              <input type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} />
              <button
                type="button"
                className="btn"
                onClick={() => {
                  dispatch({ type: 'record-payment', id: till.id, amount: amt })
                  cheer('Posted', `Receipt for ${usd(amt)} is on ${till.preferred}’s phone.`)
                }}
              >
                Post
              </button>
              <button
                type="button"
                className="btn alt"
                disabled={till.depositPaid}
                onClick={() => {
                  dispatch({ type: 'pay-deposit', id: till.id })
                  cheer('You’re enrolled', 'Deposit posted. Welcome stamps opened automatically.')
                }}
              >
                Deposit {usd(till.deposit)}
              </button>
              <button
                type="button"
                className="btn alt"
                onClick={() => {
                  dispatch({ type: 'set-payment-plan', id: till.id, monthly: Math.max(250, Math.round(netBalance(till) / 4)) })
                  cheer('Plan on file', `${till.preferred} can pay in four months instead of one bill.`)
                }}
              >
                4-month plan
              </button>
            </div>
          </div>
          <div className="panel">
            <h3>This account</h3>
            <div className="rule" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Tuition</span>
              <b>{usd(till.tuition)}</b>
            </div>
            <div className="rule" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Aid posted</span>
              <b>{usd(till.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0))}</b>
            </div>
            <div className="rule" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Collected</span>
              <b>{usd(till.paid)}</b>
            </div>
            <div className="rule" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Balance</span>
              <b>{usd(Math.max(0, till.tuition - till.paid - till.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0)))}</b>
            </div>
            <h3 style={{ marginTop: 16 }}>Ledger</h3>
            {till.timeline
              .filter((t) => /pay|deposit|plan|award/i.test(t.title))
              .slice(0, 6)
              .map((t, i) => (
                <div key={i} className="rule" style={{ marginBottom: 8 }}>
                  <b>{t.title}</b>
                  <div className="meta">{t.detail}</div>
                </div>
              ))}
            {till.timeline.filter((t) => /pay|deposit|plan|award/i.test(t.title)).length === 0 && (
              <p className="meta">No cash events yet — post a payment to write the first receipt.</p>
            )}
          </div>
          </div>
        </div>
      )}
    </AppFrame>
  )
}
