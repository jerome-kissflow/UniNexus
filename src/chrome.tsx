import { useCallback, useState, type ReactNode } from 'react'
import type { InsightModel } from './insights'

export function Insight({
  model,
  onAction,
}: {
  model: InsightModel
  onAction?: () => void
}) {
  return (
    <aside className={`insight ${model.kind}`} aria-label="AI insight">
      <div className="insight-rail">
        <span className="insight-ai">AI</span>
      </div>
      <div className="insight-body">
        <div className="insight-top">
          <b>{model.title}</b>
          <small>{model.confidence}</small>
        </div>
        <p>{model.body}</p>
        {model.action && onAction && (
          <button type="button" className="btn" onClick={onAction}>
            {model.action}
          </button>
        )}
      </div>
    </aside>
  )
}

export function useDelight() {
  const [msg, setMsg] = useState<{ title: string; text: string } | null>(null)
  const cheer = useCallback((title: string, text: string) => {
    setMsg({ title, text })
    window.setTimeout(() => setMsg(null), 4200)
  }, [])
  return { msg, cheer, clear: () => setMsg(null) }
}

export function DelightToast({
  msg,
  onClose,
}: {
  msg: { title: string; text: string } | null
  onClose: () => void
}) {
  if (!msg) return null
  return (
    <div className="delight" role="status">
      <div>
        <b>{msg.title}</b>
        <p>{msg.text}</p>
      </div>
      <button type="button" className="btn alt" onClick={onClose}>
        Close
      </button>
    </div>
  )
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="meta">{children}</p>
}
