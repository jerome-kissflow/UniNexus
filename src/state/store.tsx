import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import { CAMPUS_GROUPS, CAMPUS_POSTS } from '../data/campus'
import { CONNECTORS, FUNDS, GRANTS, INITIAL_EVENTS, seedStudents } from '../data/seed'
import type { CampusGroup, CampusPost, Connector, Fund, Grant, PulseEvent, SourceSystem, Student } from '../data/types'

export type State = {
  students: Student[]
  funds: Fund[]
  grants: Grant[]
  connectors: Connector[]
  events: PulseEvent[]
  groups: CampusGroup[]
  posts: CampusPost[]
  focusId: string
  now: string
}

export type Action =
  | { type: 'focus'; id: string }
  | { type: 'reset' }
  | { type: 'upload-doc'; id: string; docId: string }
  | { type: 'request-doc'; id: string; kind: string }
  | { type: 'add-note'; id: string; actor: string; text: string }
  | { type: 'assign'; id: string; owner: string }
  | { type: 'escalate-dean'; id: string }
  | { type: 'dean-approve'; id: string }
  | { type: 'dean-request'; id: string; text: string }
  | { type: 'waitlist'; id: string }
  | { type: 'release-offer'; id: string }
  | { type: 'send-nudge'; id: string; from: string; text: string }
  | { type: 'read-inbox'; id: string }
  | { type: 'approve-award'; awardId: string }
  | { type: 'decline-award'; awardId: string }
  | { type: 'adjust-award'; awardId: string; amount: number }
  | { type: 'pay-deposit'; id: string }
  | { type: 'record-payment'; id: string; amount: number }
  | { type: 'complete-onboard'; id: string; taskId: string }
  | { type: 'assign-housing'; id: string; room: string }
  | { type: 'sync-connector'; id: SourceSystem }
  | { type: 'log-grant-spend'; grantId: string; amount: number }
  | { type: 'submit-grant-report'; grantId: string }
  | { type: 'clear-compliance'; grantId: string }
  | { type: 'book-appointment'; id: string; kind: string; at: string; location: string }
  | { type: 'set-payment-plan'; id: string; monthly: number }
  | { type: 'set-movein'; id: string; slot: string }
  | { type: 'set-roommate'; id: string; name: string }
  | { type: 'send-award-letter'; id: string }
  | { type: 'bulk-nudge'; ids: string[]; from: string; text: string }
  | { type: 'heal-connector'; id: SourceSystem }
  | { type: 'join-group'; studentId: string; groupId: string }
  | { type: 'leave-group'; studentId: string; groupId: string }
  | { type: 'campus-post'; studentId: string; groupId: string; body: string }
  | { type: 'like-post'; studentId: string; postId: string }
  | { type: 'comment-post'; studentId: string; postId: string; text: string }
  | { type: 'submit-application'; id: string }

