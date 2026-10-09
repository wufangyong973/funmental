import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DailyResults } from '../components/DailyResults'
import { DailyRun } from '../components/DailyRun'
import { dailyNumber, dailyTopic } from '../lib/daily'
import { useUnlocked } from '../lib/unlock'
import { topicMeta } from '../lib/topics'

/** Replays a past Daily Dive. Part of Practice; nothing is saved and streaks aren't affected. */
export function Archive() {
  const n = Number(useParams().n)
  const unlocked = useUnlocked()
  const [answers, setAnswers] = useState<boolean[] | null>(null)
  if (!unlocked) return <Navigate to="/unlock" replace />
  if (!Number.isInteger(n) || n < 1 || n >= dailyNumber()) return <Navigate to="/practice" replace />
  const topic = dailyTopic(n)

  if (answers) {
    return (
      <div className="page">
        <DailyResults n={n} topic={topic} answers={answers}>
          <Link to="/practice" className="btn ghost">
            Back to Practice
          </Link>
        </DailyResults>
      </div>
    )
  }
  return <DailyRun key={n} n={n} title={`Replay · Fathom #${n} · ${topicMeta(topic).name}`} initial={[]} onFinish={setAnswers} />
}
