import { PROGRAMS } from './seed'
import type { Stage, Student } from './types'

export type AdmitStepStatus = 'complete' | 'active' | 'waiting' | 'overdue' | 'blocked'

export type AdmitStep = {
  id: string
  label: string
  hint: string
  owner: string
  status: AdmitStepStatus
  studentCopy: string
}

export type AdmitApplication = {
  submitted: string | null
  source: string
  legalName: string
  preferred: string
  pronouns: string
  email: string
  phone: string
  address: string
  citizenship: string
  residency: string
  firstGen: boolean
  incomeBand: string
  priorSchool: string
  gpa: number
  tests: string
  program: string
  college: string
  term: string
  essayTitle: string
  essay: string
  recommenders: string[]
  family: { name: string; relation: string; email: string; phone: string }
  consent: boolean
}

const FLOW: { id: string; label: string; hint: string; owner: string }[] = [
  { id: 'enquiry', label: 'Enquiry', hint: 'Your interest reached Northhaven', owner: 'Admissions' },
  { id: 'apply', label: 'Application submitted', hint: 'The record you entered', owner: 'You' },
  { id: 'evidence', label: 'Transcripts & evidence', hint: 'Schools and tests we verify', owner: 'Admissions' },
  { id: 'recs', label: 'Recommendations', hint: 'Faculty or counselor letters', owner: 'Your recommenders' },
  { id: 'dept', label: 'Department / dean', hint: 'Program faculty review', owner: 'Faculty' },
  { id: 'aid', label: 'Scholarship', hint: 'Need and merit packaging', owner: 'Student Financial Services' },
  { id: 'offer', label: 'Offer letter', hint: 'Offer letter in writing', owner: 'Admissions' },
  { id: 'fees', label: 'Enrollment deposit', hint: 'Hold your seat', owner: 'You' },
  { id: 'enroll', label: 'Enrolled', hint: 'You are on the census', owner: 'Registrar' },
  { id: 'arrive', label: 'Arrival stamps', hint: 'ID, LMS, housing, health', owner: 'Student success' },
]

const ORDER: Stage[] = ['enquiry', 'applied', 'verifying', 'departmental', 'scholarship', 'offer', 'deposit', 'enrolled', 'onboarding', 'alumni']

const EXTRA: Record<
  string,
  { school: string; source: string; essayTitle: string; essay: string; recs: string[]; family: AdmitApplication['family'] }
