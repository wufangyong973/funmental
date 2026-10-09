import { ask, pool, type AskedQuestion } from '../content/questions'
import { MAX_HEIGHT, ZONES, zoneIndexAt } from './space'
import { pick } from './rng'
import { TOPICS, type PracticeTopic } from './topics'

export const MAX_FUEL = 3

/** Climb per right answer, in milestones: about seven right answers cross any zone. */
export const ZONE_STEP = ZONES.map((z) => (z.to - z.from) / 7)

export interface PracticeState {
  height: number
  fuel: number
  streak: number
  bestStreak: number
  answered: number
  correct: number
  over: null | 'fuel' | 'top'
}

export function startPractice(): PracticeState {
  return { height: 0, fuel: MAX_FUEL, streak: 0, bestStreak: 0, answered: 0, correct: 0, over: null }
}

/** 3 in a row climbs 25% faster, 5 in a row 50% faster. */
export function streakBonus(streak: number): number {
  return streak >= 5 ? 1.5 : streak >= 3 ? 1.25 : 1
}

export interface PracticeStep {
  state: PracticeState
  gained: number
  /** Set when this answer carried you into a new zone. */
  enteredZone: number | null
}

export function answerPractice(s: PracticeState, correct: boolean): PracticeStep {
  if (s.over) return { state: s, gained: 0, enteredZone: null }
  const answered = s.answered + 1
  if (!correct) {
    const fuel = s.fuel - 1
    return { state: { ...s, answered, fuel, streak: 0, over: fuel <= 0 ? 'fuel' : null }, gained: 0, enteredZone: null }
  }
  const streak = s.streak + 1
  const from = zoneIndexAt(s.height)
  const height = Math.min(MAX_HEIGHT, Math.round((s.height + ZONE_STEP[from] * streakBonus(streak)) * 1e4) / 1e4)
  const to = zoneIndexAt(height)
  const enteredZone = to > from ? to : null
  return {
    state: {
      ...s,
      height,
      answered,
      correct: s.correct + 1,
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
      // Reaching a new zone refills a fuel cell.
      fuel: enteredZone !== null ? Math.min(MAX_FUEL, s.fuel + 1) : s.fuel,
      over: height >= MAX_HEIGHT ? 'top' : null,
    },
    gained: height - s.height,
    enteredZone,
  }
}

/** Next question at the difficulty of the current zone, avoiding ones already seen this flight. */
export function nextPracticeQuestion(topic: PracticeTopic, height: number, seen: Set<string>, rand = Math.random): AskedQuestion {
  const difficulty = ZONES[zoneIndexAt(height)].difficulty
  const topics = topic === 'mixed' ? TOPICS.map((t) => t.id) : [topic]
  let candidates = topics.flatMap((t) => pool(t, difficulty)).filter((q) => !seen.has(q.id))
  if (candidates.length === 0) candidates = topics.flatMap((t) => pool(t, difficulty))
  return ask(pick(candidates, rand), rand)
}
