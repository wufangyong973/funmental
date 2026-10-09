import { useMemo, useState } from 'react'
import { DAILY_DEPTHS, DAILY_ZONE, dailyDepth, dailyQuestions, shareText } from '../lib/daily'
import { ZONES, formatDepth, zoneAt } from '../lib/ocean'
import { shareResult } from '../lib/share'
import { topicMeta, type TopicId } from '../lib/topics'

/** End-of-dive summary: depth, the share grid, and each question with its answer. */
export function DailyResults({ n, topic, answers, children }: { n: number; topic: TopicId; answers: readonly boolean[]; children?: React.ReactNode }) {
  const depth = dailyDepth(answers)
  const meta = topicMeta(topic)
  const questions = useMemo(() => dailyQuestions(n), [n])
  const [shared, setShared] = useState<string | null>(null)
  const right = answers.filter(Boolean).length

  const share = async () => {
    const r = await shareResult(shareText(n, meta.name, answers))
    setShared(r === 'copied' ? 'Copied!' : r === 'shared' ? 'Shared!' : "Couldn't copy")
  }

  return (
    <div className="results">
      <span className="eyebrow">
        Fathom #{n} · {meta.emoji} {meta.name}
      </span>
      <div className="results-depth">{formatDepth(depth)}</div>
      <p className="lead">
        {right === 7 ? 'You touched the bottom of the Challenger Deep!' : depth === 0 ? 'You stayed at the surface today.' : `You reached the ${zoneAt(depth).name}.`}{' '}
        {right} of 7 right.
      </p>
      <div className="squares" aria-label={`${right} of 7 right`}>
        {answers.map((ok, i) => (
          <span key={i} className={`square ${ok ? `z-${ZONES[DAILY_ZONE[i]].id}` : 'miss'}`} />
        ))}
      </div>
      <div className="row">
        <button className="btn primary" onClick={share}>
          {shared ?? 'Share result'}
        </button>
        {children}
      </div>
      <ol className="review">
        {questions.map((q, i) => (
          <li key={q.question.id} className={answers[i] ? 'good' : 'bad'}>
            <span className="review-mark" aria-label={answers[i] ? 'Right' : 'Missed'}>
              {answers[i] ? '✓' : '✕'}
            </span>
            <div>
              <p>{q.question.prompt}</p>
              <p className="muted small">
                {q.choices[q.answerIndex]} · {ZONES[DAILY_ZONE[i]].name} · {answers[i] ? `+${DAILY_DEPTHS[i].toLocaleString('en-US')} m` : '+0 m'}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