> = {
  'st-priya': {
    school: 'IIT Bombay · B.Tech Computer Science',
    source: 'CS webinar · Salesforce NU-CS-26',
    essayTitle: 'Statement of purpose',
    essay:
      'I want to build reliable systems for clinics that cannot afford downtime. Northhaven’s MS CS systems track, and the chance to work with Engineering faculty on applied ML, is why I am applying from Mumbai.',
    recs: ['Prof. A. Iyer, IIT Bombay', 'Dr. R. Menon, IIT Bombay'],
    family: { name: 'Anil Mehta', relation: 'Father', email: 'anil.mehta@example.in', phone: '+91 22 5551 0900' },
  },
  'st-jordan': {
    school: 'Columbus North High School',
    source: 'Ohio college fair',
    essayTitle: 'Personal statement',
    essay: 'I am a first-generation student who wants to practice nursing in a hospital that still knows its neighborhood. Nightingale is the reason Northhaven is my first choice.',
    recs: ['Ms. Patel, college counselor'],
    family: { name: 'Denise Hale', relation: 'Mother', email: 'dhale@example.com', phone: '+1 614 555 0102' },
  },
  'st-yuki': {
    school: 'Tama Art University',
    source: 'Studio portfolio call',
    essayTitle: 'Artist statement',
    essay: 'My work is about cities that forget their rivers. Iversen’s studio is the room I want to make that work in.',
    recs: ['Prof. Iversen (mentor interest)'],
    family: { name: 'Kenji Tanaka', relation: 'Father', email: 'ktanaka@example.jp', phone: '+81 3 5550 2200' },
  },
  'st-mateo': {
    school: 'UT Austin · B.B.A.',
    source: 'Employer nomination',
    essayTitle: 'Leadership essay',
    essay: 'Three years in Dell ops taught me to run a team through a bad quarter. I want the MBA to do that at a larger scale.',
    recs: ['Director, Dell operations'],
    family: { name: 'Lucia Alvarez', relation: 'Spouse', email: 'lucia.a@example.com', phone: '+1 512 555 0440' },
  },
  'st-chloe': {
    school: 'Portland High School',
    source: 'Common App',
    essayTitle: 'Why Environmental Studies',
    essay: 'I grew up watching the Presumpscot change color after rain. I want the mill-town archive and the river lab, not a generic environmental studies major.',
    recs: ['AP Environmental Science teacher'],
    family: { name: 'Sarah Bennett', relation: 'Mother', email: 'sbennett@example.com', phone: '+1 207 555 0180' },
  },
  'st-daniel': {
    school: 'University of Lagos · B.Eng.',
    source: 'Faculty recruit · NIH R01',
    essayTitle: 'Research statement',
    essay: 'I want to measure how aging vessels forget how to flex. Dr. Park’s lab is already doing that work.',
    recs: ['Dr. Helen Park'],
    family: { name: 'Ada Okeke', relation: 'Sister', email: 'ada.okeke@example.ng', phone: '+234 1 555 0191' },
  },
  'st-sofia': {
    school: 'Luiss University',
    source: 'MS Finance webinar',
    essayTitle: 'Statement of purpose',
    essay: 'CFA L1 is the floor. I want a US MS Finance that still lets me return to European markets if I choose.',
    recs: ['Luiss finance faculty'],
    family: { name: 'Marco Rossi', relation: 'Father', email: 'mrossi@example.it', phone: '+39 06 555 4400' },
  },
  'st-liam': {
    school: 'Somerville High School',
    source: 'northhaven.edu/visit',
    essayTitle: 'Not yet submitted',
    essay: 'Draft: first-gen History — I want the mill-town archive and a campus that answers when you ask for a tour.',
    recs: [],
    family: { name: "Brigid O'Connor", relation: 'Mother', email: 'boconnor@example.com', phone: '+1 617 555 0280' },
  },
  'st-ananya': {
    school: 'St. John’s Medical College',
    source: 'MPH fair · Bengaluru',
    essayTitle: 'Statement of purpose',
    essay: 'I want city-scale epi, not only hospital quality. Northhaven’s practicum desk is the draw.',
    recs: ['MPH faculty, Bengaluru'],
    family: { name: 'Ravi Desai', relation: 'Father', email: 'rdesai@example.in', phone: '+91 80 5550 1100' },
  },
  'st-noah': {
    school: 'University of Washington · B.S. CS',
    source: 'MS CS yield campaign',
    essayTitle: 'Statement of purpose',
    essay: 'I can stay at UW. I am looking at Northhaven because the Dean award and the cohort actually talk to each other.',
    recs: ['UW CSE faculty (2)'],
    family: { name: 'Min Kim', relation: 'Mother', email: 'mkim@example.com', phone: '+1 206 555 0331' },
  },
  'st-amara': {
    school: 'Cheikh Anta Diop University',
    source: 'Global Scholars outreach',
    essayTitle: 'Statement of purpose',
    essay: 'Public health in Dakar taught me what a missing record does to a clinic. I am applying so I can fix that with numbers.',
    recs: ['MPH faculty, Dakar'],
    family: { name: 'Mamadou Diallo', relation: 'Father', email: 'mdiallo@example.sn', phone: '+221 77 555 0100' },
  },
  'st-grace': {
    school: 'Northhaven University · B.A. Environmental Studies',
    source: 'Returning alumni file',
    essayTitle: 'Original first-year statement (2021)',
    essay: 'I came for the river. I am staying in the archive as a young alum so the next class does not have to find it alone.',
    recs: ['ENV faculty'],
    family: { name: 'Paul Whitaker', relation: 'Father', email: 'pwhitaker@example.com', phone: '+1 413 555 0271' },
  },
}

function stageIndex(stage: Stage) {
  return Math.max(0, ORDER.indexOf(stage))
}

