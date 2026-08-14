export type Stage =
  | 'enquiry'
  | 'applied'
  | 'verifying'
  | 'departmental'
  | 'scholarship'
  | 'offer'
  | 'deposit'
  | 'enrolled'
  | 'onboarding'
  | 'alumni'

export type Risk = 'clear' | 'watch' | 'blocked'
export type DocStatus = 'missing' | 'pending' | 'expired' | 'verified'
export type AwardStatus = 'eligible' | 'recommended' | 'pending-approval' | 'approved' | 'declined'
export type TaskStatus = 'open' | 'done' | 'blocked'
export type Residency = 'domestic' | 'international'

export type SourceSystem =
  | 'salesforce'
  | 'ellucian'
  | 'workday'
  | 'starfish'
  | 'canvas'
  | 'anthology'
  | 'starrez'
  | 'campusflow'

export type Person = {
  id: string
  name: string
  role: string
  unit: string
  initials: string
}

export type Document = {
  id: string
  kind: string
  status: DocStatus
  source: SourceSystem
  sourceId: string
  updated: string
  owner: string
  note: string
}

export type WorkflowStep = {
  id: string
  label: string
  owner: string
  slaDays: number
  opened: string
  due: string
  status: 'complete' | 'active' | 'waiting' | 'overdue'
}

export type Award = {
  id: string
  fundId: string
  studentId: string
  recommended: number
  approved: number
  status: AwardStatus
  rationale: string[]
  exceptions: string[]
  reviewer: string
}

export type OnboardTask = {
  id: string
  label: string
  system: SourceSystem
  status: TaskStatus
  detail: string
}

export type Student = {
  id: string
  name: string
  preferred: string
  pronouns: string
  email: string
  phone: string
  city: string
  country: string
  countryCode: string
  residency: Residency
  firstGen: boolean
  incomeBand: 'high' | 'upper-middle' | 'middle' | 'low-middle' | 'low'
  gpa: number
  test: string
  programId: string
  term: string
  stage: Stage
  risk: Risk
  riskWhy: string[]
  owner: string
  nextAction: string
  nextActor: 'student' | 'staff'
  due: string
  applied: string
  tuition: number
  deposit: number
  depositPaid: boolean
  paid: number
  csat: number
  documents: Document[]
  steps: WorkflowStep[]
  awards: Award[]
  onboard: OnboardTask[]
  timeline: { at: string; title: string; detail: string; source: SourceSystem }[]
  canonicalId: string
  notes?: { at: string; actor: string; text: string }[]
  messages?: { id: string; at: string; from: string; text: string; read: boolean }[]
  housing?: string
  appointment?: { kind: string; at: string; location: string }
  paymentPlan?: number
  moveIn?: string
  roommate?: string
}

export type Program = {
  id: string
  name: string
  college: string
  degree: string
  seats: number
  yieldTarget: number
  tuition: number
}

export type Fund = {
  id: string
  name: string
  kind: 'merit' | 'need' | 'program' | 'donor' | 'global'
  budget: number
  committed: number
  remaining: number
  donor?: string
  rule: string
}

export type Grant = {
  id: string
  title: string
  sponsor: string
  pi: string
  college: string
  amount: number
  spent: number
  start: string
  end: string
  compliance: 'current' | 'due' | 'overdue'
  paperTrail: string
}

export type Connector = {
  id: SourceSystem
  product: string
  vendor: string
  domain: string
  health: number
  latencyMs: number
  lastSync: string
  direction: string
  records: number
}

export type PulseEvent = {
  id: string
  at: string
  title: string
  detail: string
  studentId?: string
  app: string
  source: SourceSystem
}

export type CampusGroupKind = 'program' | 'housing' | 'identity' | 'club' | 'campus'

export type CampusGroup = {
  id: string
  name: string
  kind: CampusGroupKind
  blurb: string
  members: string[]
}

export type CampusComment = {
  id: string
  authorId: string
  author: string
  at: string
  text: string
}

export type CampusPost = {
  id: string
  groupId: string
  authorId: string
  author: string
  at: string
  body: string
  likes: string[]
  comments: CampusComment[]
}
