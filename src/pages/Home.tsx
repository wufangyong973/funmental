import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DAILY_LENGTH, DAILY_ZONE, dailyNumber, dailyTopic, shareText } from '../lib/daily'
import { dailyStreak } from '../lib/creatures'
import { dateKey, untilMidnight } from '../lib/dates'
import { MAX_DEPTH, ZONES, formatDepth, zoneAt } from '../lib/ocean'
import { shareResult } from '../lib/share'
import { useAppData } from '../lib/store'
import { topicMeta } from '../lib/topics'
import { useUnlocked } from '../lib/unlock'

function useCountdown() {
  const [label, setLabel] = useState(() => untilMidnight())
  useEffect(() => {
    const id = setInterval(() => setLabel(untilMidnight()), 30_000)
    return () => clearInterval(id)
  }, [])
  return label
}

/** The surface: today's dive, your streak, and the way into Practice. */
export function Home() {
  const data = useAppData()
  const unlocked = useUnlocked()
  const today = dateKey()
  const n = dailyNumber(today)
  const topic = topicMeta(dailyTopic(n))
  const result = data.daily[today]
  const done = result?.finishedAt != null
  const streak = dailyStreak(data)
  const countdown = useCountdown()
  const [shared, setShared] = useState<string | null>(null)

  const share = async () => {
    if (!result) return
    const r = await shareResult(shareText(n, topic.name, result.answers))
    setShared(r === 'copied' ? 'Copied!' : r === 'shared' ? 'Shared!' : "Couldn't copy")
  }

  return (
    <div className="page home">
      <section className="hero">
        <span className="eyebrow">Fathom #{n}</span>
        <h1>
          Today's dive: <span className="topic-name">{topic.emoji} {topic.name}</span>
        </h1>
        {!done ? (
          <>
            <p className="lead">
              {DAILY_LENGTH} questions, 20 seconds each. Every right answer takes you deeper. Get them all to reach the bottom of the Challenger
              Deep, {formatDepth(MAX_DEPTH)} down.
            </p>
            <Link to="/daily" className="btn primary big">
              {result && result.answers.length > 0 ? `Continue dive (${result.answers.length}/${DAILY_LENGTH})` : 'Dive'}
            </Link>
          </>
        ) : (
          <>
            <div className="hero-result">
              <span className="results-depth">{formatDepth(result.depth)}</span>
              <span className="muted">
                {result.depth >= MAX_DEPTH ? 'Challenger Deep!' : result.depth > 0 ? zoneAt(result.depth).name : 'Surface'} · {result.answers.filter(Boolean).length}/7
              </span>
            </div>
            <div className="squares">
              {result.answers.map((ok, i) => (
                <span key={i} className={`square ${ok ? `z-${ZONES[DAILY_ZONE[i]].id}` : 'miss'}`} />
              ))}
            </div>
            <div className="row">
              <button className="btn primary" onClick={share}>
                {shared ?? 'Share result'}
              </button>
              <Link to="/daily" className="btn ghost">
                Review answers
              </Link>
            </div>
            <p className="muted">Next dive in {countdown}.</p>
          </>
        )}
      </section>

      <section className="stats-row">
        <div className="stat">
          <strong>🔥 {streak}</strong>
          <span className="muted small">day streak</span>
        </div>
        <div className="stat">
          <strong>{Object.values(data.daily).filter((r) => r.finishedAt !== null).length}</strong>
          <span className="muted small">dives</span>
        </div>
        <div className="stat">
          <strong>{Object.keys(data.creatures).length}</strong>
          <span className="muted small">creatures</span>
        </div>
      </section>

      <section className={`panel practice-card ${unlocked ? '' : 'locked'}`}>
        <div>
          <span className="eyebrow">{unlocked ? 'Practice' : '🔒 Practice'}</span>
          <h2>Want to keep diving?</h2>
          <p className="muted">
            Unlimited dives in any of 8 topics, with oxygen tanks and streak boosts, plus every past Daily Dive to replay.
          </p>
        </div>
        <Link to={unlocked ? '/practice' : '/unlock'} className="btn primary">
          {unlocked ? 'Practice' : 'Unlock Fathom'}
        </Link>
      </section>
    </div>
  )
}