function recsDone(s: Student) {
  const recs = s.documents.filter((d) => /rec/i.test(d.kind))
  if (!recs.length) return stageIndex(s.stage) > ORDER.indexOf('applied')
  return recs.every((d) => d.status === 'verified')
}

function evidenceDone(s: Student) {
  if (s.stage === 'enquiry' || s.stage === 'applied') return false
  if (!s.documents.length) return stageIndex(s.stage) > ORDER.indexOf('verifying')
  return s.documents.every((d) => d.status === 'verified')
}

export function applicationFor(s: Student): AdmitApplication {
  const program = PROGRAMS.find((p) => p.id === s.programId)
  const extra = EXTRA[s.id] ?? {
    school: `${s.city} prior school`,
    source: 'Web enquiry',
    essayTitle: 'Statement of purpose',
    essay: `${s.preferred} applied to ${program?.name ?? 'Northhaven'} from ${s.city}.`,
    recs: [],
    family: { name: `${s.name.split(' ')[1] ?? 'Family'}`, relation: 'Parent', email: `family.${s.id}@example.com`, phone: s.phone },
  }
  const submitted = s.stage === 'enquiry' ? null : s.applied
  return {
    submitted,
    source: extra.source,
    legalName: s.name,
    preferred: s.preferred,
    pronouns: s.pronouns,
    email: s.email,
    phone: s.phone,
    address: `${s.city}, ${s.country}`,
    citizenship: s.country,
    residency: s.residency,
    firstGen: s.firstGen,
    incomeBand: s.incomeBand,
    priorSchool: extra.school,
    gpa: s.gpa,
    tests: s.test,
    program: program?.name ?? s.programId,
    college: program?.college ?? '',
    term: s.term,
    essayTitle: extra.essayTitle,
    essay: extra.essay,
    recommenders: extra.recs,
    family: extra.family,
    consent: s.stage !== 'enquiry',
  }
}

