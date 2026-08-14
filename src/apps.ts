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
    accent: '#0f766e',
    metricKey: 'students',
  },
  {
    id: 'admissions',
    path: '/admissions',
    label: 'Admissions Radar',
    kicker: 'Workbench',
    blurb: 'Who is stuck, who owns it, and which SLA is already late.',
    icon: Radar,
    accent: '#c2413b',
    metricKey: 'blocked',
  },
  {
    id: 'scholarship',
    path: '/scholarship',
    label: 'Aid Atelier',
    kicker: 'Awards',
    blurb: 'Package awards against live fund remaining, with a human sign-off.',
    icon: Landmark,
    accent: '#b45309',
    metricKey: 'aid',
  },
  {
    id: 'tower',
    path: '/tower',
    label: 'Control Tower',
    kicker: 'Leaders',
    blurb: 'Enrollment, cash, and risk for the president’s cabinet.',
    icon: TowerControl,
    accent: '#4f46e5',
    metricKey: 'enroll',
  },
  {
    id: 'finance',
    path: '/finance',
    label: 'Treasury Pulse',
    kicker: 'CFO',
    blurb: 'Collections lag, net tuition, and award drag on August cash.',
    icon: Wallet,
    accent: '#047857',
    metricKey: 'cash',
  },
  {
    id: 'onboarding',
    path: '/onboarding',
    label: 'Welcome Passport',
    kicker: 'Arrival',
    blurb: 'ID, housing, LMS, and health — one arrival picture.',
    icon: Stamp,
    accent: '#db2777',
    metricKey: 'ready',
  },
  {
    id: 'systems',
    path: '/systems',
    label: 'Constellation',
    kicker: 'CIO',
    blurb: 'Banner, Salesforce, Workday, and Starfish — talking, with lineage.',
    icon: Network,
    accent: '#7c3aed',
    metricKey: 'health',
  },
  {
    id: 'grants',
    path: '/grants',
    label: 'Research Atlas',
    kicker: 'Phase II',
    blurb: 'Grant spend, compliance, and the paper trail for research.',
    icon: FlaskConical,
    accent: '#0e7490',
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