function hydrate(s: Student): Student {
  const inbox =
    s.messages ??
    (s.id === 'st-priya'
      ? [
          {
            id: 'm1',
            at: '2026-08-11T08:15:00',
            from: 'Elena Voss',
            text: 'We see the WES delay. An official electronic transcript from IIT Bombay also works.',
            read: false,
          },
          {
            id: 'm2',
            at: '2026-08-03T10:05:00',
            from: 'UniNexus',
            text: 'Your file is with the College of Engineering. Typical faculty review is five days.',
            read: true,
          },
        ]
      : s.id === 'st-chloe'
        ? [
            {
              id: 'm3',
              at: '2026-08-10T09:00:00',
              from: 'Nina Alvarez',
              text: 'Immunization is the only stamp blocking housing. Upload it and East Hall can assign.',
              read: false,
            },
          ]
        : s.id === 'st-liam'
          ? [
              {
                id: 'm-liam',
                at: '2026-08-04T09:30:00',
                from: 'UniNexus',
                text: 'We have your campus tour request. A first-gen History counselor will call — you can also book from Home.',
                read: false,
              },
            ]
          : s.id === 'st-noah'
            ? [
                {
                  id: 'm-noah',
                  at: '2026-08-12T11:00:00',
                  from: 'Elena Voss',
                  text: 'Horizon + Dean awards are posted. If UW is still in play, compare net in Aid before 1 Sep.',
                  read: false,
                },
              ]
            : s.id === 'st-daniel'
              ? [
                  {
                    id: 'm-dan',
                    at: '2026-08-11T16:05:00',
                    from: 'Dr. Helen Park',
                    text: 'RA hours start Monday even if Banner is late. Journal club Thursday — see Park BME Lab.',
                    read: true,
                  },
                ]
              : s.id === 'st-yuki'
                ? [
                    {
                      id: 'm-yuki',
                      at: '2026-08-12T19:10:00',
                      from: 'Arts Admissions',
                      text: 'Open studio is open to incoming MFA. Deposit can wait — bring the offer letter.',
                      read: false,
                    },
                  ]
                : s.id === 'st-mateo'
                  ? [
                      {
                        id: 'm-mateo',
                        at: '2026-08-08T14:00:00',
                        from: 'Elena Voss',
                        text: 'You are on the MBA waitlist. Committee reviews 21 Aug. We will not lose you to a competing offer without a call.',
                        read: false,
                      },
                    ]
                  : s.id === 'st-grace'
                    ? [
                        {
                          id: 'm-grace',
                          at: '2026-08-09T10:00:00',
                          from: 'Advancement',
                          text: 'Young alumni council meets 12 Sep. Green Hall also wants you at the river cleanup 23 Aug.',
                          read: false,
                        },
                      ]
                    : [])
  return { ...s, notes: s.notes ?? [], messages: inbox }
}

function cloneStudents() {
  return structuredClone(seedStudents()).map(hydrate)
}

function stamp() {
  return new Date().toISOString()
}

function nid() {
  return Math.random().toString(36).slice(2, 8)
}

function pushEvent(state: State, e: Omit<PulseEvent, 'id' | 'at'>): PulseEvent[] {
  return [{ id: `e-${nid()}`, at: stamp(), ...e }, ...state.events].slice(0, 40)
}

function patchStudent(students: Student[], id: string, fn: (s: Student) => Student) {
  return students.map((s) => (s.id === id ? fn(s) : s))
}

