import { useMemo, useRef, useState } from 'react'
import { DAILY_DEPTHS, DAILY_LENGTH, DAILY_ZONE, dailyDepth, dailyQuestions } from '../lib/daily'
import { DIFFICULTY_NAMES, ZONES, zoneIndexAt } from '../lib/ocean'
import { play } from '../lib/sound'
import { DiveFrame, ProgressDots } from './DiveHud'
import { Round } from './Round'

interface Props {
  n: number
  title: string
  /** Answers already given (a dive resumed after a reload). */
  initial: readonly boolean[]
  /** Saves each answer; called with the new answers list. */
  onAnswer?: (answers: boolean[]) => void
  onFinish: (answers: boolean[]) => void
}

/** Plays the seven questions of Daily Dive `n`. */
export function DailyRun({ n, title, initial, onAnswer, onFinish }: Props) {
  const questions = useMemo(() => dailyQuestions(n), [n])
  const [answers, setAnswers] = useState<boolean[]>([...initial])
  const answersRef = useRef(answers)
  // The question on screen; it stays put after answering until Next is pressed.
  const [index, setIndex] = useState(initial.length)
  const [banner, setBanner] = useState<string | null>(null)

  const depth = dailyDepth(answers)
  const answered = answers.length > index

  const handleAnswer = (correct: boolean) => {
    const prev = answersRef.current
    if (prev.length > index) return
    const next = [...prev, correct]
    answersRef.current = next
    setAnswers(next)
    onAnswer?.(next)
    const after = zoneIndexAt(dailyDepth(next))
    if (after > zoneIndexAt(dailyDepth(prev))) {
      play('levelUp')
      setBanner(ZONES[after].name)
    }
  }

  const next = () => {
    setBanner(null)
    if (index + 1 >= DAILY_LENGTH) {
      play('complete')
      onFinish(answersRef.current)
    } else setIndex(index + 1)
  }

  const zoneOf = (i: number) => ZONES[DAILY_ZONE[i]].id
  return (
    <DiveFrame depth={depth} title={title} status={<ProgressDots answers={answers} total={DAILY_LENGTH} zoneOf={zoneOf} />} banner={banner}>
      <p className="question-meta">
        Question {index + 1} of {DAILY_LENGTH} · {DIFFICULTY_NAMES[questions[index].question.difficulty]} · worth {DAILY_DEPTHS[index].toLocaleString('en-US')} m
      </p>
      <Round
        key={index}
        asked={questions[index]}
        onAnswered={handleAnswer}
        onNext={next}
        nextLabel={index + 1 >= DAILY_LENGTH ? 'See results' : 'Next question'}
        outcome={answered ? (answers[index] ? `+${DAILY_DEPTHS[index].toLocaleString('en-US')} m` : '+0 m') : null}
      />
    </DiveFrame>
  )
}
