import type { PracticeTopic, TopicId } from './lib/topics'

export interface Profile {
  name: string
  createdAt: number
}

export interface DailyResult {
  /** Local date, YYYY-MM-DD. */
  date: string
  number: number
  topic: TopicId
  /** One entry per answered question, in order. Fewer than 7 means the dive is in progress. */
  answers: boolean[]
  depth: number
  startedAt: number
  finishedAt: number | null
}

export interface PracticeRecord {
  id: string
  topic: PracticeTopic
  startedAt: number
  endedAt: number
  maxDepth: number
  answered: number
  correct: number
  bestStreak: number
  endReason: 'oxygen' | 'bottom' | 'quit'
}

export interface CreatureSighting {
  spottedAt: number
}

export interface AppData {
  version: 2
  profile: Profile
  /** Daily Dive results by date. The first finished result for a date is final. */
  daily: Record<string, DailyResult>
  practice: PracticeRecord[]
  /** Creatures spotted, by id. Never taken away. */
  creatures: Record<string, CreatureSighting>
}
