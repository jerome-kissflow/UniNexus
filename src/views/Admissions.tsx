import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PEOPLE, PROGRAMS } from '../data/seed'
import { applicationFor } from '../data/admit'
import { daysBetween, when, whenFull } from '../lib/format'
import { useCampus } from '../state/store'
import { RadarField } from '../viz'
import { AppFrame, Filters, Glance, Search } from '../ui'
import { ROLES } from '../roles'
import type { Student } from '../data/types'
import { DelightToast, useDelight } from '../chrome'
import { yieldChance } from '../insights'

export function Admissions() {
  const { state, student, dispatch } = useCampus()
  const [role, setRole] = useState('officer')
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState<'bench' | 'radar'>('bench')
  const [note, setNote] = useState('')
  const [docKind, setDocKind] = useState('Additional transcript')
  const [info, setInfo] = useState('Please send a short research statement for the faculty file.')

  const pipeline = state.students.filter((s) => s.stage !== 'alumni')
  const list = useMemo(() => {
    return pipeline.filter((s) => {
      const text = `${s.name} ${s.canonicalId} ${s.city} ${s.stage}`.toLowerCase()
      if (q && !text.includes(q.toLowerCase())) return false
      if (filter === 'blocked') return s.risk === 'blocked'
      if (filter === 'sla') return s.steps.some((st) => st.status === 'overdue')
      if (filter === 'intl') return s.residency === 'international'
      if (filter === 'mine') return s.owner.includes('Elena')
      return true
    })
  }, [pipeline, q, filter])

  const program = PROGRAMS.find((p) => p.id === student.programId)
  const deanQueue = state.students.filter((s) => s.steps.some((st) => st.label.toLowerCase().includes('department') && st.status !== 'complete'))
  const wesPending = student.documents.some((d) => d.status !== 'verified')
  const deanOpen = student.steps.some((s) => s.label.includes('Departmental') && s.status !== 'complete')
  const slaLate = pipeline.filter((s) => s.steps.some((st) => st.status === 'overdue')).length
  const blockedN = pipeline.filter((s) => s.risk === 'blocked').length
  const intlN = pipeline.filter((s) => s.residency === 'international').length
  const { msg, cheer, clear } = useDelight()

  return (
    <AppFrame kicker="Admissions Radar" title="Workbench" roles={ROLES.admissions} role={role} onRole={setRole}>
      <DelightToast msg={msg} onClose={clear} />
      {role === 'officer' && (
        <>
          <Glance
            items={[
              { k: 'Pipeline', v: String(pipeline.length) },
              { k: 'Blocked', v: String(blockedN), tone: blockedN ? 'var(--coral)' : undefined },
              { k: 'SLA late', v: String(slaLate), tone: slaLate ? 'var(--copper)' : undefined },
              { k: 'International', v: String(intlN) },
              { k: 'Dean queue', v: String(deanQueue.length) },
              { k: 'Open file', v: student.preferred },
            ]}
          />
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search name, id, city" />
            <Filters
              value={filter}
              onChange={setFilter}
              options={[
                { id: 'all', label: 'All' },
                { id: 'blocked', label: 'Blocked' },
                { id: 'sla', label: 'SLA late' },
                { id: 'intl', label: 'International' },
                { id: 'mine', label: 'Elena’s queue' },
              ]}
            />
            <Filters
              value={view}
              onChange={(v) => setView(v as 'bench' | 'radar')}
              options={[
                { id: 'bench', label: 'List' },
                { id: 'radar', label: 'Radar' },
              ]}
            />
          </div>

          {view === 'radar' ? (
            <div className="panel radar-wrap">
              <RadarField
                points={list.map((s, i) => ({
                  id: s.id,
                  r: Math.min(14, Math.max(1, daysBetween(s.applied))) / 14,
                  a: (i * 38) % 360,
                  tone: s.risk === 'blocked' ? '#d36b5e' : s.risk === 'watch' ? '#c9a36a' : '#7dba8a',
                  label: s.name,
                  sub: s.stage,
                }))}
                onPick={(id) => dispatch({ type: 'focus', id })}
                activeId={student.id}
              />
            </div>
          ) : (
            <div className="workbench">
              <div className="roster">
                {list.map((s) => (
                  <button key={s.id} type="button" className={s.id === student.id ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                    <b>{s.name}</b>
                    <span className="meta">
                      {s.stage} · {s.risk} · {PROGRAMS.find((p) => p.id === s.programId)?.degree}
                    </span>
                  </button>
                ))}
                {list.length === 0 && <p className="meta" style={{ padding: 14 }}>No files match.</p>}
              </div>
              <CaseDetail
                student={student}
                programName={program?.name ?? ''}
                note={note}
                setNote={setNote}
                docKind={docKind}
                setDocKind={setDocKind}
                wesPending={wesPending}
                deanOpen={deanOpen}
                onCheer={cheer}
              />
            </div>
          )}
        </>
      )}

      {role === 'dean' && (
        <div>
          <Glance
            items={[
              { k: 'Waiting signature', v: String(deanQueue.length) },
              { k: 'Mean GPA', v: deanQueue.length ? (deanQueue.reduce((n, s) => n + s.gpa, 0) / deanQueue.length).toFixed(2) : '—' },
              { k: 'International', v: String(deanQueue.filter((s) => s.residency === 'international').length) },
            ]}
          />
          <p className="meta" style={{ marginBottom: 12 }}>{deanQueue.length} files waiting on Engineering.</p>
          {deanQueue.map((s) => (
            <div key={s.id} className="sig-card">
              <div className="chips">
                <span className={`chip ${s.risk}`}>{s.risk}</span>
                <span className="chip">{PROGRAMS.find((p) => p.id === s.programId)?.name}</span>
                <span className="chip">GPA {s.gpa}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, margin: '6px 0' }}>{s.name}</h2>
              <p className="meta">{s.test} · {s.city}, {s.country}</p>
              <textarea className="composer" value={info} onChange={(e) => setInfo(e.target.value)} />
              <div className="row-btns">
                <button type="button" className="btn" onClick={() => dispatch({ type: 'dean-approve', id: s.id })}>
                  Sign admission
                </button>
                <button type="button" className="btn alt" onClick={() => dispatch({ type: 'dean-request', id: s.id, text: info })}>
                  Request info
                </button>
                <button type="button" className="btn alt" onClick={() => dispatch({ type: 'waitlist', id: s.id })}>
                  Waitlist
                </button>
                <button type="button" className="btn alt" onClick={() => dispatch({ type: 'focus', id: s.id })}>
                  Open file
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {role === 'provost' && <ProvostHeat />}
      {role === 'iso' && <AdmitIso />}
      {role === 'faculty' && <FacultyReview />}
    </AppFrame>
  )
}

function CaseDetail({
  student,
  programName,
  note,
  setNote,
  docKind,
  setDocKind,
  wesPending,
  deanOpen,
  onCheer,
}: {
  student: Student
  programName: string
  note: string
  setNote: (v: string) => void
  docKind: string
  setDocKind: (v: string) => void
  wesPending: boolean
  deanOpen: boolean
  onCheer: (t: string, x: string) => void
}) {
  const { dispatch } = useCampus()
  const app = applicationFor(student)
  return (
    <div className="panel case-card">
      <div className="chips">
        <span className={`chip ${student.risk}`}>{student.risk}</span>
        <span className="chip">{student.stage}</span>
        <span className="chip">{student.residency}</span>
        <span className="chip">{student.canonicalId}</span>
      </div>
      <h2>{student.name}</h2>
      <div className="meta">
        {programName} · {student.city}, {student.country} · GPA {student.gpa}
        <br />
        Owner {student.owner} · {student.nextAction} · predicted yield {Math.round(yieldChance(student) * 100)}%
      </div>
      <ul className="why">
        {(student.riskWhy.length ? student.riskWhy : ['No conversion risk flags.']).map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <h3 style={{ marginTop: 16 }}>Application as submitted</h3>
      <p className="meta">
        {app.submitted ? `Locked ${app.submitted} from Pulse / Salesforce.` : 'Draft — student has not submitted yet.'}
      </p>
      <div className="panel" style={{ marginTop: 8 }}>
        <p>
          <b>{app.legalName}</b> · {app.program} · {app.term}
        </p>
        <p className="meta">
          {app.priorSchool} · GPA {app.gpa} · {app.tests}
          <br />
          {app.address} · {app.residency}
          {app.firstGen ? ' · first-gen' : ''} · {app.incomeBand}
          <br />
          Family: {app.family.name} ({app.family.relation})
        </p>
        <p style={{ marginTop: 8 }}>{app.essay}</p>
      </div>
      <h3 style={{ marginTop: 16 }}>Evidence</h3>
      <div className="ev-grid">
        {student.documents.map((d) => (
          <div key={d.id} className={`ev ${d.status}`}>
            <b>{d.kind}</b>
            <span>{d.status}</span>
            {d.status !== 'verified' && (
              <button type="button" className="btn" onClick={() => dispatch({ type: 'upload-doc', id: student.id, docId: d.id })}>
                Verify
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="field">
        <input value={docKind} onChange={(e) => setDocKind(e.target.value)} />
        <button type="button" className="btn alt" onClick={() => dispatch({ type: 'request-doc', id: student.id, kind: docKind })}>
          Request
        </button>
      </div>
      <div className="field">
        <select value={student.owner} onChange={(e) => dispatch({ type: 'assign', id: student.id, owner: e.target.value })}>
          {PEOPLE.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="row-btns">
        <button type="button" className="btn" disabled={!wesPending} onClick={() => student.documents[0] && dispatch({ type: 'upload-doc', id: student.id, docId: student.documents.find((d) => d.status !== 'verified')?.id ?? student.documents[0].id })}>
          Verify next doc
        </button>
        <button type="button" className="btn alt" disabled={!deanOpen} onClick={() => dispatch({ type: 'escalate-dean', id: student.id })}>
          Escalate dean
        </button>
        <button type="button" className="btn alt" disabled={!deanOpen} onClick={() => dispatch({ type: 'dean-approve', id: student.id })}>
          Dean approve
        </button>
        <button
          type="button"
          className="btn alt"
          onClick={() => {
            dispatch({ type: 'release-offer', id: student.id })
            onCheer('Offer is live', `${student.preferred} can see it on Pulse and pay the deposit from her phone.`)
          }}
        >
          Release offer
        </button>
        <button type="button" className="btn alt" onClick={() => dispatch({ type: 'waitlist', id: student.id })}>
          Waitlist
        </button>
        <Link to="/student" className="btn alt">
          Student phone
        </Link>
      </div>
      <textarea className="composer" placeholder="Case note" value={note} onChange={(e) => setNote(e.target.value)} />
      <button
        type="button"
        className="btn alt"
        onClick={() => {
          if (!note.trim()) return
          dispatch({ type: 'add-note', id: student.id, actor: student.owner, text: note.trim() })
          setNote('')
        }}
      >
        Add note
      </button>
      <h3 style={{ marginTop: 16 }}>Timeline</h3>
      <ol className="audit">
        {student.timeline.slice(0, 8).map((t, i) => (
          <li key={i}>
            <time>{whenFull(t.at)}</time>
            <div>
              <b>{t.title}</b>
              <div className="meta">{t.detail}</div>
            </div>
          </li>
        ))}
      </ol>
      {student.steps.filter((s) => s.status === 'overdue').map((s) => (
        <p key={s.id} className="meta" style={{ color: 'var(--coral)' }}>
          SLA · {s.label} · {s.owner} · due {when(s.due)}
        </p>
      ))}
    </div>
  )
}

function ProvostHeat() {
  const { state, dispatch } = useCampus()
  const [college, setCollege] = useState('all')
  const programs = PROGRAMS.filter((p) => college === 'all' || p.college === college)
  const seats = programs.reduce((n, p) => n + p.seats, 0)
  const inMosaic = state.students.filter((s) => programs.some((p) => p.id === s.programId) && s.stage !== 'alumni').length
  return (
    <div>
      <Glance
        items={[
          { k: 'Programs', v: String(programs.length) },
          { k: 'Seats', v: String(seats) },
          { k: 'In mosaic', v: String(inMosaic) },
          { k: 'Fill', v: seats ? `${Math.round((inMosaic / seats) * 100)}%` : '—' },
        ]}
      />
      <Filters
        value={college}
        onChange={setCollege}
        options={[{ id: 'all', label: 'All colleges' }, ...[...new Set(PROGRAMS.map((p) => p.college))].map((c) => ({ id: c, label: c }))]}
      />
      <div className="heat" style={{ marginTop: 12 }}>
        {programs.map((p) => {
          const people = state.students.filter((s) => s.programId === p.id)
          const fill = Math.min(1, (people.length + p.yieldTarget * 0.35) / p.seats)
          return (
            <button
              key={p.id}
              type="button"
              className="heat-cell"
              style={{ background: `rgba(142,185,200,${0.08 + fill * 0.28})`, textAlign: 'left', color: 'inherit' }}
              onClick={() => people[0] && dispatch({ type: 'focus', id: people[0].id })}
            >
              <span className="kicker">{p.college}</span>
              <b style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{p.name}</b>
              <span className="meta">
                {people.length} in mosaic · target {p.yieldTarget}/{p.seats}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function AdmitIso() {
  const { state, dispatch } = useCampus()
  const rows = state.students.filter((s) => s.residency === 'international' && s.stage !== 'alumni')
  const openDocs = rows.filter((s) => s.documents.some((d) => d.status !== 'verified'))
  const i20Ready = rows.filter((s) => s.depositPaid)
  const visaHold = rows.filter((s) => ['offer', 'deposit', 'verifying', 'departmental'].includes(s.stage) && !s.depositPaid)
  return (
    <div>
      <Glance
        items={[
          { k: 'Intl files', v: String(rows.length) },
          { k: 'Docs open', v: String(openDocs.length), tone: openDocs.length ? 'var(--copper)' : undefined },
          { k: 'Visa hold', v: String(visaHold.length), tone: visaHold.length ? 'var(--coral)' : undefined },
          { k: 'I-20 ready', v: String(i20Ready.length) },
          { k: 'Workshop Thu', v: '10:30 Fenwick' },
        ]}
      />
      <div className="split">
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Origin</th>
                <th>Stage</th>
                <th>Docs</th>
                <th>Visa window</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const window = s.countryCode === 'IN' ? '12 Sep' : s.countryCode === 'NG' ? 'cleared' : s.countryCode === 'JP' ? '28 Aug' : 'open'
                return (
                  <tr key={s.id} className={s.id === state.focusId ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                    <td>{s.name}</td>
                    <td>
                      {s.city}, {s.country}
                    </td>
                    <td>{s.stage}</td>
                    <td>
                      {s.documents.filter((d) => d.status === 'verified').length}/{Math.max(1, s.documents.length)}
                    </td>
                    <td>{window}</td>
                    <td>
                      <button
                        type="button"
                        className="btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          dispatch({
                            type: 'send-nudge',
                            id: s.id,
                            from: 'Intl. Student Office',
                            text: 'Visa workshop Thursday 10:30, Fenwick 3rd. Bring passport and offer letter. I-20 prints when the deposit posts.',
                          })
                        }}
                      >
                        Nudge
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="side-list">
          <div className="panel">
            <h3>Thursday workshop</h3>
            <p className="meta">Fenwick 3rd · 10:30 · SEVIS / embassy prep</p>
            <ul className="why">
              <li>Bring passport + offer letter</li>
              <li>I-20 draft prints the day the deposit posts</li>
              <li>Affidavit can be pending — still come</li>
            </ul>
            <button
              type="button"
              className="btn"
              onClick={() =>
                dispatch({
                  type: 'bulk-nudge',
                  ids: visaHold.map((s) => s.id),
                  from: 'Intl. Student Office',
                  text: 'Reminder: visa workshop Thursday 10:30 Fenwick. Seats are open.',
                })
              }
            >
              Invite visa-hold files
            </button>
          </div>
          <div className="panel">
            <h3>I-20 print queue</h3>
            {i20Ready.length === 0 && <p className="meta">No deposits posted yet.</p>}
            {i20Ready.map((s) => (
              <div key={s.id} className="rule" style={{ marginBottom: 8 }}>
                <b>{s.name}</b>
                <div className="meta">{s.canonicalId} · {PROGRAMS.find((p) => p.id === s.programId)?.name}</div>
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>Document holds</h3>
            {openDocs.map((s) => (
              <div key={s.id} className="rule" style={{ marginBottom: 8 }}>
                <b>{s.preferred}</b>
                <div className="meta">{s.documents.filter((d) => d.status !== 'verified').map((d) => d.kind).join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FacultyReview() {
  const { state, dispatch } = useCampus()
  const queue = state.students.filter((s) => s.steps.some((st) => st.label.toLowerCase().includes('department') && st.status !== 'complete'))
  const focus = queue.find((s) => s.id === state.focusId) ?? queue[0]
  const [note, setNote] = useState('Ready for the cohort — recommend admit.')
  return (
    <div>
      <Glance
        items={[
          { k: 'Faculty queue', v: String(queue.length) },
          { k: 'Mean GPA', v: queue.length ? (queue.reduce((n, s) => n + s.gpa, 0) / queue.length).toFixed(2) : '—' },
          { k: 'Watch/block', v: String(queue.filter((s) => s.risk !== 'clear').length) },
          { k: 'Open file', v: focus?.preferred ?? '—' },
        ]}
      />
      <div className="split">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Program</th>
              <th>GPA</th>
              <th>Test</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((s) => (
              <tr key={s.id} className={s.id === focus?.id ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                <td>{s.name}</td>
                <td>{PROGRAMS.find((p) => p.id === s.programId)?.name}</td>
                <td>{s.gpa}</td>
                <td>{s.test}</td>
                <td>{s.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {focus && (
          <div className="panel">
            <div className="chips">
              <span className={`chip ${focus.risk}`}>{focus.risk}</span>
              <span className="chip">{focus.residency}</span>
              <span className="chip">{focus.city}</span>
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '8px 0 4px' }}>{focus.name}</h2>
            <p className="meta">
              {PROGRAMS.find((p) => p.id === focus.programId)?.name} · GPA {focus.gpa} · {focus.test}
            </p>
            <h3 style={{ marginTop: 14 }}>Faculty read</h3>
            <ul className="why">
              {(focus.riskWhy.length ? focus.riskWhy : ['No conversion flags — academic file is clean.']).map((w) => (
                <li key={w}>{w}</li>
              ))}
              {focus.timeline.slice(0, 3).map((t) => (
                <li key={t.at}>
                  {t.title} — {t.detail}
                </li>
              ))}
            </ul>
            <p className="meta">Evidence {focus.documents.filter((d) => d.status === 'verified').length}/{Math.max(1, focus.documents.length)} verified</p>
            <textarea className="composer" value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="row-btns">
              <button type="button" className="btn" onClick={() => dispatch({ type: 'dean-approve', id: focus.id })}>
                Recommend admit
              </button>
              <button type="button" className="btn alt" onClick={() => dispatch({ type: 'dean-request', id: focus.id, text: note })}>
                Request info
              </button>
              <button type="button" className="btn alt" onClick={() => dispatch({ type: 'waitlist', id: focus.id })}>
                Hold / waitlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

