import { ask, pool, type AskedQuestion } from '../content/questions'
import type { Difficulty } from '../content/topics/types'
import { addDays, dateKey, daysBetween } from './dates'
import { MAX_HEIGHT, ZONES, formatAltitude } from './space'
import { seeded, shuffle } from './rng'
import { TOPICS, type TopicId } from './topics'

/** Apogee #1 is this date. */
export const EPOCH = '2026-10-09'

export const DAILY_LENGTH = 7

/** Difficulty of each daily question, easiest first. */
export const DAILY_DIFFICULTY: Difficulty[] = [1, 1, 2, 3, 3, 4, 5]

/** Ocean zone each daily question sits in. */
export const DAILY_ZONE = DAILY_DIFFICULTY.map((d) => ZONES.findIndex((z) => z.difficulty === d))

export const dailyNumber = (key = dateKey()) => daysBetween(EPOCH, key) + 1
export const dailyDate = (n: number) => addDays(EPOCH, n - 1)

/** The topics take turns, one per day. */
export const dailyTopic = (n: number): TopicId => TOPICS[(((n - 1) % TOPICS.length) + TOPICS.length) % TOPICS.length].id

/**
 * The seven questions for dive `n`, the same on every device. Each topic's
 * questions are dealt from a fixed shuffled deck per difficulty, so a topic
 * doesn't repeat a question until it has used every one at that difficulty.
 */
export function dailyQuestions(n: number): AskedQuestion[] {
  const topic = dailyTopic(n)
  const turn = Math.floor((n - 1) / TOPICS.length) // how many times this topic has come up before
  const needed = new Map<Difficulty, number>()
  for (const d of DAILY_DIFFICULTY) needed.set(d, (needed.get(d) ?? 0) + 1)

  const picked = new Map<Difficulty, AskedQuestion['question'][]>()
  for (const [d, count] of needed) {
    const bank = pool(topic, d)
    const out = []
    for (let i = 0; i < count; i++) {
      const slot = turn * count + i
      const round = Math.floor(slot / bank.length)
      const deck = shuffle(bank, seeded(`deck:${topic}:${d}:${round}`))
      out.push(deck[slot % bank.length])
    }
    picked.set(d, out)
  }

  const rand = seeded(`daily:${n}`)
  return DAILY_DIFFICULTY.map((d) => ask(picked.get(d)!.shift()!, rand))
}

/** Each right answer climbs one milestone, so seven reach the Galactic Center. */
export function dailyHeight(answers: readonly boolean[]): number {
  return Math.min(MAX_HEIGHT, answers.filter(Boolean).length)
}

/** Wordle-style result to paste into a chat. */
export function shareText(n: number, topicName: string, answers: readonly boolean[]): string {
  const squares = answers.map((ok, i) => (ok ? ZONES[DAILY_ZONE[i]].square : '⬛')).join('')
  return `Apogee #${n} · ${topicName}\n${squares}  ${formatAltitude(dailyHeight(answers))}`
}
