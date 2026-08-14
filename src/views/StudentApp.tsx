import { useEffect, useState } from 'react'
import {
  GraduationCap,
  ListChecks,
  Landmark,
  Inbox,
  UserRound,
  Upload,
  Users,
  Heart,
  MessageCircle,
  Plus,
  FileText,
  ChevronLeft,
} from 'lucide-react'
import { FUNDS, PROGRAMS } from '../data/seed'
import { admitPercent, admitWorkflow, applicationFor, familyStatus } from '../data/admit'
import { feedFor, groupsFor } from '../data/campus'
import { usd, when, whenFull } from '../lib/format'
import { useCampus } from '../state/store'
import { JourneyPath, LIFE } from '../viz'
import { Gauge, Spark } from '../dash'
import type { CampusPost, Student } from '../data/types'
import { netBalance, yieldChance } from '../insights'

type Tab = 'home' | 'campus' | 'tasks' | 'aid' | 'inbox' | 'me'

export function StudentApp() {
  const { student, dispatch, state } = useCampus()
  const [tab, setTab] = useState<Tab>('home')
  const [sheet, setSheet] = useState<'none' | 'admit'>('none')
  const [family, setFamily] = useState(false)
  const program = PROGRAMS.find((p) => p.id === student.programId)
  const aid = student.awards.reduce((n, a) => n + (a.approved || a.recommended), 0)
  const aidApproved = student.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0)
  const unread = (student.messages ?? []).filter((m) => !m.read).length
  const mine = groupsFor(student.id, state.groups)
  const pct = admitPercent(student)

  return (
    <div>
      <div className="app-head">
        <div>
          <div className="kicker">UniNexus Suite · Student Pulse</div>
          <h1>Pulse</h1>
        </div>
      </div>
      <div className="phone-stage">
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-screen">
            <div className="ph-status">
              <span>9:41</span>
              <span>5G · {unread ? `${unread} new` : `${pct}%`}</span>
            </div>
            <div className="ph-body">
              {sheet === 'admit' ? (
                <AdmitRecord student={student} family={family} onBack={() => setSheet('none')} />
              ) : (
                <>
                  {tab === 'home' && (
                    <Home
                      student={student}
                      program={program?.name ?? ''}
                      aid={aid}
                      aidApproved={aidApproved}
                      groups={mine.length}
                      pct={pct}
                      onAdmit={() => {
                        setFamily(false)
                        setSheet('admit')
                      }}
                    />
                  )}
                  {tab === 'campus' && <Campus student={student} />}
                  {tab === 'tasks' && <Tasks student={student} />}
                  {tab === 'aid' && <Aid student={student} program={program?.name ?? ''} aid={aid} aidApproved={aidApproved} />}
                  {tab === 'inbox' && <Mail student={student} />}
                  {tab === 'me' && (
                    <Me
                      student={student}
                      people={state.students}
                      pct={pct}
                      onAdmit={(asFamily) => {
                        setFamily(asFamily)
                        setSheet('admit')
                      }}
                    />
                  )}
                </>
              )}
            </div>
            <nav className="ph-nav ph-nav-6">
              {(
                [
                  ['home', 'Home', GraduationCap],
                  ['campus', 'Campus', Users],
                  ['tasks', 'Tasks', ListChecks],
                  ['aid', 'Aid', Landmark],
                  ['inbox', 'Inbox', Inbox],
                  ['me', 'Me', UserRound],
                ] as const
              ).map(([id, label, Icon]) => (
                <button
                  key={id}
                  type="button"
                  className={tab === id ? 'on' : ''}
                  onClick={() => {
                    setSheet('none')
                    setTab(id)
                    if (id === 'inbox') dispatch({ type: 'read-inbox', id: student.id })
                  }}
                >
                  <Icon size={16} />
                  {label}
                  {id === 'inbox' && unread ? ` (${unread})` : ''}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

function Home({
  student,
  program,
  aid,
  aidApproved,
  groups,
  pct,
  onAdmit,
}: {
  student: Student
  program: string
  aid: number
  aidApproved: number
  groups: number
  pct: number
  onAdmit: () => void
}) {
  const { dispatch, state } = useCampus()
  const docsDone = student.documents.filter((d) => d.status === 'verified').length
  const docsTot = Math.max(1, student.documents.length)
  const latest = feedFor(student.id, state.groups, state.posts)[0]
  const groupName = latest ? state.groups.find((g) => g.id === latest.groupId)?.name : ''
  const classmates = state.students.filter((s) => s.programId === student.programId && s.id !== student.id && s.stage !== 'alumni')
  const arriving = ['deposit', 'enrolled', 'onboarding'].includes(student.stage)

  return (
    <>
      <div className="ph-brand">Northhaven · {student.term}</div>
      <h1 className="ph-hello">Hi {student.preferred}.</h1>
      <div className="ph-ring-row">
        <Gauge value={pct / 100} label="admit" color={pct >= 100 ? '#157a45' : '#1557e0'} ink="#0b1f4d" />
        <div>
          <span className="meta" style={{ color: '#4a5c7a' }}>
            Admission {pct}%
          </span>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18 }}>{program}</div>
          <Spark values={[2, 3, 2, 5, 4, 6, 8, Math.round(pct / 12)]} color="#1557e0" />
        </div>
      </div>
      <button type="button" className="ph-admit-open" onClick={onAdmit}>
        <FileText size={16} />
        <span>
          <b>{pct >= 100 ? 'Admission complete' : 'Your admit record'}</b>
          <small>{pct >= 100 ? 'Workflow is at 100% — open to read what you submitted.' : 'Application you entered, plus the live workflow.'}</small>
        </span>
      </button>
      <div className="ph-dash">
        <div className="ph-stat">
          <span>Evidence</span>
          <b>
            {docsDone}/{docsTot}
          </b>
        </div>
        <div className="ph-stat">
          <span>Aid</span>
          <b>{usd(aidApproved || aid)}</b>
        </div>
        <div className="ph-stat">
          <span>Due</span>
          <b>{when(student.due)}</b>
        </div>
        <div className="ph-stat">
          <span>Groups</span>
          <b>{groups}</b>
        </div>
      </div>
      <JourneyPath stages={LIFE} current={student.stage} />
      <div className="care">
        <strong>{student.nextAction}</strong>
        <p>{student.riskWhy[0] ?? student.timeline[0]?.detail ?? 'We will ping you the moment a decision lands.'}</p>
      </div>
      {latest && (
        <div className="next-card" style={{ marginTop: 10 }}>
          <em>{groupName}</em>
          <h3 style={{ fontSize: 16 }}>{latest.author}</h3>
          <p style={{ color: '#4a5c7a', fontSize: 13 }}>{latest.body}</p>
        </div>
      )}
      <div className="next-card" style={{ marginTop: 10 }}>
        <em>Counselor</em>
        <h3 style={{ fontSize: 16 }}>{student.appointment ? student.appointment.at : 'No slot yet'}</h3>
        <p style={{ color: '#4a5c7a', fontSize: 13 }}>
          {student.appointment ? student.appointment.location : 'Book 20 minutes — family can join.'}
        </p>
        {!student.appointment && (
          <button
            type="button"
            className="btn"
            style={{ marginTop: 8 }}
            onClick={() =>
              dispatch({
                type: 'book-appointment',
                id: student.id,
                kind: student.stage === 'enquiry' ? 'Campus visit' : 'Counselor call',
                at: student.stage === 'enquiry' ? 'Sat 22 Aug, 11:00' : 'Tue 18 Aug, 10:30',
                location: student.stage === 'enquiry' ? 'Fenwick 204 · History open house' : 'Zoom · Northhaven Admissions',
              })
            }
          >
            {student.stage === 'enquiry' ? 'RSVP Saturday 11:00' : 'Book Tuesday 10:30'}
          </button>
        )}
      </div>
      {arriving && (
        <div className="next-card" style={{ marginTop: 10 }}>
          <em>Arrival</em>
          <h3 style={{ fontSize: 16 }}>{student.housing ?? student.moveIn ?? 'Housing not assigned'}</h3>
          <p style={{ color: '#4a5c7a', fontSize: 13 }}>
            {student.roommate ? `Roommate · ${student.roommate}` : 'Request a roommate match before 20 Aug.'}
          </p>
          <div className="row-btns" style={{ marginTop: 8 }}>
            {!student.moveIn && (
              <button type="button" className="btn" onClick={() => dispatch({ type: 'set-movein', id: student.id, slot: 'Sun 24 Aug, 9:00–12:00' })}>
                Reserve move-in
              </button>
            )}
            {!student.roommate && classmates[0] && (
              <button type="button" className="btn alt" onClick={() => dispatch({ type: 'set-roommate', id: student.id, name: classmates[0].name })}>
                Match {classmates[0].preferred}
              </button>
            )}
          </div>
        </div>
      )}
      {['offer', 'deposit'].includes(student.stage) && !student.depositPaid && (
        <div className="next-card" style={{ marginTop: 10 }}>
          <em>Hold your seat</em>
          <h3 style={{ fontSize: 16 }}>{usd(student.deposit)} deposit</h3>
          <p style={{ color: '#4a5c7a', fontSize: 13 }}>Posted to Workday the moment you pay. Seat chance {Math.round(yieldChance(student) * 100)}%.</p>
          <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'pay-deposit', id: student.id })}>
            Pay deposit
          </button>
        </div>
      )}
      {classmates.length > 0 && (
        <div className="next-card" style={{ marginTop: 10 }}>
          <em>In {program}</em>
          <h3 style={{ fontSize: 16 }}>{classmates.map((s) => s.preferred).join(', ')}</h3>
          <p style={{ color: '#4a5c7a', fontSize: 13 }}>Same program in Pulse — open Campus to see their groups.</p>
        </div>
      )}
    </>
  )
}

