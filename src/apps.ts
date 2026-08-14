import {
  GraduationCap,
  Radar,
  Landmark,
  TowerControl,
  Wallet,
  Stamp,
  Network,
  FlaskConical,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react'

export type AppDef = {
  id: string
  path: string
  label: string
  kicker: string
  blurb: string
  icon: LucideIcon
  accent: string
  metricKey: 'blocked' | 'aid' | 'enroll' | 'cash' | 'ready' | 'health' | 'grants' | 'students'
}

export const APPS: AppDef[] = [
  {
    id: 'student',
    path: '/student',
    label: 'Student Pulse',
    kicker: 'Mobile',
    blurb: 'Status, aid, arrival, and a campus social feed from student groups.',
    icon: GraduationCap,
    accent: '#1557e0',
    metricKey: 'students',
  },
  {
    id: 'admissions',
    path: '/admissions',
    label: 'Admissions Radar',
    kicker: 'Workbench',
    blurb: 'Who is stuck, who owns it, and which SLA is already late.',
    icon: Radar,
    accent: '#123a8c',
    metricKey: 'blocked',
  },
  {
    id: 'scholarship',
    path: '/scholarship',
    label: 'Aid Atelier',
    kicker: 'Awards',
    blurb: 'Package awards against live fund remaining, with a human sign-off.',
    icon: Landmark,
    accent: '#1d4ed8',
    metricKey: 'aid',
  },
  {
    id: 'tower',
    path: '/tower',
    label: 'Control Tower',
    kicker: 'Leaders',
    blurb: 'Enrollment, cash, and risk for the president’s cabinet.',
    icon: TowerControl,
    accent: '#0b1f4d',
    metricKey: 'enroll',
  },
  {
    id: 'finance',
    path: '/finance',
    label: 'Treasury Pulse',
    kicker: 'CFO',
    blurb: 'Collections lag, net tuition, and award drag on August cash.',
    icon: Wallet,
    accent: '#1557e0',
    metricKey: 'cash',
  },
  {
    id: 'onboarding',
    path: '/onboarding',
    label: 'Welcome Passport',
    kicker: 'Arrival',
    blurb: 'ID, housing, LMS, and health — one arrival picture.',
    icon: Stamp,
    accent: '#123a8c',
    metricKey: 'ready',
  },
  {
    id: 'systems',
    path: '/systems',
    label: 'Constellation',
    kicker: 'CIO',
    blurb: 'Banner, Salesforce, Workday, and Starfish — talking, with lineage.',
    icon: Network,
    accent: '#1557e0',
    metricKey: 'health',
  },
  {
    id: 'grants',
    path: '/grants',
    label: 'Research Atlas',
    kicker: 'Phase II',
    blurb: 'Grant spend, compliance, and the paper trail for research.',
    icon: FlaskConical,
    accent: '#1f7a72',
    metricKey: 'grants',
  },
]

export const HOME: AppDef = {
  id: 'mosaic',
  path: '/',
  label: 'Campus Mosaic',
  kicker: 'OS',
  blurb: 'One window into every campus system.',
  icon: LayoutGrid,
  accent: '#0b1f4d',
  metricKey: 'enroll',
}
