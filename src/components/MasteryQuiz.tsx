import { useRef, useState } from 'react'
import { nextQuestion } from '../content'
import { play } from '../lib/sound'
import { isPassing, MASTERY_PASS, MASTERY_QUESTIONS, masteryKey, recordQuizResult, useMastery } from '../lib/mastery'
import { tierLabel } from '../lib/tiers'
import type { Question, SubjectId } from '../types'
import { QuestionView } from './QuestionView'
import { SoundToggle } from './SoundToggle'

type Phase = 'intro' | 'playing' | 'done'

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * A 10-question refresher quiz for one grade. Results only update Learn mastery;
 * they never count toward training levels, sessions or badges.
 */
export function MasteryQuiz({ subject, tier }: { subject: SubjectId; tier: number }) {
  const record = useMastery().grades[masteryKey(subject, tier)]
  const [phase, setPhase] = useState<Phase>('intro')
  const [question, setQuestion] = useState<Question | null>(null)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [locked, setLocked] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [justMastered, setJustMastered] = useState(false)
  const seen = useRef(new Set<string>())
  const rootRef = useRef<HTMLDivElement>(null)
  const label = tierLabel(tier)

  const draw = () => {
    const q = nextQuestion(subject, tier, 'quiz', seen.current)
    seen.current.add(q.id)
    setQuestion(q)
    setLocked(false)
  }

  const start = () => {
    seen.current = new Set()
    setScore(0)
    setIndex(0)
    setJustMastered(false)
    setPhase('playing')
    draw()
  }

  const onSubmit = (correct: boolean) => {
    if (locked) return
    setLocked(true)
    setLastCorrect(correct)
    play(correct ? 'correct' : 'wrong')
    if (correct) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= MASTERY_QUESTIONS) {
      const wasMastered = Boolean(record?.masteredAt)
      recordQuizResult(subject, tier, score)
      play(isPassing(score) ? 'complete' : 'submit')
      setJustMastered(!wasMastered && isPassing(score))
      setPhase('done')
    } else {
      setIndex((i) => i + 1)
      draw()
    }
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  if (phase === 'intro') {
    return (
      <div className={`mastery-quiz ${record?.masteredAt ? 'is-mastered' : ''}`} ref={rootRef}>
        <div className="mastery-status">
          {record?.masteredAt ? (
            <>
              <span className="mastered-check big" aria-hidden>
                ✓
              </span>
              <div>
                <strong>{label} mastered</strong>
                <span className="muted small">
                  Mastered {formatDate(record.masteredAt)} · best {record.bestScore}/{MASTERY_QUESTIONS}
                </span>
              </div>
            </>
          ) : (
            <div>
              <strong>Master {label}</strong>
              <span className="muted small">
                {MASTERY_QUESTIONS} questions from this grade. Get {MASTERY_PASS} or more right to earn the check mark.
                {record && ` Best so far: ${record.bestScore}/${MASTERY_QUESTIONS}.`}
              </span>
            </div>
          )}
        </div>
        <p className="muted small">A refresher. It doesn't affect your training level.</p>
        <button className="btn primary" onClick={start}>
          {record?.masteredAt ? 'Refresh again' : record ? 'Try again' : 'Start quiz'}
        </button>
      </div>
    )
  }

  if (phase === 'done') {
    const passed = isPassing(score)
    return (
      <div className={`mastery-quiz done ${passed ? 'is-mastered' : ''}`} ref={rootRef}>
        <div className="mastery-status">
          {passed && (
            <span className={`mastered-check big ${justMastered ? 'pop' : ''}`} aria-hidden>
              ✓
            </span>
          )}
          <div>
            <strong className="mastery-score">
              {score}/{MASTERY_QUESTIONS}
            </strong>
            <span className="muted">
              {justMastered
                ? `${label} mastered! It now has a check mark in the sidebar.`
                : passed
                  ? 'Passed. Nice refresher.'
                  : `You need ${MASTERY_PASS} to master ${label}. Review the sections above and try again.`}
            </span>
          </div>
        </div>
        <button className="btn primary" onClick={start}>
          {passed ? 'Go again' : 'Try again'}
        </button>
      </div>
    )
  }

  return (
    <div className="mastery-quiz playing" ref={rootRef}>
      <div className="mastery-progress">
        <span className="muted small">
          Question {index + 1} of {MASTERY_QUESTIONS}
        </span>
        <span className="mastery-progress-end">
          <span className="small score">✓ {score}</span>
          <SoundToggle />
        </span>
      </div>
      <div className="bar thin">
        <div className="bar-fill" style={{ width: `${((index + (locked ? 1 : 0)) / MASTERY_QUESTIONS) * 100}%` }} />
      </div>
      {question && <QuestionView key={index} q={question} locked={locked} onSubmit={onSubmit} keyboard={false} />}
      {locked && (
        <div className="feedback">
          <p className={lastCorrect ? 'good' : 'bad'}>{lastCorrect ? 'Correct!' : 'Not quite.'}</p>
          {question?.explanation && <p className="muted">{question.explanation}</p>}
          <button className="btn primary" onClick={next}>
            {index + 1 >= MASTERY_QUESTIONS ? 'See result' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