function Campus({ student }: { student: Student }) {
  const { state, dispatch } = useCampus()
  const mine = groupsFor(student.id, state.groups)
  const discover = state.groups.filter((g) => !g.members.includes(student.id))
  const [gid, setGid] = useState('all')
  const [browse, setBrowse] = useState(false)
  const [draft, setDraft] = useState('')
  const [reply, setReply] = useState<Record<string, string>>({})
  useEffect(() => {
    setGid('all')
    setBrowse(false)
    setDraft('')
  }, [student.id])
  const selected = state.groups.find((g) => g.id === gid) ?? mine[0] ?? state.groups[0]
  const joined = selected.members.includes(student.id)
  const posts = browse
    ? []
    : gid === 'all'
      ? feedFor(student.id, state.groups, state.posts)
      : state.posts.filter((p) => p.groupId === selected.id).sort((a, b) => (a.at < b.at ? 1 : -1))
  const members = selected.members
    .map((id) => state.students.find((s) => s.id === id))
    .filter((s): s is Student => Boolean(s))

  return (
    <>
      <div className="ph-brand">Northhaven social</div>
      <h2 className="ph-hello">Campus</h2>
      <p className="meta" style={{ margin: '-8px 0 12px', color: '#4a5c7a' }}>
        {mine.length} groups · feeds from your people
      </p>
      <div className="ph-groups">
        <button type="button" className={!browse && gid === 'all' ? 'on' : ''} onClick={() => { setBrowse(false); setGid('all') }}>
          All
        </button>
        {mine.map((g) => (
          <button key={g.id} type="button" className={!browse && gid === g.id ? 'on' : ''} onClick={() => { setBrowse(false); setGid(g.id) }}>
            {g.name}
          </button>
        ))}
        <button type="button" className={browse ? 'on' : ''} onClick={() => setBrowse(true)}>
          <Plus size={12} /> Discover
        </button>
      </div>
      {browse && (
        <div className="ph-discover">
          {discover.map((g) => (
            <div key={g.id} className="ph-task">
              <div>
                <b>{g.name}</b>
                <div style={{ color: '#4a5c7a', fontSize: 12 }}>
                  {g.kind} · {g.members.length} Huskies · {g.blurb}
                </div>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  dispatch({ type: 'join-group', studentId: student.id, groupId: g.id })
                  setGid(g.id)
                  setBrowse(false)
                }}
              >
                Join
              </button>
            </div>
          ))}
        </div>
      )}
      {!browse && (
        <>
          <div className="next-card" style={{ marginBottom: 10 }}>
            <em>{gid === 'all' ? 'Your feed' : selected.kind}</em>
            <h3 style={{ fontSize: 16 }}>{gid === 'all' ? 'From your groups' : selected.name}</h3>
            <p style={{ color: '#4a5c7a', fontSize: 13 }}>{gid === 'all' ? `${mine.length} groups you belong to.` : selected.blurb}</p>
            {gid !== 'all' && (
              <div className="ph-faces">
                {members.slice(0, 8).map((s) => (
                  <button key={s.id} type="button" className={s.id === student.id ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                    {s.preferred}
                  </button>
                ))}
              </div>
            )}
            {gid !== 'all' && joined && selected.id !== 'g-huskies' && (
              <button type="button" className="btn alt" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'leave-group', studentId: student.id, groupId: selected.id })}>
                Leave group
              </button>
            )}
          </div>
          {joined && gid !== 'all' && (
            <form
              className="ph-compose"
              onSubmit={(e) => {
                e.preventDefault()
                if (!draft.trim()) return
                dispatch({ type: 'campus-post', studentId: student.id, groupId: selected.id, body: draft.trim() })
                setDraft('')
              }}
            >
              <textarea value={draft} placeholder={`Post to ${selected.name}`} onChange={(e) => setDraft(e.target.value)} rows={2} />
              <button type="submit" className="btn">
                Post
              </button>
            </form>
          )}
          {posts.map((p) => (
            <PostCard key={p.id} post={p} student={student} reply={reply[p.id] ?? ''} onReply={(t) => setReply((r) => ({ ...r, [p.id]: t }))} />
          ))}
        </>
      )}
    </>
  )
}