export function admitWorkflow(s: Student): AdmitStep[] {
  const idx = stageIndex(s.stage)
  const applied = s.stage !== 'enquiry'
  const evidenceOk = evidenceDone(s)
  const recOk = recsDone(s)
  const onboard = s.onboard
  const stamps = onboard.length ? onboard.filter((t) => t.status === 'done').length / onboard.length : idx >= ORDER.indexOf('enrolled') ? 1 : 0
  const overdue = s.steps.filter((st) => st.status === 'overdue').map((st) => st.label.toLowerCase())

  return FLOW.map((step) => {
    let status: AdmitStepStatus = 'waiting'
    let studentCopy = 'Not started yet — we will show this the moment it is your turn.'

    if (step.id === 'enquiry') {
      status = 'complete'
      studentCopy = `Enquiry from ${EXTRA[s.id]?.source ?? 'campus'} is on file.`
    } else if (step.id === 'apply') {
      if (applied) {
        status = 'complete'
        studentCopy = `You submitted on ${s.applied}. Open this step to read the record you entered.`
      } else {
        status = 'active'
        studentCopy = 'Your application is still a draft. Submit it to start verification.'
      }
    } else if (step.id === 'evidence') {
      if (evidenceOk) {
        status = 'complete'
        studentCopy = 'Required transcripts and tests are verified.'
      } else if (applied) {
        status = overdue.some((l) => l.includes('evidence') || l.includes('verif')) || s.documents.some((d) => d.status !== 'verified') ? (s.documents.some((d) => d.status === 'expired' || d.status === 'missing') ? 'blocked' : 'overdue') : 'active'
        const open = s.documents.filter((d) => d.status !== 'verified')
        studentCopy = open.length ? `Still needed: ${open.map((d) => d.kind).join(', ')}.` : 'Admissions is reviewing what you sent.'
      }
    } else if (step.id === 'recs') {
      if (recOk && applied) {
        status = 'complete'
        studentCopy = EXTRA[s.id]?.recs.length ? `On file: ${EXTRA[s.id].recs.join('; ')}.` : 'Recommendations are complete.'
      } else if (applied) {
        status = 'active'
        studentCopy = 'Waiting on a recommender. You do not need to re-enter the form.'
      }
    } else if (step.id === 'dept') {
      if (idx > ORDER.indexOf('departmental') || s.stage === 'alumni') {
        status = 'complete'
        studentCopy = 'Faculty recommended admit. You are past this gate.'
      } else if (idx === ORDER.indexOf('departmental')) {
        status = overdue.some((l) => l.includes('department')) ? 'overdue' : 'active'
        studentCopy = 'Your file is with the department. This is a staff step — you already submitted your application.'
      }
    } else if (step.id === 'aid') {
      if (idx > ORDER.indexOf('scholarship') || s.awards.some((a) => a.status === 'approved')) {
        status = s.awards.length && s.awards.every((a) => a.status === 'approved' || a.status === 'declined') ? 'complete' : idx > ORDER.indexOf('scholarship') ? 'complete' : 'active'
        studentCopy = s.awards.length ? 'Aid lines are on your Aid tab. This is not the final bill until a human signs.' : 'No aid package on this file.'
      } else if (idx >= ORDER.indexOf('scholarship')) {
        status = overdue.some((l) => l.includes('scholarship')) ? 'overdue' : 'active'
        studentCopy = 'Scholarship is being packaged from the application you submitted — GPA, need, and program.'
      }
    } else if (step.id === 'offer') {
      if (idx > ORDER.indexOf('offer') || ['deposit', 'enrolled', 'onboarding', 'alumni'].includes(s.stage)) {
        status = 'complete'
        studentCopy = 'Your offer letter is on this record. Pay the deposit when you are ready.'
      } else if (s.stage === 'offer') {
        status = 'active'
        studentCopy = 'Offer is out. Open this step for the decision in plain language.'
      }
    } else if (step.id === 'fees') {
      if (s.depositPaid || idx > ORDER.indexOf('deposit')) {
        status = 'complete'
        studentCopy = `Deposit ${s.depositPaid ? 'posted' : 'waived'}. Seat is held.`
      } else if (['offer', 'deposit', 'scholarship'].includes(s.stage)) {
        status = s.stage === 'deposit' || s.stage === 'offer' ? 'active' : 'waiting'
        studentCopy = `Enrollment deposit ${s.deposit} USD holds the seat. Pay from Tasks.`
      }
    } else if (step.id === 'enroll') {
      if (idx >= ORDER.indexOf('enrolled')) {
        status = 'complete'
        studentCopy = 'You are on the Fall 2026 census.'
      }
    } else if (step.id === 'arrive') {
      if (s.stage === 'alumni' || (onboard.length && stamps === 1)) {
        status = 'complete'
        studentCopy = s.stage === 'alumni' ? 'Admission journey complete — 100%.' : 'All arrival stamps are done.'
      } else if (idx >= ORDER.indexOf('enrolled')) {
        status = 'active'
        studentCopy = onboard.length ? `${onboard.filter((t) => t.status === 'done').length} of ${onboard.length} stamps done.` : 'Welcome stamps open after deposit.'
      }
    }

    return { id: step.id, label: step.label, hint: step.hint, owner: step.owner, status, studentCopy }
  })
}

export function admitPercent(s: Student) {
  if (s.stage === 'alumni') return 100
  const steps = admitWorkflow(s)
  const unit = 100 / steps.length
  let pct = 0
  for (const step of steps) {
    if (step.status === 'complete') pct += unit
    else if (step.status === 'active' || step.status === 'overdue' || step.status === 'blocked') pct += unit * 0.45
  }
  if (s.onboard.length && s.stage === 'onboarding') {
    const arrive = steps.find((x) => x.id === 'arrive')
    if (arrive && arrive.status !== 'complete') {
      pct -= unit * 0.45
      pct += unit * (s.onboard.filter((t) => t.status === 'done').length / s.onboard.length)
    }
  }
  return Math.max(4, Math.min(100, Math.round(pct)))
}

export function familyStatus(s: Student) {
  const pct = admitPercent(s)
  if (pct >= 100) return `${s.preferred} has finished the admission journey.`
  if (s.nextActor === 'student') return `${s.preferred} has a next step: ${s.nextAction}`
  return `Northhaven is working this file. ${s.preferred} does not need to re-enter the application.`
}
