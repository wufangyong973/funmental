import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { discoveryById } from '../lib/discoveries'
import { play } from '../lib/sound'
import { dismissDiscoveryToast, useDiscoveryToasts } from '../lib/store'
import { DiscoveryIcon } from './Icons'

const TOAST_MS = 5000

/** Announces discoveries as they're made, one at a time. */
export function DiscoveryToaster() {
  const queue = useDiscoveryToasts()
  const id = queue[0]
  const found = id ? discoveryById(id) : undefined

  useEffect(() => {
    if (!id) return
    play('badge')
    const t = setTimeout(() => dismissDiscoveryToast(id), TOAST_MS)
    return () => clearTimeout(t)
  }, [id])

  if (!found) return null
  return (
    <div className="toast" role="status">
      <DiscoveryIcon id={found.id} size={48} />
      <div className="toast-body">
        <span className="eyebrow">New discovery</span>
        <strong>{found.name}</strong>
        <span className="muted small">{found.fact}</span>
      </div>
      <div className="toast-actions">
        <Link to="/star-chart" className="small" onClick={() => dismissDiscoveryToast(found.id)}>
          Star chart
        </Link>
        <button className="icon-btn" onClick={() => dismissDiscoveryToast(found.id)} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  )
}
