import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { badgeById } from '../lib/badges'
import { play } from '../lib/sound'
import { dismissBadgeToast, useAppData, useBadgeToasts } from '../lib/store'
import { BadgeMedal } from './BadgeCard'

const TOAST_MS = 5000

/** Announces badges as they are earned, one at a time. */
export function BadgeToaster() {
  const queue = useBadgeToasts()
  const data = useAppData()
  const id = queue[0]
  const badge = id ? badgeById(id) : undefined

  useEffect(() => {
    if (!id) return
    play('badge')
    const t = setTimeout(() => dismissBadgeToast(id), TOAST_MS)
    return () => clearTimeout(t)
  }, [id])

  if (!badge) return null
  return (
    <div className={`badge-toast ${badge.subject ? `subject-${badge.subject}` : ''}`} role="status">
      <BadgeMedal badge={badge} data={data} size={64} fresh />
      <div className="badge-body">
        <span className="eyebrow">Badge earned</span>
        <strong>{badge.name}</strong>
        {badge.detail && <span className="muted small">{badge.detail(data)}</span>}
      </div>
      <div className="badge-toast-actions">
        <Link to="/profile" className="small" onClick={() => dismissBadgeToast(badge.id)}>
          View
        </Link>
        <button className="icon-btn" onClick={() => dismissBadgeToast(badge.id)} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  )
}
