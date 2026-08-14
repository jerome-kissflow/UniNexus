export type Role = {
  id: string
  name: string
  title: string
  initials: string
}

export const ROLES = {
  student: [
    { id: 'applicant', name: 'Priya Mehta', title: 'Applicant', initials: 'PM' },
    { id: 'coach', name: 'Nina Alvarez', title: 'Success coach', initials: 'NA' },
    { id: 'family', name: 'Mehta family', title: 'Family', initials: 'MF' },
    { id: 'iso', name: 'Intl. Student Office', title: 'Visa advisor', initials: 'ISO' },
    { id: 'recruiter', name: 'Elena Voss', title: 'Recruiter', initials: 'EV' },
  ],
  admissions: [
    { id: 'officer', name: 'Elena Voss', title: 'Admissions officer', initials: 'EV' },
    { id: 'dean', name: 'Dr. Helen Park', title: 'Dean, Engineering', initials: 'HP' },
    { id: 'provost', name: 'Dr. Miriam Cole', title: 'Provost', initials: 'MC' },
    { id: 'iso', name: 'Priya Shah', title: 'Intl. admissions', initials: 'PS' },
    { id: 'faculty', name: 'Program faculty', title: 'Faculty reviewer', initials: 'PF' },
  ],
  scholarship: [
    { id: 'director', name: 'Marcus Webb', title: 'Scholarship director', initials: 'MW' },
    { id: 'cfo', name: 'Diane Okonkwo', title: 'CFO', initials: 'DO' },
    { id: 'student', name: 'Priya Mehta', title: 'Applicant view', initials: 'PM' },
    { id: 'counselor', name: 'Aid counselor', title: 'Packaging', initials: 'AC' },
    { id: 'donor', name: 'Alumni council', title: 'Donor relations', initials: 'AL' },
  ],
  tower: [
    { id: 'provost', name: 'Dr. Miriam Cole', title: 'Provost', initials: 'MC' },
    { id: 'cfo', name: 'Diane Okonkwo', title: 'CFO', initials: 'DO' },
    { id: 'cio', name: 'Raj Patel', title: 'CIO', initials: 'RP' },
    { id: 'admit', name: 'Elena Voss', title: 'Admissions lead', initials: 'EV' },
    { id: 'registrar', name: 'Registrar', title: 'Census', initials: 'RG' },
    { id: 'success', name: 'Nina Alvarez', title: 'Student success', initials: 'NA' },
  ],
  finance: [
    { id: 'cfo', name: 'Diane Okonkwo', title: 'CFO', initials: 'DO' },
    { id: 'controller', name: 'Treasury ops', title: 'Controller', initials: 'TO' },
    { id: 'aid', name: 'Marcus Webb', title: 'Aid liaison', initials: 'MW' },
    { id: 'bursar', name: 'Bursar', title: 'Student accounts', initials: 'BU' },
    { id: 'cashier', name: 'Cashier', title: 'Window', initials: 'CA' },
  ],
  onboarding: [
    { id: 'coach', name: 'Nina Alvarez', title: 'Success coach', initials: 'NA' },
    { id: 'housing', name: 'Residence Life', title: 'Housing', initials: 'RL' },
    { id: 'student', name: 'Chloe Bennett', title: 'Arriving student', initials: 'CB' },
    { id: 'health', name: 'Student Health', title: 'Immunization', initials: 'SH' },
    { id: 'orientation', name: 'Orientation', title: 'Welcome week', initials: 'OR' },
  ],
  systems: [
    { id: 'cio', name: 'Raj Patel', title: 'CIO', initials: 'RP' },
    { id: 'analyst', name: 'Integration desk', title: 'Analyst', initials: 'ID' },
    { id: 'auditor', name: 'Internal audit', title: 'Auditor', initials: 'IA' },
    { id: 'security', name: 'InfoSec', title: 'Security', initials: 'IS' },
    { id: 'steward', name: 'Data steward', title: 'Quality', initials: 'DS' },
  ],
  grants: [
    { id: 'pi', name: 'Dr. Helen Park', title: 'Principal investigator', initials: 'HP' },
    { id: 'admin', name: 'Sponsored research', title: 'Research admin', initials: 'SR' },
    { id: 'provost', name: 'Dr. Miriam Cole', title: 'Provost', initials: 'MC' },
    { id: 'compliance', name: 'Compliance', title: 'Paper trail', initials: 'CO' },
    { id: 'ra', name: 'Daniel Okeke', title: 'Research assistant', initials: 'DO' },
  ],
} as const satisfies Record<string, Role[]>
