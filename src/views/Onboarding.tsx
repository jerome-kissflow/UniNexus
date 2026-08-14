import { useMemo, useState } from 'react'
import { PROGRAMS } from '../data/seed'
import { useCampus } from '../state/store'
import { AppFrame, Filters, Glance, Search } from '../ui'
import { ROLES } from '../roles'
import type { Student } from '../data/types'

const ROOMS = ['EH-12', 'EH-14', 'EH-16', 'WH-02', 'WH-08', 'GV-01', 'GV-04', 'GV-09', 'NH-11', 'NH-18', 'SH-03', 'SH-07']

function readyPct(s: Student) {
  const total = Math.max(1, s.onboard.length)
  return Math.round((s.onboard.filter((t) => t.status === 'done').length / total) * 100)
}

function nextStamp(s: Student) {
  return s.onboard.find((t) => t.status !== 'done')
}

function StampSheet({ student }: { student: Student }) {
  const { dispatch } = useCampus()
  return (
    <div className="passport">
      <div className="kicker" style={{ color: '#8a7d68' }}>
        {student.term} · {student.onboard.filter((t) => t.status === 'done').length}/{Math.max(1, student.onboard.length)} stamped
      </div>
      <h2>{student.name}</h2>
      <p style={{ color: '#6d6658' }}>{PROGRAMS.find((p) => p.id === student.programId)?.name}</p>
      {student.housing && <p style={{ marginTop: 8 }}>Housing: {student.housing}</p>}
      {student.moveIn && <p>Move-in: {student.moveIn}</p>}
      {student.roommate && <p>Roommate: {student.roommate}</p>}
      <div className="row-btns">
        <button type="button" className="btn alt" onClick={() => dispatch({ type: 'set-movein', id: student.id, slot: 'Sat 22 Aug · 9:00–11:00' })}>
          Reserve Sat 9:00
        </button>
        <button type="button" className="btn alt" onClick={() => dispatch({ type: 'set-roommate', id: student.id, name: 'Jordan Hale' })}>
          Prefer Jordan
        </button>
      </div>
      <div className="stamps">
        {student.onboard.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`stamp ${t.status}`}
            onClick={() => t.status !== 'done' && dispatch({ type: 'complete-onboard', id: student.id, taskId: t.id })}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Onboarding() {
  const { state, dispatch } = useCampus()
  const [role, setRole] = useState('coach')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [seals, setSeals] = useState(false)
  const arrivals = state.students.filter((s) => s.onboard.length > 0 || s.stage === 'onboarding' || s.stage === 'enrolled' || s.depositPaid)
  const chloe = state.students.find((s) => s.id === 'st-chloe') ?? arrivals[0]
  const list = useMemo(() => {
    return arrivals.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false
      if (filter === 'blocked') return s.onboard.some((t) => t.status === 'blocked')
      if (filter === 'housing') return s.onboard.some((t) => t.system === 'starrez' && t.status !== 'done')
      if (filter === 'health') return s.onboard.some((t) => t.label.toLowerCase().includes('immun'))
      return true
    })
  }, [arrivals, q, filter])
  const focused = arrivals.find((s) => s.id === state.focusId) ?? arrivals[0]
  const blockedN = arrivals.filter((s) => s.onboard.some((t) => t.status === 'blocked')).length
  const unassigned = arrivals.filter((s) => !s.housing).length
  const readyN = arrivals.filter((s) => s.onboard.length > 0 && s.onboard.every((t) => t.status === 'done')).length
  const healthHold = arrivals.filter((s) => s.onboard.some((t) => t.label.toLowerCase().includes('immun') && t.status !== 'done')).length
  const oriOpen = arrivals.filter((s) => s.onboard.some((t) => t.label.toLowerCase().includes('orient') && t.status !== 'done')).length

  return (
    <AppFrame kicker="Welcome Passport" title="Arrival" roles={ROLES.onboarding} role={role} onRole={setRole}>
      {role === 'coach' && (
        <div>
          <Glance
            items={[
              { k: 'Arrivals', v: String(arrivals.length) },
              { k: 'Blocked stamps', v: String(blockedN), tone: blockedN ? 'var(--coral)' : undefined },
              { k: 'No housing', v: String(unassigned) },
              { k: 'Passport ready', v: String(readyN), tone: 'var(--teal)' },
            ]}
          />
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search arrivals" />
            <Filters
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: 'All' },
                { id: 'blocked', label: 'Blocked stamps' },
                { id: 'housing', label: 'Housing hold' },
              ]}
            />
          </div>
          <div className="workbench">
            <div className="roster">
              {list.map((s) => {
                const next = nextStamp(s)
                return (
                  <button key={s.id} type="button" className={s.id === focused?.id ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                    <b>{s.name}</b>
                    <span className="meta">
                      {readyPct(s)}% · {next?.label ?? 'Ready'} · {s.housing ?? 'No room'}
                    </span>
                  </button>
                )
              })}
            </div>
            {focused && <StampSheet student={focused} />}
          </div>
        </div>
      )}

      {role === 'housing' && (
        <div>
          <Glance
            items={[
              { k: 'Unassigned', v: String(unassigned), tone: unassigned ? 'var(--copper)' : undefined },
              { k: 'Placed', v: String(arrivals.length - unassigned) },
              { k: 'Open rooms', v: String(ROOMS.length) },
              { k: 'Selected', v: focused?.preferred ?? '—' },
            ]}
          />
          <div className="workbench">
            <div className="roster">
              {arrivals.map((s) => (
                <button key={s.id} type="button" className={s.id === state.focusId ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                  <b>{s.name}</b>
                  <span className="meta">{s.housing ?? 'Unassigned'}</span>
                </button>
              ))}
            </div>
            <div>
              <p className="meta" style={{ marginBottom: 10 }}>
                Assign a room — writes back to StarRez and stamps the passport.
              </p>
              <div className="rooms">
                {ROOMS.map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    className="room open"
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => dispatch({ type: 'assign-housing', id: state.focusId, room: id })}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {role === 'student' && chloe && (
        <div>
          <Glance
            items={[
              { k: 'Ready', v: `${readyPct(chloe)}%` },
              { k: 'Open stamps', v: String(chloe.onboard.filter((t) => t.status !== 'done').length) },
              { k: 'Housing', v: chloe.housing ?? 'Waitlist' },
              { k: 'Next', v: nextStamp(chloe)?.label ?? 'All stamped' },
            ]}
          />
          <div className="board-pass">
            <div>
              <div className="kicker" style={{ color: '#8a7d68' }}>
                Boarding pass · {chloe.term}
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, margin: '4px 0' }}>{chloe.name}</h2>
              <p>{PROGRAMS.find((p) => p.id === chloe.programId)?.name}</p>
              <p className="meta">{chloe.housing ?? 'Housing not yet assigned'}</p>
              <p className="meta">{nextStamp(chloe)?.detail ?? 'All arrival stamps are complete.'}</p>
              <button type="button" className="btn" style={{ marginTop: 12 }} onClick={() => setSeals((v) => !v)}>
                {seals ? 'Hide seals' : 'View seals'}
              </button>
            </div>
            <div>
              {chloe.onboard.map((t) => (
                <div key={t.id} className="ph-task" style={{ background: 'transparent' }}>
                  <div>
                    <b>{t.label}</b>
                    <div style={{ fontSize: 12, color: '#6d6658' }}>{t.detail}</div>
                  </div>
                  {t.status !== 'done' ? (
                    <button type="button" className="btn" onClick={() => dispatch({ type: 'complete-onboard', id: chloe.id, taskId: t.id })}>
                      Stamp
                    </button>
                  ) : (
                    <span>Done</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {seals && <div style={{ marginTop: 14 }}><StampSheet student={chloe} /></div>}
        </div>
      )}

      {role === 'health' && (
        <div>
          <Glance
            items={[
              { k: 'Immunization hold', v: String(healthHold), tone: healthHold ? 'var(--coral)' : undefined },
              { k: 'Cleared', v: String(arrivals.length - healthHold) },
              { k: 'Move-in risk', v: String(healthHold) },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Record</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {arrivals.map((s) => {
                const imm = s.onboard.find((t) => t.label.toLowerCase().includes('immun'))
                return (
                  <tr key={s.id} className={s.id === state.focusId ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                    <td>{s.name}</td>
                    <td>{imm?.detail ?? 'Not on file'}</td>
                    <td>{imm?.status ?? '—'}</td>
                    <td>
                      {imm && imm.status !== 'done' && (
                        <button type="button" className="btn" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'complete-onboard', id: s.id, taskId: imm.id }) }}>
                          Clear
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {role === 'orientation' && (
        <div>
          <Glance
            items={[
              { k: 'RSVP open', v: String(oriOpen) },
              { k: 'Canvas open', v: String(arrivals.filter((s) => s.onboard.some((t) => t.system === 'canvas' && t.status !== 'done')).length) },
              { k: 'Arrive 24 Aug', v: String(arrivals.length) },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Orientation</th>
                <th>LMS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {arrivals.map((s) => {
                const ori = s.onboard.find((t) => t.label.toLowerCase().includes('orient'))
                const lms = s.onboard.find((t) => t.system === 'canvas')
                const next = ori?.status !== 'done' ? ori : lms?.status !== 'done' ? lms : null
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{ori?.status ?? '—'}</td>
                    <td>{lms?.status ?? '—'}</td>
                    <td>
                      {next && (
                        <button type="button" className="btn" onClick={() => dispatch({ type: 'complete-onboard', id: s.id, taskId: next.id })}>
                          Stamp {next.label}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppFrame>
  )
}