function initial(): State {
  return {
    students: cloneStudents(),
    funds: structuredClone(FUNDS),
    grants: structuredClone(GRANTS),
    connectors: structuredClone(CONNECTORS),
    events: [...INITIAL_EVENTS],
    groups: structuredClone(CAMPUS_GROUPS),
    posts: structuredClone(CAMPUS_POSTS),
    focusId: 'st-priya',
    now: '2026-08-14',
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'focus':
      return { ...state, focusId: action.id }
    case 'reset':
      return { ...initial(), now: state.now }
    case 'upload-doc': {
      const students = patchStudent(state.students, action.id, (s) => {
        const documents = s.documents.map((d) =>
          d.id === action.docId ? { ...d, status: 'verified' as const, updated: '2026-08-14', note: 'Uploaded from UniNexus' } : d,
        )
        const open = documents.filter((d) => d.status !== 'verified')
        return {
          ...s,
          documents,
          risk: open.length ? s.risk : s.steps.some((st) => st.status === 'overdue') ? 'watch' : 'clear',
          riskWhy: open.length ? s.riskWhy.filter((w) => !w.toLowerCase().includes(documents.find((d) => d.id === action.docId)?.kind.slice(0, 8).toLowerCase() ?? 'xxx')) : s.riskWhy.filter((w) => !w.toLowerCase().includes('wes') && !w.toLowerCase().includes('affidavit') && !w.toLowerCase().includes('passport')),
          nextAction: open.length ? `Still needed: ${open[0].kind}` : 'Staff review in progress',
          nextActor: open.length ? ('student' as const) : ('staff' as const),
          steps: s.steps.map((st) => (st.label.includes('Evidence') && open.length === 0 ? { ...st, status: 'complete' as const } : st)),
          timeline: [{ at: stamp(), title: 'Document received', detail: `${s.documents.find((d) => d.id === action.docId)?.kind ?? 'File'} verified.`, source: 'ellucian' as const }, ...s.timeline],
        }
      })
      return {
        ...state,
        students,
        events: pushEvent(state, { title: 'Document verified', detail: 'Banner writeback complete.', studentId: action.id, app: 'admissions', source: 'ellucian' }),
      }
    }
    case 'request-doc': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        documents: [
          ...s.documents,
          { id: `d-${nid()}`, kind: action.kind, status: 'missing' as const, source: 'campusflow' as const, sourceId: `REQ-${nid()}`, updated: '2026-08-14', owner: s.owner, note: 'Requested by staff' },
        ],
        nextAction: `Upload ${action.kind}`,
        nextActor: 'student' as const,
        messages: [
          { id: nid(), at: stamp(), from: s.owner, text: `Please upload ${action.kind} so we can move your file.`, read: false },
          ...(s.messages ?? []),
        ],
        timeline: [{ at: stamp(), title: 'Document requested', detail: action.kind, source: 'campusflow' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Document requested', detail: action.kind, studentId: action.id, app: 'admissions', source: 'campusflow' }) }
    }
    case 'add-note': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        notes: [{ at: stamp(), actor: action.actor, text: action.text }, ...(s.notes ?? [])],
        timeline: [{ at: stamp(), title: `Note · ${action.actor}`, detail: action.text, source: 'campusflow' as const }, ...s.timeline],
      }))
      return { ...state, students }
    }
    case 'assign': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        owner: action.owner,
        timeline: [{ at: stamp(), title: 'Owner changed', detail: action.owner, source: 'campusflow' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Case assigned', detail: action.owner, studentId: action.id, app: 'admissions', source: 'campusflow' }) }
    }
    case 'escalate-dean': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        timeline: [{ at: stamp(), title: 'Escalated to dean', detail: 'SLA + visa window cited.', source: 'campusflow' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Escalation sent', detail: 'Dean queue prioritized.', studentId: action.id, app: 'admissions', source: 'campusflow' }) }
    }
    case 'dean-approve': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        stage: 'scholarship' as const,
        risk: s.documents.some((d) => d.status !== 'verified') ? 'watch' : 'clear',
        riskWhy: s.riskWhy.filter((w) => !w.toLowerCase().includes('dean')),
        owner: 'Marcus Webb',
        nextAction: 'Scholarship packaging',
        nextActor: 'staff' as const,
        steps: s.steps.map((st) => (st.label.includes('Departmental') ? { ...st, status: 'complete' as const } : st)),
        awards: s.awards.map((a) => (a.fundId === 'eng-dean' ? { ...a, status: 'recommended' as const, exceptions: [] } : a)),
        messages: [{ id: nid(), at: stamp(), from: 'Dr. Helen Park', text: 'Faculty has approved your admission. Aid packaging is next.', read: false }, ...(s.messages ?? [])],
        timeline: [{ at: stamp(), title: 'Departmental approval', detail: 'Dean signed.', source: 'ellucian' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Dean approved', detail: 'Moved to aid packaging.', studentId: action.id, app: 'scholarship', source: 'ellucian' }) }
    }
    case 'dean-request': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        nextAction: action.text,
        nextActor: 'student' as const,
        messages: [{ id: nid(), at: stamp(), from: 'Dr. Helen Park', text: action.text, read: false }, ...(s.messages ?? [])],
        timeline: [{ at: stamp(), title: 'Dean requested information', detail: action.text, source: 'campusflow' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Dean requested info', detail: action.text, studentId: action.id, app: 'admissions', source: 'campusflow' }) }
    }
    case 'waitlist': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        stage: 'departmental' as const,
        risk: 'watch' as const,
        nextAction: 'Waitlist — committee review',
        nextActor: 'staff' as const,
        timeline: [{ at: stamp(), title: 'Waitlisted', detail: 'Committee hold.', source: 'campusflow' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Waitlisted', detail: 'Committee hold recorded.', studentId: action.id, app: 'admissions', source: 'campusflow' }) }
    }
    case 'release-offer': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        stage: 'offer' as const,
        nextAction: `Pay ${s.deposit} enrollment deposit`,
        nextActor: 'student' as const,
        messages: [{ id: nid(), at: stamp(), from: s.owner, text: 'Your offer is ready. Pay the enrollment deposit to hold your seat.', read: false }, ...(s.messages ?? [])],
        timeline: [{ at: stamp(), title: 'Offer released', detail: 'I-20 / letter queued.', source: 'ellucian' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Offer released', detail: 'Student notified.', studentId: action.id, app: 'admissions', source: 'ellucian' }) }
    }
    case 'send-nudge': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        messages: [{ id: nid(), at: stamp(), from: action.from, text: action.text, read: false }, ...(s.messages ?? [])],
        timeline: [{ at: stamp(), title: 'Nudge sent', detail: action.text, source: 'campusflow' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Nudge sent', detail: action.text, studentId: action.id, app: 'student', source: 'campusflow' }) }
    }
    case 'read-inbox': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        messages: (s.messages ?? []).map((m) => ({ ...m, read: true })),
      }))
      return { ...state, students }
    }
    case 'approve-award': {
      let studentId = ''
      const students = state.students.map((s) => {
        if (!s.awards.some((a) => a.id === action.awardId)) return s
        studentId = s.id
        const awards = s.awards.map((a) => (a.id === action.awardId ? { ...a, status: 'approved' as const, approved: a.recommended } : a))
        const allApproved = awards.length > 0 && awards.every((a) => a.status === 'approved' || a.status === 'declined')
        return {
          ...s,
          awards,
          stage: allApproved ? ('offer' as const) : s.stage,
          nextAction: allApproved ? 'Review offer & pay enrollment deposit' : s.nextAction,
          nextActor: allApproved ? ('student' as const) : s.nextActor,
          messages: allApproved
            ? [{ id: nid(), at: stamp(), from: 'Marcus Webb', text: 'Your aid package is posted. Review it in Aid, then pay the deposit when you are ready.', read: false }, ...(s.messages ?? [])]
            : s.messages,
          timeline: [{ at: stamp(), title: 'Award approved', detail: 'Posted to Workday.', source: 'workday' as const }, ...s.timeline],
        }
      })
      const funds = state.funds.map((f) => {
        const extra = students.flatMap((s) => s.awards).filter((a) => a.id === action.awardId && a.fundId === f.id).reduce((n, a) => n + a.approved, 0)
        if (!extra) return f
        return { ...f, committed: f.committed + extra, remaining: Math.max(0, f.remaining - extra) }
      })
      return { ...state, students, funds, events: pushEvent(state, { title: 'Award approved', detail: 'Forecast updated.', studentId, app: 'tower', source: 'workday' }) }
    }
    case 'decline-award': {
      let studentId = ''
      const students = state.students.map((s) => {
        if (!s.awards.some((a) => a.id === action.awardId)) return s
        studentId = s.id
        return {
          ...s,
          awards: s.awards.map((a) => (a.id === action.awardId ? { ...a, status: 'declined' as const, approved: 0 } : a)),
          timeline: [{ at: stamp(), title: 'Award declined', detail: 'Fund not packaged.', source: 'workday' as const }, ...s.timeline],
        }
      })
      return { ...state, students, events: pushEvent(state, { title: 'Award declined', detail: 'Package updated.', studentId, app: 'scholarship', source: 'workday' }) }
    }
    case 'adjust-award': {
      const students = state.students.map((s) => ({
        ...s,
        awards: s.awards.map((a) => (a.id === action.awardId ? { ...a, recommended: action.amount } : a)),
      }))
      return { ...state, students }
    }
    case 'pay-deposit': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        depositPaid: true,
        paid: s.paid + s.deposit,
        stage: 'enrolled' as const,
        risk: 'clear' as const,
        riskWhy: [],
        nextAction: 'Complete welcome stamps',
        nextActor: 'student' as const,
        csat: Math.max(s.csat, 90),
        onboard:
          s.onboard.length > 0
            ? s.onboard
            : [
                { id: 'n1', label: 'Northhaven email', system: 'ellucian' as const, status: 'done' as const, detail: s.email },
                { id: 'n2', label: 'Canvas access', system: 'canvas' as const, status: 'open' as const, detail: 'Orientation course assigned' },
                { id: 'n3', label: 'I-20 / ID', system: 'ellucian' as const, status: 'open' as const, detail: 'International Student Office' },
                { id: 'n4', label: 'Housing interest', system: 'starrez' as const, status: 'open' as const, detail: 'Graduate village waitlist' },
              ],
        timeline: [{ at: stamp(), title: 'Enrollment deposit posted', detail: `Workday received ${s.deposit}.`, source: 'workday' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Deposit collected', detail: 'Census +1.', studentId: action.id, app: 'finance', source: 'workday' }) }
    }
    case 'record-payment': {
      const students = patchStudent(state.students, action.id, (s) => {
        const paid = s.paid + action.amount
        return {
          ...s,
          paid,
          depositPaid: paid >= s.deposit,
          stage: paid >= s.deposit && (s.stage === 'offer' || s.stage === 'deposit') ? ('enrolled' as const) : s.stage,
          timeline: [{ at: stamp(), title: 'Payment posted', detail: `$${action.amount.toLocaleString('en-US')}`, source: 'workday' as const }, ...s.timeline],
        }
      })
      return { ...state, students, events: pushEvent(state, { title: 'Payment posted', detail: `$${action.amount.toLocaleString('en-US')}`, studentId: action.id, app: 'finance', source: 'workday' }) }
    }
    case 'complete-onboard': {
      const students = patchStudent(state.students, action.id, (s) => {
        const onboard = s.onboard.map((t) => (t.id === action.taskId ? { ...t, status: 'done' as const } : t))
        const blockedLeft = onboard.filter((t) => t.status === 'blocked' || t.status === 'open')
        return {
          ...s,
          onboard,
          housing: action.taskId.toLowerCase().includes('house') ? s.housing ?? 'Assigned' : s.housing,
          documents: s.documents.map((d) => (d.status === 'missing' && action.taskId.includes('imm') ? { ...d, status: 'verified' as const, note: 'Uploaded' } : d)),
          nextAction: blockedLeft[0]?.label ?? 'You are ready for move-in',
          timeline: [{ at: stamp(), title: 'Onboarding stamp', detail: s.onboard.find((t) => t.id === action.taskId)?.label ?? 'Task', source: 'campusflow' as const }, ...s.timeline],
        }
      })
      return { ...state, students, events: pushEvent(state, { title: 'Passport stamp', detail: 'Readiness updated.', studentId: action.id, app: 'onboarding', source: 'campusflow' }) }
    }
    case 'assign-housing': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        housing: action.room,
        onboard: s.onboard.map((t) => (t.system === 'starrez' ? { ...t, status: 'done' as const, detail: action.room } : t)),
        timeline: [{ at: stamp(), title: 'Housing assigned', detail: action.room, source: 'starrez' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Housing assigned', detail: action.room, studentId: action.id, app: 'onboarding', source: 'starrez' }) }
    }
    case 'sync-connector': {
      const connectors = state.connectors.map((c) => (c.id === action.id ? { ...c, lastSync: stamp(), latencyMs: Math.max(40, c.latencyMs - 12) } : c))
      return { ...state, connectors, events: pushEvent(state, { title: `Sync · ${action.id}`, detail: 'Pull complete. Canonical copy refreshed.', app: 'systems', source: action.id }) }
    }
    case 'log-grant-spend': {
      const grants = state.grants.map((g) => (g.id === action.grantId ? { ...g, spent: g.spent + action.amount } : g))
      return { ...state, grants, events: pushEvent(state, { title: 'Grant spend logged', detail: `$${action.amount.toLocaleString('en-US')}`, app: 'grants', source: 'workday' }) }
    }
    case 'submit-grant-report': {
      const grants = state.grants.map((g) => (g.id === action.grantId ? { ...g, compliance: g.compliance === 'overdue' ? ('due' as const) : ('current' as const), paperTrail: `Report submitted ${stamp().slice(0, 10)}` } : g))
      return { ...state, grants, events: pushEvent(state, { title: 'Grant report submitted', detail: 'Paper trail updated.', app: 'grants', source: 'campusflow' }) }
    }
    case 'clear-compliance': {
      const grants = state.grants.map((g) => (g.id === action.grantId ? { ...g, compliance: 'current' as const, paperTrail: `${g.paperTrail} · cleared ${stamp().slice(0, 10)}` } : g))
      return { ...state, grants, events: pushEvent(state, { title: 'Compliance cleared', detail: 'Admin sign-off recorded.', app: 'grants', source: 'campusflow' }) }
    }
    case 'book-appointment': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        appointment: { kind: action.kind, at: action.at, location: action.location },
        messages: [{ id: nid(), at: stamp(), from: 'UniNexus', text: `${action.kind} booked for ${action.at} at ${action.location}.`, read: false }, ...(s.messages ?? [])],
        timeline: [{ at: stamp(), title: 'Appointment booked', detail: `${action.kind} · ${action.at}`, source: 'campusflow' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Appointment booked', detail: action.kind, studentId: action.id, app: 'student', source: 'campusflow' }) }
    }
    case 'set-payment-plan': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        paymentPlan: action.monthly,
        nextAction: `Payment plan · ${action.monthly}/mo`,
        timeline: [{ at: stamp(), title: 'Payment plan', detail: `$${action.monthly}/month`, source: 'workday' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Payment plan set', detail: `$${action.monthly}/mo`, studentId: action.id, app: 'finance', source: 'workday' }) }
    }
    case 'set-movein': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        moveIn: action.slot,
        messages: [{ id: nid(), at: stamp(), from: 'Residence Life', text: `Your move-in window is ${action.slot}. Bring photo ID.`, read: false }, ...(s.messages ?? [])],
        timeline: [{ at: stamp(), title: 'Move-in reserved', detail: action.slot, source: 'starrez' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Move-in reserved', detail: action.slot, studentId: action.id, app: 'onboarding', source: 'starrez' }) }
    }
    case 'set-roommate': {
      const students = patchStudent(state.students, action.id, (s) => ({
        ...s,
        roommate: action.name,
        timeline: [{ at: stamp(), title: 'Roommate preference', detail: action.name, source: 'starrez' as const }, ...s.timeline],
      }))
      return { ...state, students, events: pushEvent(state, { title: 'Roommate saved', detail: action.name, studentId: action.id, app: 'onboarding', source: 'starrez' }) }
    }
    case 'send-award-letter': {
      const students = patchStudent(state.students, action.id, (s) => {
        const aid = s.awards.reduce((n, a) => n + (a.approved || a.recommended), 0)
        return {
          ...s,
          messages: [{ id: nid(), at: stamp(), from: 'Student Financial Services', text: `Official award letter: ${aid.toLocaleString('en-US')} USD posted to your account.`, read: false }, ...(s.messages ?? [])],
          timeline: [{ at: stamp(), title: 'Award letter sent', detail: 'Student notified in Pulse.', source: 'workday' as const }, ...s.timeline],
        }
      })
      return { ...state, students, events: pushEvent(state, { title: 'Award letter sent', detail: 'Visible in Student Pulse inbox.', studentId: action.id, app: 'scholarship', source: 'workday' }) }
    }
    case 'bulk-nudge': {
      let students = state.students
      for (const id of action.ids) {
        students = patchStudent(students, id, (s) => ({
          ...s,
          messages: [{ id: nid(), at: stamp(), from: action.from, text: action.text, read: false }, ...(s.messages ?? [])],
          timeline: [{ at: stamp(), title: 'Nudge sent', detail: action.text, source: 'campusflow' as const }, ...s.timeline],
        }))
      }
      return { ...state, students, events: pushEvent(state, { title: `Nudged ${action.ids.length} students`, detail: action.text, app: 'student', source: 'campusflow' }) }
    }
    case 'heal-connector': {
      const connectors = state.connectors.map((c) =>
        c.id === action.id ? { ...c, health: Math.min(100, c.health + 3), latencyMs: Math.max(32, c.latencyMs - 18), lastSync: stamp() } : c,
      )
      return { ...state, connectors, events: pushEvent(state, { title: 'Connector healed', detail: `${action.id} retry succeeded.`, app: 'systems', source: action.id }) }
    }
    case 'join-group': {
      const groups = state.groups.map((g) =>
        g.id === action.groupId && !g.members.includes(action.studentId) ? { ...g, members: [...g.members, action.studentId] } : g,
      )
      return { ...state, groups }
    }
    case 'leave-group': {
      const groups = state.groups.map((g) =>
        g.id === action.groupId ? { ...g, members: g.members.filter((id) => id !== action.studentId) } : g,
      )
      return { ...state, groups }
    }
    case 'campus-post': {
      const who = state.students.find((s) => s.id === action.studentId)
      const post: CampusPost = {
        id: `p-${nid()}`,
        groupId: action.groupId,
        authorId: action.studentId,
        author: who?.preferred ?? 'Husky',
        at: stamp(),
        body: action.body,
        likes: [],
        comments: [],
      }
      return {
        ...state,
        posts: [post, ...state.posts],
        events: pushEvent(state, { title: 'Campus post', detail: action.body.slice(0, 80), studentId: action.studentId, app: 'student', source: 'anthology' }),
      }
    }
    case 'like-post': {
      const posts = state.posts.map((p) => {
        if (p.id !== action.postId) return p
        const liked = p.likes.includes(action.studentId)
        return { ...p, likes: liked ? p.likes.filter((id) => id !== action.studentId) : [...p.likes, action.studentId] }
      })
      return { ...state, posts }
    }
    case 'comment-post': {
      const who = state.students.find((s) => s.id === action.studentId)
      const posts = state.posts.map((p) =>
        p.id === action.postId
          ? {
              ...p,
              comments: [...p.comments, { id: nid(), authorId: action.studentId, author: who?.preferred ?? 'Husky', at: stamp(), text: action.text }],
            }
          : p,
      )
      return { ...state, posts }
    }
    case 'submit-application': {
      const students = patchStudent(state.students, action.id, (s) => {
        if (s.stage !== 'enquiry') return s
        return {
          ...s,
          stage: 'applied' as const,
          nextAction: 'Upload unofficial transcript',
          nextActor: 'student' as const,
          applied: '2026-08-15',
          csat: Math.max(s.csat, 40),
          documents: s.documents.some((d) => /transcript/i.test(d.kind))
            ? s.documents
            : [
                ...s.documents,
                { id: `d-${nid()}`, kind: 'Unofficial transcript', status: 'pending' as const, source: 'ellucian' as const, sourceId: `BNR-${nid()}`, updated: '2026-08-15', owner: s.owner, note: 'Submitted with application' },
              ],
          steps: s.steps.map((st) => (st.label.toLowerCase().includes('enquiry') ? { ...st, status: 'complete' as const } : st)).concat(
            s.steps.some((st) => st.label.toLowerCase().includes('application'))
              ? []
              : [{ id: `s-${nid()}`, label: 'Application submitted', owner: s.name, slaDays: 1, opened: '2026-08-15', due: '2026-08-15', status: 'complete' as const }],
          ),
          timeline: [{ at: stamp(), title: 'Application submitted', detail: 'Student submitted the admit record from Pulse.', source: 'salesforce' as const }, ...s.timeline],
          messages: [{ id: nid(), at: stamp(), from: s.owner, text: 'We have your application. Upload the unofficial transcript so verification can start.', read: false }, ...(s.messages ?? [])],
        }
      })
      return { ...state, students, events: pushEvent(state, { title: 'Application submitted', detail: 'Admit record locked from Pulse.', studentId: action.id, app: 'admissions', source: 'salesforce' }) }
    }
    default:
      return state
  }
}

const StoreCtx = createContext<{
  state: State
  dispatch: (a: Action) => void
  student: Student
  byId: (id: string) => Student | undefined
} | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial)
  const value = useMemo(() => {
    const byId = (id: string) => state.students.find((s) => s.id === id)
    const student = byId(state.focusId) ?? state.students[0]
    return { state, dispatch, student, byId }
  }, [state])
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useCampus() {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('Store missing')
  return ctx
}