function PostCard({
  post,
  student,
  reply,
  onReply,
}: {
  post: CampusPost
  student: Student
  reply: string
  onReply: (t: string) => void
}) {
  const { state, dispatch } = useCampus()
  const group = state.groups.find((g) => g.id === post.groupId)
  const liked = post.likes.includes(student.id)
  return (
    <article className="ph-post">
      <div className="ph-post-top">
        <b>{post.author}</b>
        <span>
          {group?.name} · {whenFull(post.at)}
        </span>
      </div>
      <p>{post.body}</p>
      <div className="ph-post-act">
        <button type="button" className={liked ? 'on' : ''} onClick={() => dispatch({ type: 'like-post', studentId: student.id, postId: post.id })}>
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} /> {post.likes.length}
        </button>
        <span>
          <MessageCircle size={14} /> {post.comments.length}
        </span>
      </div>
      {post.comments.map((c) => (
        <div key={c.id} className="ph-comment">
          <b>{c.author}</b> {c.text}
        </div>
      ))}
      <form
        className="ph-reply"
        onSubmit={(e) => {
          e.preventDefault()
          if (!reply.trim()) return
          dispatch({ type: 'comment-post', studentId: student.id, postId: post.id, text: reply.trim() })
          onReply('')
        }}
      >
        <input value={reply} placeholder="Reply" onChange={(e) => onReply(e.target.value)} />
        <button type="submit" className="btn alt">
          Send
        </button>
      </form>
    </article>
  )
}

