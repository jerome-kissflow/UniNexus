import type { Student } from './data/types'
import type { State } from './state/store'
import { PROGRAMS } from './data/seed'
import { usd, usdK } from './lib/format'

export type InsightModel = {
  title: string
  body: string
  action?: string
  actionKey?: string
  confidence: string
  kind: 'risk' | 'opportunity' | 'watch'
}

export function yieldChance(s: Student) {
  let p = 0.38
  if (s.depositPaid) return 0.99
  if (['enrolled', 'onboarding'].includes(s.stage)) return 0.97
  if (s.stage === 'offer') p = 0.72
  if (s.stage === 'scholarship') p = 0.58
  if (s.stage === 'departmental') p = 0.44
  if (s.residency === 'international') p -= 0.07
  if (s.risk === 'blocked') p -= 0.2
  if (s.risk === 'watch') p -= 0.08
  if (s.awards.some((a) => a.status === 'approved')) p += 0.14
  if (s.gpa >= 3.8) p += 0.05
  return Math.max(0.08, Math.min(0.99, p))
}

export function netBalance(s: Student) {
  const aid = s.awards.filter((a) => a.status === 'approved').reduce((n, a) => n + a.approved, 0)
  return Math.max(0, s.tuition - s.paid - aid)
}

export function insightFor(app: string, state: State, student: Student): InsightModel {
  const live = state.students.filter((s) => s.stage !== 'alumni')
  const blocked = live.filter((s) => s.risk === 'blocked')
  const intlBlocked = blocked.filter((s) => s.residency === 'international')
  const noDeposit = live.filter((s) => !s.depositPaid && ['offer', 'scholarship', 'deposit'].includes(s.stage))
  const wes = student.documents.find((d) => d.status !== 'verified')
  const pendingAid = live.flatMap((s) => s.awards.map((a) => ({ s, a }))).filter((x) => x.a.status !== 'approved' && x.a.status !== 'declined')
  const lag = noDeposit.reduce((n, s) => n + s.deposit, 0)
  const weak = state.connectors.filter((c) => c.health < 96)
  const dueGrants = state.grants.filter((g) => g.compliance !== 'current')
  const arrivals = live.filter((s) => s.onboard.length > 0 || s.depositPaid)
  const housingHold = arrivals.filter((s) => s.onboard.some((t) => t.system === 'starrez' && t.status !== 'done'))
  const program = PROGRAMS.find((p) => p.id === student.programId)

  switch (app) {
    case 'student':
      if (wes) {
        return {
          kind: 'risk',
          title: 'Next-best action',
          body: `${wes.kind} is the only item blocking ${program?.name ?? 'your program'}. Electronic copies usually clear departmental review within two business days.`,
          action: `Mark ${wes.kind} ready`,
          actionKey: 'upload',
          confidence: '82% likely to unblock this week',
        }
      }
      if (!student.depositPaid && ['offer', 'scholarship', 'deposit'].includes(student.stage)) {
        return {
          kind: 'opportunity',
          title: 'Seat hold',
          body: `Paying the ${usd(student.deposit)} deposit locks your Fall 2026 seat and starts housing + orientation stamps the same hour.`,
          action: 'Pay deposit now',
          actionKey: 'deposit',
          confidence: 'Yield model 71% after deposit',
        }
      }
      return {
        kind: 'opportunity',
        title: 'You are on track',
        body: student.appointment
          ? `${student.appointment.kind} is booked ${student.appointment.at}. Bring a photo ID.`
          : 'Book a 20-minute counselor slot if anything on your checklist is unclear — families can sit in.',
        action: student.appointment ? undefined : 'Book counselor',
        actionKey: 'book',
        confidence: 'CSAT 91 after a booked slot',
      }
    case 'admissions':
      return {
        kind: intlBlocked.length ? 'risk' : 'watch',
        title: 'Yield at risk',
        body: `${intlBlocked.length} international files are blocked. Clearing ${student.preferred} (${Math.round(yieldChance(student) * 100)}% yield) would pull Engineering closer to target.`,
        action: wes ? 'Verify next document' : 'Escalate dean',
        actionKey: wes ? 'upload' : 'escalate',
        confidence: `${blocked.length} blocked · ${live.length} in pipeline`,
      }
    case 'scholarship':
      return {
        kind: pendingAid.length ? 'opportunity' : 'watch',
        title: 'Packaging insight',
        body: pendingAid.length
          ? `Signing ${usd(pendingAid[0].a.recommended)} for ${pendingAid[0].s.preferred} posts to Workday and lifts predicted yield by ~12 points.`
          : 'All open packages are posted. Watch remaining fund capacity before census.',
        action: pendingAid.length ? `Approve ${pendingAid[0].s.preferred}` : 'Send award letter',
        actionKey: pendingAid.length ? 'approve' : 'letter',
        confidence: `${pendingAid.length} unsigned · ${usdK(state.funds.reduce((n, f) => n + f.remaining, 0))} left`,
      }
    case 'tower':
      return {
        kind: blocked.length ? 'risk' : 'opportunity',
        title: 'Census forecast',
        body: `Fall 2026 lands at ~94% of target if ${Math.min(8, blocked.length || 8)} blocked files clear this week. International yield is the swing vote.`,
        action: blocked[0] ? `Open ${blocked[0].preferred}` : 'Copy cabinet brief',
        actionKey: blocked[0] ? 'focus' : 'brief',
        confidence: 'Model trained on last 4 cycles',
      }
    case 'finance':
      return {
        kind: lag ? 'risk' : 'opportunity',
        title: 'Cash insight',
        body: lag
          ? `August lag closes by ~${usdK(lag)} if ${noDeposit.length} deposits post by Friday. A 4-month plan on ${student.preferred} also reduces write-off risk.`
          : 'Collections are current. Offer payment plans on remaining tuition to protect September cash.',
        action: noDeposit[0] ? `Take ${noDeposit[0].preferred} deposit` : 'Set payment plan',
        actionKey: noDeposit[0] ? 'deposit-other' : 'plan',
        confidence: `${noDeposit.length} deposits outstanding`,
      }
    case 'onboarding':
      return {
        kind: housingHold.length ? 'watch' : 'opportunity',
        title: 'Arrival insight',
        body: housingHold.length
          ? `${housingHold[0].preferred} is one stamp from a room. Immunization or StarRez assignment unblocks move-in.`
          : 'Passports are clear. Reserve move-in windows so Orientation can staff the doors.',
        action: housingHold[0] ? `Stamp ${housingHold[0].preferred}` : 'Reserve move-in',
        actionKey: housingHold[0] ? 'stamp' : 'movein',
        confidence: `${housingHold.length} housing holds`,
      }
    case 'systems': {
      const worst = [...state.connectors].sort((a, b) => a.health - b.health)[0]
      return {
        kind: weak.length ? 'risk' : 'watch',
        title: 'Integration insight',
        body: weak.length
          ? `${worst.vendor} health ${worst.health}% is delaying ${worst.id === 'starrez' ? 'housing stamps' : 'canonical writes'}. A retry usually restores lineage in under a minute.`
          : 'All connectors are inside SLA. Last incident was a Salesforce enquiry lag — now clear.',
        action: `Heal ${worst.vendor}`,
        actionKey: 'heal',
        confidence: `${weak.length} below 96%`,
      }
    }
    case 'grants': {
      const g = state.grants[0]
      const burn = g.spent / g.amount
      const monthsLeft = 8
      return {
        kind: burn > 0.55 || dueGrants.length ? 'risk' : 'watch',
        title: 'Burn-rate insight',
        body: `${g.title} is ${Math.round(burn * 100)}% drawn. At the current RA burn you will hit 80% about ${Math.max(2, Math.round((0.8 - burn) * monthsLeft))} months early — flag effort certification now.`,
        action: dueGrants[0] ? 'Submit RPPR' : 'Log $25k spend',
        actionKey: dueGrants[0] ? 'report' : 'spend',
        confidence: `${dueGrants.length} compliance flags`,
      }
    }
    default:
      return {
        kind: 'watch',
        title: 'UniNexus insight',
        body: 'Canonical record is live across the suite.',
        confidence: 'Connected',
      }
  }
}

export function cabinetBrief(state: State) {
  const deposited = state.students.filter((s) => s.depositPaid).length
  const blocked = state.students.filter((s) => s.risk === 'blocked').length
  const aid = state.funds.reduce((n, f) => n + f.committed, 0)
  return `Northhaven Fall 2026 — ${deposited} deposits in mosaic, ${blocked} blocked files, aid committed ${usdK(aid)}. Clearing international evidence this week is the highest-leverage move before census.`
}
