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
  /** One entry per answered question, in order. Fewer than 7 means the launch is in progress. */
  answers: boolean[]
  /** Milestones reached (see src/lib/space.ts). */
  height: number
  startedAt: number
  finishedAt: number | null
}

export interface PracticeRecord {
  id: string
  topic: PracticeTopic
  startedAt: number
  endedAt: number
  maxHeight: number
  answered: number
  correct: number
  bestStreak: number
  endReason: 'fuel' | 'top' | 'quit'
}

export interface Sighting {
  spottedAt: number
}

export interface AppData {
  version: 3
  profile: Profile
  /** Daily Launch results by date. The first finished result for a date is final. */
  daily: Record<string, DailyResult>
  practice: PracticeRecord[]
  /** Discoveries made, by id. Never taken away. */
  discoveries: Record<string, Sighting>
}