function Tasks({ student }: { student: Student }) {
  const { dispatch, state } = useCampus()
  const extras = extraTasks(student, dispatch, state.groups)
  return (
    <>
      <div className="ph-brand">Your checklist</div>
      <h2 className="ph-hello">One thing at a time</h2>
      {student.documents.map((d) => (
        <div key={d.id} className="ph-task">
          <div>
            <b>{d.kind}</b>
            <div style={{ color: '#4a5c7a', fontSize: 12 }}>
              {d.status}
              {d.note ? ` · ${d.note}` : ''}
            </div>
          </div>
          {d.status !== 'verified' ? (
            <button type="button" className="btn" onClick={() => dispatch({ type: 'upload-doc', id: student.id, docId: d.id })}>
              <Upload size={14} /> Upload
            </button>
          ) : (
            <span style={{ color: '#157a45', fontSize: 12 }}>Done</span>
          )}
        </div>
      ))}
      {(student.stage === 'offer' || student.stage === 'deposit' || student.stage === 'scholarship') && (
        <div className="ph-task">
          <div>
            <b>Enrollment deposit</b>
            <div style={{ color: '#4a5c7a', fontSize: 12 }}>{usd(student.deposit)}</div>
          </div>
          <button type="button" className="btn" disabled={student.depositPaid} onClick={() => dispatch({ type: 'pay-deposit', id: student.id })}>
            {student.depositPaid ? 'Paid' : 'Pay'}
          </button>
        </div>
      )}
      {student.onboard.map((t) => (
        <div key={t.id} className="ph-task">
          <div>
            <b>{t.label}</b>
            <div style={{ color: '#4a5c7a', fontSize: 12 }}>{t.detail}</div>
          </div>
          {t.status !== 'done' ? (
            <button type="button" className="btn alt" onClick={() => dispatch({ type: 'complete-onboard', id: student.id, taskId: t.id })}>
              Done
            </button>
          ) : (
            <span style={{ color: '#157a45', fontSize: 12 }}>Stamped</span>
          )}
        </div>
      ))}
      {extras.map((t) => (
        <div key={t.id} className="ph-task">
          <div>
            <b>{t.label}</b>
            <div style={{ color: '#4a5c7a', fontSize: 12 }}>{t.detail}</div>
          </div>
          <button type="button" className="btn alt" onClick={t.run}>
            {t.cta}
          </button>
        </div>
      ))}
    </>
  )
}

