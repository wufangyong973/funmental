import { useMemo, useState } from 'react'
import { DAILY_ZONE, dailyHeight, dailyQuestions, shareText } from '../lib/daily'
import { MILESTONES, ZONES, formatAltitude } from '../lib/space'
import { ClimbProfile } from './ClimbCharts'
import { TopicIcon } from './Icons'
import { shareResult } from '../lib/share'
import { topicMeta, type TopicId } from '../lib/topics'

/** End-of-launch summary: altitude, the share grid, and each question with its answer. */
export function DailyResults({ n, topic, answers, children }: { n: number; topic: TopicId; answers: readonly boolean[]; children?: React.ReactNode }) {
  const height = dailyHeight(answers)
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
      <span className="eyebrow with-icon">
        <TopicIcon topic={topic} size={16} /> Apogee #{n} · {meta.name}
      </span>
      <div className="results-altitude">{formatAltitude(height)}</div>
      <p className="lead">
        {right === 7 ? 'You reached the center of the galaxy!' : height === 0 ? 'You stayed on the launch pad today.' : `You reached ${MILESTONES[height - 1].name}.`}{' '}
        {right} of 7 right.
      </p>
      <div className="squares" aria-label={`${right} of 7 right`}>
        {answers.map((ok, i) => (
          <span key={i} className={`square ${ok ? `z-${ZONES[DAILY_ZONE[i]].id}` : 'miss'}`} />
        ))}
      </div>
      <ClimbProfile answers={answers} />
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
                {q.choices[q.answerIndex]} · {ZONES[DAILY_ZONE[i]].name}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
