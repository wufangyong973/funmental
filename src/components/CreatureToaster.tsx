import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { creatureById } from '../lib/creatures'
import { play } from '../lib/sound'
import { dismissCreatureToast, useCreatureToasts } from '../lib/store'

const TOAST_MS = 5000

/** Announces creatures as they're spotted, one at a time. */
export function CreatureToaster() {
  const queue = useCreatureToasts()
  const id = queue[0]
  const creature = id ? creatureById(id) : undefined

  useEffect(() => {
    if (!id) return
    play('badge')
    const t = setTimeout(() => dismissCreatureToast(id), TOAST_MS)
    return () => clearTimeout(t)
  }, [id])

  if (!creature) return null
  return (
    <div className="toast" role="status">
      <span className="toast-emoji" aria-hidden>
        {creature.emoji}
      </span>
      <div className="toast-body">
        <span className="eyebrow">New sighting</span>
        <strong>{creature.name}</strong>
        <span className="muted small">{creature.fact}</span>
      </div>
      <div className="toast-actions">
        <Link to="/logbook" className="small" onClick={() => dismissCreatureToast(creature.id)}>
          Logbook
        </Link>
        <button className="icon-btn" onClick={() => dismissCreatureToast(creature.id)} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  )
}