function extraTasks(
  student: Student,
  dispatch: ReturnType<typeof useCampus>['dispatch'],
  groups: ReturnType<typeof useCampus>['state']['groups'],
) {
  const items: { id: string; label: string; detail: string; cta: string; run: () => void }[] = []
  if (student.stage === 'enquiry') {
    items.unshift({
      id: 'x-apply',
      label: 'Submit admit application',
      detail: 'The form you started — save and send',
      cta: 'Submit',
      run: () => dispatch({ type: 'submit-application', id: student.id }),
    })
  }
  if (!student.appointment) {
    items.push({
      id: 'x-call',
      label: student.stage === 'enquiry' ? 'Campus visit' : 'Counselor call',
      detail: student.owner,
      cta: 'Book',
      run: () =>
        dispatch({
          type: 'book-appointment',
          id: student.id,
          kind: student.stage === 'enquiry' ? 'Campus visit' : 'Counselor call',
          at: student.stage === 'enquiry' ? 'Sat 22 Aug, 11:00' : 'Tue 18 Aug, 10:30',
          location: student.stage === 'enquiry' ? 'Fenwick 204' : 'Zoom · Admissions',
        }),
    })
  }
  const visa = groups.find((g) => g.id === 'g-visa')
  if (student.residency === 'international' && visa && !visa.members.includes(student.id)) {
    items.push({
      id: 'x-visa',
      label: 'Visa workshop group',
      detail: 'ISO · Thursday 10:30 Fenwick',
      cta: 'Join',
      run: () => dispatch({ type: 'join-group', studentId: student.id, groupId: 'g-visa' }),
    })
  }
  if (student.stage === 'alumni' && student.onboard.some((t) => t.status !== 'done')) {
    items.push({
      id: 'x-mentor',
      label: 'Mentor an incoming ENV student',
      detail: 'Green Hall · Chloe Bennett',
      cta: 'Accept',
      run: () => {
        const open = student.onboard.find((t) => t.status !== 'done')
        if (open) dispatch({ type: 'complete-onboard', id: student.id, taskId: open.id })
      },
    })
  }
  return items
}

