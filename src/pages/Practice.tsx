import { Link, Navigate } from 'react-router-dom'
import { dailyDate, dailyNumber, dailyTopic } from '../lib/daily'
import { MAX_DEPTH, formatDepth } from '../lib/ocean'
import { useAppData } from '../lib/store'
import { MIXED, TOPICS, topicMeta, type PracticeTopic } from '../lib/topics'
import { useUnlocked } from '../lib/unlock'

const ARCHIVE_SHOWN = 30

/** Practice home: pick a topic for an endless dive, or replay a past Daily Dive. */
export function Practice() {
  const data = useAppData()
  const unlocked = useUnlocked()
  if (!unlocked) return <Navigate to="/unlock" replace />

  const best = (t: PracticeTopic) => Math.max(0, ...data.practice.filter((p) => p.topic === t).map((p) => p.maxDepth))
  const today = dailyNumber()
  const past = Array.from({ length: Math.min(ARCHIVE_SHOWN, today - 1) }, (_, i) => today - 1 - i)

  return (
    <div className="page">
      <span className="eyebrow">Practice</span>
      <h1>Pick a topic and dive</h1>
      <p className="lead">
        You have 3 oxygen tanks. A miss costs one, and each new zone gives one back. See how far you get toward {formatDepth(MAX_DEPTH)}.
      </p>
      <div className="topic-grid">
        {[MIXED, ...TOPICS].map((t) => (
          <Link key={t.id} to={`/practice/${t.id}`} className="topic-card">
            <span className="topic-emoji" aria-hidden>
              {t.emoji}
            </span>
            <strong>{t.name}</strong>
            <span className="muted small">{best(t.id) > 0 ? `Best ${formatDepth(best(t.id))}` : 'Not dived yet'}</span>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Past Daily Dives</h2>
      {past.length === 0 ? (
        <p className="muted">Past dives show up here from tomorrow.</p>
      ) : (
        <ul className="archive">
          {past.map((n) => {
            const mine = data.daily[dailyDate(n)]
            const meta = topicMeta(dailyTopic(n))
            return (
              <li key={n}>
                <Link to={`/archive/${n}`}>
                  <span>
                    #{n} · {meta.emoji} {meta.name}
                  </span>
                  <span className="muted small">{mine?.finishedAt ? formatDepth(mine.depth) : 'Missed'}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
