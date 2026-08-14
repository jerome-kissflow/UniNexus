import { useState } from 'react'
import { whenFull } from '../lib/format'
import { useCampus } from '../state/store'
import { AppFrame, Filters, Glance, Search } from '../ui'
import { ROLES } from '../roles'
import type { SourceSystem } from '../data/types'
import { DelightToast, useDelight } from '../chrome'

const POS: Record<string, { x: string; y: string }> = {
  salesforce: { x: '18%', y: '28%' },
  ellucian: { x: '50%', y: '18%' },
  workday: { x: '82%', y: '30%' },
  starfish: { x: '22%', y: '68%' },
  canvas: { x: '48%', y: '78%' },
  anthology: { x: '78%', y: '70%' },
  starrez: { x: '64%', y: '48%' },
  campusflow: { x: '50%', y: '48%' },
}

export function Systems() {
  const { student, state, dispatch } = useCampus()
  const [role, setRole] = useState('cio')
  const [sel, setSel] = useState<SourceSystem>('ellucian')
  const [q, setQ] = useState('')
  const [src, setSrc] = useState('all')
  const c = state.connectors.find((x) => x.id === sel) ?? state.connectors[0]
  const { msg, cheer, clear } = useDelight()
  const lineage = [
    { field: 'Person', source: 'salesforce', id: `SF-${student.id.slice(3).toUpperCase()}` },
    { field: 'Application', source: 'ellucian', id: student.canonicalId.replace('CF', 'BNR') },
    { field: 'Award', source: 'workday', id: `WD-AWD-${student.canonicalId.slice(-4)}` },
    { field: 'Alert', source: 'starfish', id: `SFISH-${student.canonicalId.slice(-4)}` },
  ]
  const events = state.events.filter((e) => {
    if (src !== 'all' && e.source !== src) return false
    if (q && !`${e.title} ${e.detail}`.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <AppFrame kicker="Constellation" title="Systems of record" roles={ROLES.systems} role={role} onRole={setRole}>
      <DelightToast msg={msg} onClose={clear} />
      {role === 'cio' && (
        <>
          <Glance
            items={[
              { k: 'Systems', v: String(state.connectors.length) },
              { k: 'Mean health', v: `${Math.round(state.connectors.reduce((n, c) => n + c.health, 0) / state.connectors.length)}%` },
              { k: 'Latency', v: `${Math.round(state.connectors.reduce((n, c) => n + c.latencyMs, 0) / state.connectors.length)} ms` },
              { k: 'Selected', v: c.vendor },
            ]}
          />
          <div className="constellation">
            <svg className="geo" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, height: '100%' }}>
              <line x1="18" y1="28" x2="50" y2="48" stroke="rgba(142,185,200,0.25)" />
              <line x1="50" y1="18" x2="50" y2="48" stroke="rgba(142,185,200,0.25)" />
              <line x1="82" y1="30" x2="50" y2="48" stroke="rgba(142,185,200,0.25)" />
              <line x1="22" y1="68" x2="50" y2="48" stroke="rgba(142,185,200,0.25)" />
              <line x1="48" y1="78" x2="50" y2="48" stroke="rgba(142,185,200,0.25)" />
              <line x1="78" y1="70" x2="50" y2="48" stroke="rgba(142,185,200,0.25)" />
              <line x1="64" y1="48" x2="50" y2="48" stroke="rgba(142,185,200,0.25)" />
            </svg>
            {state.connectors.map((n) => (
              <button key={n.id} type="button" className="node" style={{ left: POS[n.id].x, top: POS[n.id].y }} onClick={() => setSel(n.id)}>
                <div className="orb-n" style={{ background: n.id === sel ? '#1557e0' : n.health < 96 ? '#c2413b' : '#123a8c' }} />
                <b>{n.vendor}</b>
                <small>{n.product}</small>
              </button>
            ))}
          </div>
          <div className="panel" style={{ marginTop: 14 }}>
            <h3>
              {c.vendor} · {c.product}
            </h3>
            <p className="meta">
              {c.domain} · {c.health}% · {c.latencyMs} ms · last {whenFull(c.lastSync)}
            </p>
            <button type="button" className="btn" onClick={() => dispatch({ type: 'sync-connector', id: c.id })}>
              Sync now
            </button>
            <button
              type="button"
              className="btn alt"
              style={{ marginLeft: 8 }}
              onClick={() => {
                dispatch({ type: 'heal-connector', id: c.id })
                cheer('Retry succeeded', `${c.records.toLocaleString('en-US')} records reconciled.`)
              }}
            >
              Heal / retry
            </button>
          </div>
        </>
      )}

      {role === 'analyst' && (
        <div>
          <Glance
            items={[
              { k: 'Connectors', v: String(state.connectors.length) },
              { k: 'Records', v: state.connectors.reduce((n, c) => n + c.records, 0).toLocaleString('en-US') },
              { k: 'Person', v: student.preferred },
            ]}
          />
          <div className="split">
          <div className="panel">
            <h3>Connectors</h3>
            {state.connectors.map((n) => (
              <div key={n.id} className="rule" style={{ marginBottom: 8 }}>
                <b>{n.vendor}</b>
                <div className="meta">
                  {n.records.toLocaleString('en-US')} records · {n.direction}
                </div>
                <button type="button" className="btn alt" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'sync-connector', id: n.id })}>
                  Pull {n.id}
                </button>
              </div>
            ))}
          </div>
          <div className="panel">
            <h3>Lineage · {student.name}</h3>
            {lineage.map((l) => (
              <div key={l.field} className="rule" style={{ marginBottom: 8 }}>
                <b>{l.field}</b>
                <div className="mono">
                  {l.source} · {l.id}
                </div>
              </div>
            ))}
            <p className="mono" style={{ marginTop: 10 }}>
              GET /v1/{sel}/persons/{student.canonicalId}
            </p>
          </div>
          </div>
        </div>
      )}

      {role === 'auditor' && (
        <div>
          <Glance
            items={[
              { k: 'Events', v: String(events.length) },
              { k: 'Sources', v: String(state.connectors.length) },
              { k: 'Filter', v: src === 'all' ? 'All' : src },
            ]}
          />
          <div className="toolbar">
            <Search value={q} onChange={setQ} placeholder="Search events" />
            <Filters
              value={src}
              onChange={setSrc}
              options={[{ id: 'all', label: 'All sources' }, ...state.connectors.map((c) => ({ id: c.id, label: c.vendor }))]}
            />
          </div>
          <ol className="tape">
            {events.map((e) => (
              <li key={e.id}>
                <time>{whenFull(e.at)}</time>
                <div>
                  <b>{e.title}</b>
                  <div className="meta">
                    {e.source} · {e.detail}
                    {e.studentId && (
                      <button type="button" className="btn alt" style={{ marginLeft: 8 }} onClick={() => dispatch({ type: 'focus', id: e.studentId! })}>
                        Open person
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {role === 'security' && (
        <div>
          <Glance
            items={[
              { k: 'Mean health', v: `${Math.round(state.connectors.reduce((n, c) => n + c.health, 0) / state.connectors.length)}%` },
              { k: 'At risk', v: String(state.connectors.filter((c) => c.health < 96).length), tone: 'var(--coral)' },
              { k: 'Max latency', v: `${Math.max(...state.connectors.map((c) => c.latencyMs))} ms` },
            ]}
          />
          <table className="table">
            <thead>
              <tr>
                <th>System</th>
                <th>Health</th>
                <th>Latency</th>
                <th>Last sync</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {state.connectors.map((n) => (
                <tr key={n.id} className={n.id === sel ? 'on' : ''} onClick={() => setSel(n.id)}>
                  <td>
                    {n.vendor} · {n.product}
                  </td>
                  <td>{n.health}%</td>
                  <td>{n.latencyMs} ms</td>
                  <td>{whenFull(n.lastSync)}</td>
                  <td>
                    <button type="button" className="btn" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'sync-connector', id: n.id }) }}>
                      Sync
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {role === 'steward' && (
        <div>
          <Glance
            items={[
              { k: 'Canonical person', v: student.canonicalId },
              { k: 'Fields mapped', v: String(lineage.length) },
              { k: 'Events', v: String(state.events.length) },
              { k: 'Thin files', v: String(state.students.filter((s) => s.documents.length < 2 || s.timeline.length < 2).length) },
            ]}
          />
          <div className="split">
            <table className="table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Source</th>
                  <th>Source id</th>
                </tr>
              </thead>
              <tbody>
                {lineage.map((l) => (
                  <tr key={l.field}>
                    <td>{l.field}</td>
                    <td>{l.source}</td>
                    <td className="mono">{l.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="panel">
              <h3>Quality queue</h3>
              {state.students
                .map((s) => ({
                  s,
                  issues: [
                    s.documents.length < 2 ? 'sparse evidence' : '',
                    s.timeline.length < 2 ? 'thin timeline' : '',
                    !(s.messages ?? []).length ? 'no inbox' : '',
                    s.email.includes('outlook.com') ? 'personal email' : '',
                  ].filter(Boolean),
                }))
                .filter((row) => row.issues.length)
                .map(({ s, issues }) => (
                  <div key={s.id} className="rule" style={{ marginBottom: 10 }}>
                    <b>{s.name}</b>
                    <div className="meta">{issues.join(' · ')}</div>
                    <button type="button" className="btn alt" style={{ marginTop: 6 }} onClick={() => dispatch({ type: 'focus', id: s.id })}>
                      Open person
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </AppFrame>
  )
}