function Aid({ student, program, aid, aidApproved }: { student: Student; program: string; aid: number; aidApproved: number }) {
  const { dispatch } = useCampus()
  const net = netBalance(student)
  const monthly = Math.max(250, Math.round(net / 4))
  const lines = student.awards.length
    ? student.awards
    : [
        {
          id: 'est',
          fundId: student.firstGen ? 'first-light' : student.residency === 'international' ? 'global' : 'horizon',
          status: 'eligible' as const,
          recommended: student.firstGen ? 12000 : 8000,
          approved: 0,
          rationale: ['Estimate only — packaging starts after admission'],
        },
      ]
  return (
    <>
      <div className="ph-brand">Affordability</div>
      <h2 className="ph-hello">Your package</h2>
      <div className="aid-band">
        <div className="amt">{aidApproved ? usd(aidApproved) : `${usd(Math.max(aid * 0.75, lines[0].recommended * 0.8))}–${usd(aid || lines[0].recommended)}`}</div>
        <p>{aidApproved ? 'Posted to your student account.' : student.awards.length ? 'Indicative — a human still signs.' : 'Preview until your file is complete.'}</p>
      </div>
      <div className="ph-cost">
        <div>
          <span>Tuition</span>
          <b>{usd(student.tuition)}</b>
        </div>
        <div>
          <span>Aid</span>
          <b>{usd(aidApproved || aid)}</b>
        </div>
        <div>
          <span>Paid</span>
          <b>{usd(student.paid)}</b>
        </div>
        <div>
          <span>Balance</span>
          <b>{usd(net)}</b>
        </div>
      </div>
      {lines.map((a) => (
        <div key={a.id} className="next-card" style={{ marginTop: 10 }}>
          <em>{a.status}</em>
          <h3>{usd(a.approved || a.recommended)}</h3>
          <p style={{ color: '#4a5c7a', fontSize: 13 }}>
            {FUNDS.find((f) => f.id === a.fundId)?.name ?? 'Estimated aid'} · {a.rationale[0]}
          </p>
        </div>
      ))}
      <div className="next-card">
        <em>Net tuition</em>
        <h3>{usd(Math.max(0, student.tuition - (aidApproved || aid)))}</h3>
        <p style={{ color: '#4a5c7a', fontSize: 13 }}>{program}</p>
      </div>
      {net > 0 && (
        <div className="next-card" style={{ marginTop: 10 }}>
          <em>Payment plan</em>
          <h3>{student.paymentPlan ? `${usd(student.paymentPlan)} / mo` : `Split ${usd(monthly)} × 4`}</h3>
          <p style={{ color: '#4a5c7a', fontSize: 13 }}>{student.paymentPlan ? 'On file in Workday.' : 'Four months instead of one August bill.'}</p>
          {!student.paymentPlan && (
            <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'set-payment-plan', id: student.id, monthly })}>
              Start plan
            </button>
          )}
        </div>
      )}
    </>
  )
}

