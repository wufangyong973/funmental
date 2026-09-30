import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { BadgeCard } from '../components/BadgeCard'
import { QuestionView } from '../components/QuestionView'
import { SoundToggle } from '../components/SoundToggle'
import { TierTrack } from '../components/TierTrack'
import { nextQuestion } from '../content'
import {
  advancePlacement,
  PLACEMENT_QUESTIONS,
  placementDone,
  placementResult,
  startPlacement,
  type PlacementState,
} from '../lib/leveling'
import { badgeById } from '../lib/badges'
import { play } from '../lib/sound'
import { setPlacement, useAppData } from '../lib/store'
import { isSubject, subjectMeta } from '../lib/subjects'
import { bandOf, tierLabel } from '../lib/tiers'
import type { Question, SubjectId } from '../types'

export function Placement() {
  const { subject } = useParams()
  if (!isSubject(subject)) return <Navigate to="/" replace />
  return <PlacementTest key={subject} subject={subject} />
}

function PlacementTest({ subject }: { subject: SubjectId }) {
  const meta = subjectMeta(subject)
  const navigate = useNavigate()
  const [state, setState] = useState<PlacementState | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [seen] = useState(() => new Set<string>())
  const [result, setResult] = useState<number | null>(null)
  const [earned, setEarned] = useState<string[]>([])
  const data = useAppData()

  const ask = (s: PlacementState) => {
    const q = nextQuestion(subject, s.tier, 'placement', seen)
    seen.add(q.id)
    setQuestion(q)
  }

  const begin = () => {
    const s = startPlacement()
    setState(s)
    ask(s)
  }

  const onSubmit = (correct: boolean) => {
    if (!state) return
    const next = advancePlacement(state, correct)
    setState(next)
    if (placementDone(next)) {
      const tier = placementResult(next)
      setEarned(setPlacement(subject, tier))
      play('complete')
      setResult(tier)
    } else {
      // Neutral: placement doesn't reveal whether an answer was right.
      play('submit')
      ask(next)
    }
  }

  if (result !== null) {
    return (
      <div className={`panel play-done subject-${subject}`}>
        <p className="eyebrow">{meta.name} placement complete</p>
        <h1>{tierLabel(result)}</h1>
        <p className="lead">
          You're starting in <strong>{bandOf(result).name}</strong>. Keep playing to climb toward College III.
        </p>
        <TierTrack tier={result} />
        {earned.length > 0 ? (
          <div className="earned-badges">
            <p className="eyebrow">Badge earned</p>
            {earned.map((id) => {
              const badge = badgeById(id)
              return badge && <BadgeCard key={id} badge={badge} data={data} fresh />
            })}
          </div>
        ) : (
          data.placements[subject] && (
            <p className="muted">
              Your {meta.name} Starting Line badge still shows where you began: {tierLabel(data.placements[subject].tier)}.
            </p>
          )
        )}
        <div className="row">
          <button className="btn primary big" onClick={() => navigate(`/subject/${subject}`)}>
            Start training
          </button>
          <Link className="btn ghost" to="/">
            Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!state || !question) {
    return (
      <div className="panel play-intro">
        <p className="eyebrow">{meta.name}</p>
        <h1>Placement test</h1>
        <p className="lead">
          {PLACEMENT_QUESTIONS} quick questions to find your starting level. They get harder when you're right and easier
          when you're not.
        </p>
        <p className="muted">No feedback until the end. If you don't know an answer, just make your best guess.</p>
        <div className="row">
          <button className="btn primary big" onClick={begin} autoFocus>
            Begin
          </button>
          <Link className="btn ghost" to="/">
            Not now
          </Link>
        </div>
      </div>
    )
  }

  const n = state.asked.length
  return (
    <div className={`play subject-${subject}`}>
      <div className="play-head">
        <Link to="/" className="btn ghost small">
          ✕ Quit
        </Link>
        <div className="play-meta">
          <span className="pill">Placement</span>
          <span className="timer">
            {n + 1} / {PLACEMENT_QUESTIONS}
          </span>
          <SoundToggle />
        </div>
      </div>
      <div className="bar thin">
        <div className="bar-fill" style={{ width: `${(n / PLACEMENT_QUESTIONS) * 100}%` }} />
      </div>
      <div className="panel question-panel">
        <QuestionView key={n} q={question} locked={false} onSubmit={onSubmit} />
      </div>
    </div>
  )
}
