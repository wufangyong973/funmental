import { ask, pool, type AskedQuestion } from '../content/questions'
import { MAX_DEPTH, ZONES, zoneIndexAt } from './ocean'
import { pick } from './rng'
import { TOPICS, type PracticeTopic } from './topics'

export const MAX_OXYGEN = 3

/** Meters per right answer in each zone: about seven right answers to cross one. */
export const ZONE_STEP = [30, 115, 430, 285, 705]

export interface PracticeState {
  depth: number
  oxygen: number
  streak: number
  bestStreak: number
  answered: number
  correct: number
  over: null | 'oxygen' | 'bottom'
}

export function startPractice(): PracticeState {
  return { depth: 0, oxygen: MAX_OXYGEN, streak: 0, bestStreak: 0, answered: 0, correct: 0, over: null }
}

/** 3 in a row descends 25% faster, 5 in a row 50% faster. */
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
    const oxygen = s.oxygen - 1
    return { state: { ...s, answered, oxygen, streak: 0, over: oxygen <= 0 ? 'oxygen' : null }, gained: 0, enteredZone: null }
  }
  const streak = s.streak + 1
  const from = zoneIndexAt(s.depth)
  const depth = Math.min(MAX_DEPTH, Math.round(s.depth + ZONE_STEP[from] * streakBonus(streak)))
  const to = zoneIndexAt(depth)
  const enteredZone = to > from ? to : null
  return {
    state: {
      ...s,
      depth,
      answered,
      correct: s.correct + 1,
      streak,
      bestStreak: Math.max(s.bestStreak, streak),
      // Reaching a new zone refills a tank.
      oxygen: enteredZone !== null ? Math.min(MAX_OXYGEN, s.oxygen + 1) : s.oxygen,
      over: depth >= MAX_DEPTH ? 'bottom' : null,
    },
    gained: depth - s.depth,
    enteredZone,
  }
}

/** Next question at the difficulty of the current zone, avoiding ones already seen this dive. */
export function nextPracticeQuestion(topic: PracticeTopic, depth: number, seen: Set<string>, rand = Math.random): AskedQuestion {
  const difficulty = ZONES[zoneIndexAt(depth)].difficulty
  const topics = topic === 'mixed' ? TOPICS.map((t) => t.id) : [topic]
  let candidates = topics.flatMap((t) => pool(t, difficulty)).filter((q) => !seen.has(q.id))
  if (candidates.length === 0) candidates = topics.flatMap((t) => pool(t, difficulty))
  return ask(pick(candidates, rand), rand)
}