function Mail({ student }: { student: Student }) {
  const { state } = useCampus()
  const msgs = student.messages ?? []
  const notices = feedFor(student.id, state.groups, state.posts)
    .filter((p) => p.authorId.startsWith('staff:'))
    .slice(0, 3)
  return (
    <>
      <div className="ph-brand">Inbox</div>
      <h2 className="ph-hello">From campus</h2>
      {msgs.length === 0 && notices.length === 0 && <p style={{ color: '#4a5c7a' }}>No messages yet.</p>}
      {msgs.map((m) => (
        <div key={m.id} className={`ph-msg ${m.read ? '' : 'unread'}`}>
          <b>{m.from}</b>
          <div style={{ fontSize: 12, color: '#4a5c7a' }}>{whenFull(m.at)}</div>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>{m.text}</p>
        </div>
      ))}
      {notices.map((p) => (
        <div key={p.id} className="ph-msg">
          <b>{p.author}</b>
          <div style={{ fontSize: 12, color: '#4a5c7a' }}>
            {state.groups.find((g) => g.id === p.groupId)?.name} · {whenFull(p.at)}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 13 }}>{p.body}</p>
        </div>
      ))}
    </>
  )
}

function Me({
  student,
  people,
  pct,
  onAdmit,
}: {
  student: Student
  people: Student[]
  pct: number
  onAdmit: (asFamily: boolean) => void
}) {
  const { dispatch, state } = useCampus()
  const program = PROGRAMS.find((p) => p.id === student.programId)
  const mine = groupsFor(student.id, state.groups)
  const live = people.filter((s) => s.stage !== 'alumni' || s.id === student.id)
  const app = applicationFor(student)
  return (
    <>
      <div className="ph-brand">Northhaven</div>
      <h2 className="ph-hello">{student.preferred}</h2>
      <p className="meta" style={{ margin: '-8px 0 12px', color: '#4a5c7a' }}>
        {student.pronouns} · {program?.name} · {student.stage}
      </p>
      <div className="people-switch" style={{ marginBottom: 12 }}>
        {live.map((s) => (
          <button key={s.id} type="button" className={s.id === student.id ? 'on' : ''} onClick={() => dispatch({ type: 'focus', id: s.id })}>
            {s.preferred}
          </button>
        ))}
      </div>
      <button type="button" className="ph-admit-open" onClick={() => onAdmit(false)}>
        <FileText size={16} />
        <span>
          <b>Admit record · {pct}%</b>
          <small>{app.submitted ? `Submitted ${app.submitted}` : 'Draft — not submitted yet'}</small>
        </span>
      </button>
      <button type="button" className="ph-admit-open" onClick={() => onAdmit(true)}>
        <Users size={16} />
        <span>
          <b>Family view</b>
          <small>{familyStatus(student)}</small>
        </span>
      </button>
      <div className="next-card">
        <em>Canonical id</em>
        <h3 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 16 }}>{student.canonicalId}</h3>
        <p style={{ color: '#4a5c7a', fontSize: 13 }}>
          {student.email}
          <br />
          {student.phone}
          <br />
          {student.city}, {student.country}
          {student.firstGen ? ' · First-gen' : ''}
        </p>
      </div>
      <div className="next-card">
        <em>Your counselor</em>
        <h3>{student.owner}</h3>
        <p style={{ color: '#4a5c7a', fontSize: 13 }}>Usually replies within a business day. Family can open the same admit record.</p>
      </div>
      <div className="next-card">
        <em>Groups</em>
        <h3 style={{ fontSize: 16 }}>{mine.map((g) => g.name).join(' · ') || 'Join a group on Campus'}</h3>
        <p style={{ color: '#4a5c7a', fontSize: 13 }}>{mine.length} feeds on your Campus tab.</p>
      </div>
    </>
  )
}

