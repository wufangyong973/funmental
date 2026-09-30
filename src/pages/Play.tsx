import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { QuestionView } from '../components/QuestionView'
import { SoundToggle } from '../components/SoundToggle'
import { nextQuestion } from '../content'
import { play } from '../lib/sound'
import { addSession, getData, recordAnswer, useAppData } from '../lib/store'
import { isMode, isSubject, learnPath, modeMeta, subjectMeta } from '../lib/subjects'
import { tierLabel } from '../lib/tiers'
import type { Mode, Question, SubjectId } from '../types'

export function Play() {
  const { subject, mode } = useParams()
  const data = useAppData()
  if (!isSubject(subject) || !isMode(mode)) return <Navigate to="/" replace />
  if (!data.subjects[subject].placed) return <Navigate to={`/placement/${subject}`} replace />
  return <Game key={`${subject}-${mode}`} subject={subject} mode={mode} />
}

interface Stats {
  answered: number
  correct: number
  startedAt: number
  tierStart: number
}

type Toast = { text: string; up: boolean } | null

function Game({ subject, mode }: { subject: SubjectId; mode: Mode }) {
  const meta = modeMeta(mode)
  const sMeta = subjectMeta(subject)
  const tier = useAppData().subjects[subject].tier

  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro')
  const [question, setQuestion] = useState<Question | null>(null)
  const [qIndex, setQIndex] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const [timeLeft, setTimeLeft] = useState(meta.seconds ?? 0)
  const [stats, setStats] = useState<Stats>({ answered: 0, correct: 0, startedAt: 0, tierStart: tier })
  const [tierEnd, setTierEnd] = useState(tier)

  const statsRef = useRef(stats)
  const seen = useRef(new Set<string>())
  const finished = useRef(false)

  const draw = useCallback(() => {
    const q = nextQuestion(subject, getData().subjects[subject].tier, mode, seen.current)
    seen.current.add(q.id)
    setQuestion(q)
    setQIndex((i) => i + 1)
    setLocked(false)
    setLastCorrect(null)
  }, [subject, mode])

  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    const s = statsRef.current
    const end = getData().subjects[subject].tier
    setTierEnd(end)
    if (s.answered > 0) {
      addSession({
        id: `${s.startedAt}-${Math.random().toString(36).slice(2, 7)}`,
        subject,
        mode,
        startedAt: s.startedAt,
        endedAt: Date.now(),
        answered: s.answered,
        correct: s.correct,
        tierStart: s.tierStart,
        tierEnd: end,
      })
    }
    setPhase('done')
  }, [subject, mode])

  const start = () => {
    const s = { answered: 0, correct: 0, startedAt: Date.now(), tierStart: getData().subjects[subject].tier }
    statsRef.current = s
    setStats(s)
    seen.current = new Set()
    finished.current = false
    setTimeLeft(meta.seconds ?? 0)
    setToast(null)
    setPhase('playing')
    draw()
  }

  // Rapid-fire countdown.
  useEffect(() => {
    if (phase !== 'playing' || !meta.seconds) return
    const deadline = Date.now() + meta.seconds * 1000
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setTimeLeft(left)
      if (left === 0 && !finished.current) {
        play('complete')
        finish()
      }
    }, 200)
    return () => clearInterval(id)
  }, [phase, meta.seconds, finish])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(id)
  }, [toast])

  const advance = () => {
    if (meta.length && statsRef.current.answered >= meta.length) {
      play('complete')
      finish()
    } else draw()
  }

  const onSubmit = (correct: boolean) => {
    if (locked || finished.current) return
    setLocked(true)
    setLastCorrect(correct)
    play(correct ? 'correct' : 'wrong')
    const s = { ...statsRef.current, answered: statsRef.current.answered + 1, correct: statsRef.current.correct + (correct ? 1 : 0) }
    statsRef.current = s
    setStats(s)

    const change = recordAnswer(subject, correct)
    if (change > 0) play('levelUp')
    if (change !== 0) {
      const t = getData().subjects[subject].tier
      setToast({ text: change > 0 ? `Level up! Now at ${tierLabel(t)}` : `Adjusted to ${tierLabel(t)}`, up: change > 0 })
    }
    if (mode === 'rapid') setTimeout(() => !finished.current && draw(), correct ? 250 : 900)
  }

  if (phase === 'intro') {
    return (
      <div className="panel play-intro">
        <p className="eyebrow">
          {sMeta.name} · {tierLabel(tier)}
        </p>
        <h1>{meta.name}</h1>
        <p className="lead">{meta.blurb}</p>
        <p className="muted">Every answer counts toward your level. Get 8 of your last 10 right to move up a grade.</p>
        <div className="row">
          <button className="btn primary big" onClick={start} autoFocus>
            Start
          </button>
          <Link className="btn ghost" to={`/subject/${subject}`}>
            Back
          </Link>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const acc = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0
    const delta = tierEnd - stats.tierStart
    return (
      <div className="panel play-done">
        <p className="eyebrow">
          {sMeta.name} · {meta.name}
        </p>
        <h1>{mode === 'rapid' ? `${stats.correct} correct` : `${stats.correct} / ${stats.answered}`}</h1>
        <div className="stat-row">
          <div className="stat">
            <span className="stat-value">{acc}%</span>
            <span className="stat-label">accuracy</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.answered}</span>
            <span className="stat-label">answered</span>
          </div>
          <div className="stat">
            <span className="stat-value">{tierLabel(tierEnd)}</span>
            <span className="stat-label">current level</span>
          </div>
        </div>
        {delta !== 0 && (
          <p className={`level-change ${delta > 0 ? 'up' : 'down'}`}>
            {delta > 0 ? '▲ Leveled up' : '▼ Adjusted down'}: {tierLabel(stats.tierStart)} → {tierLabel(tierEnd)}
          </p>
        )}
        <div className="row">
          <button className="btn primary big" onClick={start}>
            Play again
          </button>
          <Link className="btn ghost" to={learnPath(subject, tierEnd)}>
            📖 Review {tierLabel(tierEnd)} guide
          </Link>
          <Link className="btn ghost" to={`/subject/${subject}`}>
            Back to {sMeta.name}
          </Link>
        </div>
      </div>
    )
  }

  const progressLabel = meta.seconds ? `${timeLeft}s` : `${Math.min(stats.answered + (locked ? 0 : 1), meta.length!)} / ${meta.length}`
  const progressPct = meta.seconds ? (timeLeft / meta.seconds) * 100 : (stats.answered / meta.length!) * 100

  return (
    <div className={`play subject-${subject}`}>
      <div className="play-head">
        <Link to={`/subject/${subject}`} className="btn ghost small" onClick={finish}>
          ✕ Quit
        </Link>
        <div className="play-meta">
          <span className="pill">{tierLabel(getData().subjects[subject].tier)}</span>
          <span className={`timer ${meta.seconds && timeLeft <= 10 ? 'urgent' : ''}`}>{progressLabel}</span>
          <span className="score">✓ {stats.correct}</span>
          <SoundToggle />
        </div>
      </div>
      <div className="bar thin">
        <div className="bar-fill" style={{ width: `${progressPct}%` }} />
      </div>
      {toast && <div className={`toast ${toast.up ? 'up' : 'down'}`}>{toast.text}</div>}
      <div className={`panel question-panel ${lastCorrect === true ? 'flash-good' : ''} ${lastCorrect === false ? 'flash-bad' : ''}`}>
        {question && <QuestionView key={qIndex} q={question} locked={locked} onSubmit={onSubmit} />}
        {locked && mode !== 'rapid' && (
          <div className="feedback">
            <p className={lastCorrect ? 'good' : 'bad'}>{lastCorrect ? 'Correct!' : 'Not quite.'}</p>
            {question?.explanation && <p className="muted">{question.explanation}</p>}
            <button className="btn primary" onClick={advance} autoFocus>
              {meta.length && stats.answered >= meta.length ? 'See results' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
