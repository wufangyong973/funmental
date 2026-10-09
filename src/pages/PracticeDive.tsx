import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DiveFrame, OxygenTanks } from '../components/DiveHud'
import { Round } from '../components/Round'
import type { AskedQuestion } from '../content/questions'
import { DIFFICULTY_NAMES, MAX_DEPTH, ZONES, formatDepth, zoneAt } from '../lib/ocean'
import { MAX_OXYGEN, answerPractice, nextPracticeQuestion, startPractice, streakBonus, type PracticeState } from '../lib/practice'
import { play } from '../lib/sound'
import { addPractice } from '../lib/store'
import { isPracticeTopic, topicMeta, type PracticeTopic } from '../lib/topics'
import { useUnlocked } from '../lib/unlock'

export function PracticeDive() {
  const { topic } = useParams()
  const unlocked = useUnlocked()
  const [run, setRun] = useState(0)
  if (!unlocked) return <Navigate to="/unlock" replace />
  if (!isPracticeTopic(topic)) return <Navigate to="/practice" replace />
  return <Dive key={`${topic}-${run}`} topic={topic} onAgain={() => setRun((r) => r + 1)} />
}

function Dive({ topic, onAgain }: { topic: PracticeTopic; onAgain: () => void }) {
  const meta = topicMeta(topic)
  const seen = useRef(new Set<string>())
  const startedAt = useRef(Date.now())
  const stateRef = useRef<PracticeState>(startPractice())
  const [state, setState] = useState(stateRef.current)
  const [asked, setAsked] = useState<AskedQuestion>(() => draw(0))
  const [count, setCount] = useState(0)
  const [outcome, setOutcome] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const saved = useRef(false)

  function draw(depth: number) {
    const q = nextPracticeQuestion(topic, depth, seen.current)
    seen.current.add(q.question.id)
    return q
  }

  const save = (s: PracticeState, endReason: 'oxygen' | 'bottom' | 'quit') => {
    if (saved.current || s.answered === 0) return
    saved.current = true
    addPractice({
      id: `${startedAt.current}-${Math.random().toString(36).slice(2, 7)}`,
      topic,
      startedAt: startedAt.current,
      endedAt: Date.now(),
      maxDepth: s.depth,
      answered: s.answered,
      correct: s.correct,
      bestStreak: s.bestStreak,
      endReason,
    })
  }

  const handleAnswer = (correct: boolean) => {
    const step = answerPractice(stateRef.current, correct)
    stateRef.current = step.state
    setState(step.state)
    if (step.enteredZone !== null) {
      play('levelUp')
      setBanner(ZONES[step.enteredZone].name)
    }
    const bonus = streakBonus(step.state.streak)
    setOutcome(correct ? `+${step.gained.toLocaleString('en-US')} m${bonus > 1 ? ` · ${step.state.streak} in a row` : ''}` : step.state.over ? 'Out of oxygen' : '−1 oxygen tank')
    if (step.state.over) save(step.state, step.state.over)
  }

  const next = () => {
    setBanner(null)
    setOutcome(null)
    if (stateRef.current.over) {
      play('complete')
      setFinished(true)
      return
    }
    setAsked(draw(stateRef.current.depth))
    setCount((c) => c + 1)
  }

  const surface = () => {
    save(stateRef.current, 'quit')
    setFinished(true)
  }

  if (finished) {
    const s = stateRef.current
    return (
      <div className="page narrow results">
        <span className="eyebrow">
          Practice · {meta.emoji} {meta.name}
        </span>
        <div className="results-depth">{formatDepth(s.depth)}</div>
        <p className="lead">
          {s.depth >= MAX_DEPTH ? 'You touched the bottom of the Challenger Deep!' : s.depth > 0 ? `You reached the ${zoneAt(s.depth).name}.` : 'You stayed near the surface.'}
        </p>
        <div className="stats-row">
          <div className="stat">
            <strong>
              {s.correct}/{s.answered}
            </strong>
            <span className="muted small">right</span>
          </div>
          <div className="stat">
            <strong>{s.bestStreak}</strong>
            <span className="muted small">best streak</span>
          </div>
        </div>
        <div className="row">
          <button className="btn primary" onClick={onAgain}>
            Dive again
          </button>
          <Link to="/practice" className="btn ghost">
            Change topic
          </Link>
        </div>
      </div>
    )
  }

  return (
    <DiveFrame depth={state.depth} title={`Practice · ${meta.name}`} status={<OxygenTanks oxygen={state.oxygen} max={MAX_OXYGEN} />} banner={banner}>
      <p className="question-meta">
        {DIFFICULTY_NAMES[zoneAt(state.depth).difficulty]} questions{state.streak >= 3 ? ` · ${state.streak} in a row, descending ${Math.round((streakBonus(state.streak) - 1) * 100)}% faster` : ''}
      </p>
      <Round key={count} asked={asked} onAnswered={handleAnswer} onNext={next} nextLabel={state.over ? 'See results' : 'Next question'} outcome={outcome} />
      {!state.over && (
        <button className="link-btn surface-btn" onClick={surface}>
          Surface and end dive
        </button>
      )}
    </DiveFrame>
  )
}