function AdmitRecord({ student, family, onBack }: { student: Student; family: boolean; onBack: () => void }) {
  const { dispatch } = useCampus()
  const pct = admitPercent(student)
  const flow = admitWorkflow(student)
  const app = applicationFor(student)
  const [open, setOpen] = useState(app.submitted ? 'apply' : 'enquiry')
  const step = flow.find((s) => s.id === open) ?? flow[0]

  return (
    <>
      <button type="button" className="ph-back" onClick={onBack}>
        <ChevronLeft size={16} /> Back
      </button>
      <div className="ph-brand">{family ? `Family · ${student.preferred}` : 'Your admission'}</div>
      <h2 className="ph-hello">{pct}%</h2>
      <p className="meta" style={{ margin: '-8px 0 10px', color: '#4a5c7a' }}>
        {family ? familyStatus(student) : pct >= 100 ? 'Workflow complete. This is the record you entered, plus every gate after it.' : 'Live workflow from enquiry to arrival. Tap a step to see the data.'}
      </p>
      <div className="ph-progress">
        <i style={{ width: `${pct}%` }} />
      </div>
      <ol className="ph-flow">
        {flow.map((s) => (
          <li key={s.id}>
            <button type="button" className={`${s.status} ${open === s.id ? 'on' : ''}`} onClick={() => setOpen(s.id)}>
              <em />
              <span>
                <b>{s.label}</b>
                <small>{s.hint}</small>
              </span>
              <strong>{s.status === 'complete' ? 'Done' : s.status}</strong>
            </button>
          </li>
        ))}
      </ol>
      <div className="next-card" style={{ marginTop: 8 }}>
        <em>
          {step.label} · {step.owner}
        </em>
        <h3 style={{ fontSize: 16 }}>{step.hint}</h3>
        <p style={{ color: '#4a5c7a', fontSize: 13 }}>{family ? step.studentCopy.replace(/WES|SLA|Banner/gi, 'campus systems') : step.studentCopy}</p>
        {open === 'apply' && (
          <div className="ph-app-form">
            <p>
              <b>Legal name</b> {app.legalName} ({app.pronouns})
            </p>
            <p>
              <b>Contact</b> {app.email}
              <br />
              {app.phone}
              <br />
              {app.address}
            </p>
            <p>
              <b>Citizenship</b> {app.citizenship} · {app.residency}
              {app.firstGen ? ' · first-gen' : ''}
            </p>
            <p>
              <b>Program</b> {app.program}, {app.college} · {app.term}
            </p>
            <p>
              <b>Prior school</b> {app.priorSchool}
              <br />
              GPA {app.gpa} · {app.tests}
            </p>
            <p>
              <b>Household</b> {app.incomeBand} · {app.family.name} ({app.family.relation})
            </p>
            <p>
              <b>{app.essayTitle}</b>
              <br />
              {app.essay}
            </p>
            {app.recommenders.length > 0 && (
              <p>
                <b>Recommenders</b> {app.recommenders.join('; ')}
              </p>
            )}
            <p>
              <b>Source</b> {app.source}
              <br />
              {app.submitted ? `Submitted ${app.submitted}` : 'Draft — not submitted'}
              {app.consent ? ' · consent on file' : ''}
            </p>
            {!app.submitted && !family && (
              <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'submit-application', id: student.id })}>
                Submit application
              </button>
            )}
          </div>
        )}
        {open === 'evidence' && (
          <ul className="why">
            {student.documents.map((d) => (
              <li key={d.id}>
                {d.kind} — {d.status}
                {family ? '' : d.note ? ` · ${d.note}` : ''}
              </li>
            ))}
            {student.documents.length === 0 && <li>No files on the admit record yet.</li>}
          </ul>
        )}
        {open === 'aid' && (
          <ul className="why">
            {student.awards.map((a) => (
              <li key={a.id}>
                {FUNDS.find((f) => f.id === a.fundId)?.name}: {usd(a.approved || a.recommended)} ({a.status})
              </li>
            ))}
            {student.awards.length === 0 && <li>No award lines yet — packaging starts after admission.</li>}
          </ul>
        )}
        {open === 'arrive' && (
          <ul className="why">
            {student.onboard.map((t) => (
              <li key={t.id}>
                {t.label} — {t.status === 'done' ? 'stamped' : t.detail}
              </li>
            ))}
            {student.onboard.length === 0 && <li>Arrival stamps open after the deposit posts.</li>}
          </ul>
        )}
      </div>
    </>
  )
}
