import { describe, expect, it } from 'vitest'
import type { AppData, DailyResult } from '../types'
import { CREATURES, dailyStreak, newlySpotted } from './creatures'
import { DAILY_DEPTHS, DAILY_LENGTH, EPOCH, dailyDate, dailyDepth, dailyNumber, dailyQuestions, dailyTopic, shareText } from './daily'
import { emptyData, migrate } from './data'
import { addDays, longestStreak, streak } from './dates'
import { mergeAppData } from './merge'
import { MAX_DEPTH, zoneAt } from './ocean'
import { MAX_OXYGEN, answerPractice, nextPracticeQuestion, startPractice } from './practice'
import { TOPICS } from './topics'

const result = (date: string, answers: boolean[], finishedAt: number | null = 1): DailyResult => ({
  date,
  number: dailyNumber(date),
  topic: dailyTopic(dailyNumber(date)),
  answers,
  depth: dailyDepth(answers),
  startedAt: 0,
  finishedAt,
})

describe('daily dive', () => {
  it('numbers days from the epoch and rotates topics', () => {
    expect(dailyNumber(EPOCH)).toBe(1)
    expect(dailyNumber(addDays(EPOCH, 9))).toBe(10)
    expect(dailyDate(10)).toBe(addDays(EPOCH, 9))
    expect(TOPICS.map((_, i) => dailyTopic(i + 1))).toEqual(TOPICS.map((t) => t.id))
    expect(dailyTopic(TOPICS.length + 1)).toBe(TOPICS[0].id)
  })

  it('deals the same seven questions every time, easiest first', () => {
    const a = dailyQuestions(5)
    const b = dailyQuestions(5)
    expect(a).toHaveLength(DAILY_LENGTH)
    expect(a.map((q) => [q.question.id, q.choices.join('|'), q.answerIndex])).toEqual(b.map((q) => [q.question.id, q.choices.join('|'), q.answerIndex]))
    expect(a.map((q) => q.question.difficulty)).toEqual([1, 1, 2, 3, 3, 4, 5])
    for (const q of a) expect(q.choices[q.answerIndex]).toBe(q.question.answers[0])
  })

  it("doesn't repeat a question within a topic until its deck runs out", () => {
    for (const t of TOPICS.keys()) {
      const ids = Array.from({ length: 4 }, (_, turn) => dailyQuestions(t + 1 + turn * TOPICS.length).map((q) => q.question.id)).flat()
      expect(new Set(ids).size, TOPICS[t].id).toBe(ids.length)
    }
  })

  it('scores depth only for right answers, and a perfect dive reaches the bottom', () => {
    expect(DAILY_DEPTHS.reduce((a, b) => a + b, 0)).toBe(MAX_DEPTH)
    expect(dailyDepth(Array(7).fill(true))).toBe(MAX_DEPTH)
    expect(dailyDepth([true, false, true])).toBe(900)
    expect(dailyDepth([false, false, false, false, false, false, true])).toBe(4935)
  })

  it('builds a share grid', () => {
    expect(shareText(12, 'History', [true, true, true, false, true, true, false])).toBe('Fathom #12 · History\n🟨🟨🟦⬛🟪🟫⬛  4,500 m')
  })
})

describe('practice dive', () => {
  it('descends on right answers with a streak bonus, and costs oxygen on misses', () => {
    let s = startPractice()
    const gains: number[] = []
    for (let i = 0; i < 5; i++) {
      const step = answerPractice(s, true)
      gains.push(step.gained)
      s = step.state
    }
    expect(gains).toEqual([30, 30, 38, 38, 45])
    expect(s.bestStreak).toBe(5)
    s = answerPractice(s, false).state
    expect(s.oxygen).toBe(MAX_OXYGEN - 1)
    expect(s.streak).toBe(0)
  })

  it('refills a tank in each new zone and ends when the tanks are empty', () => {
    let s = { ...startPractice(), depth: 190, oxygen: 1 }
    const step = answerPractice(s, true)
    expect(step.enteredZone).toBe(1)
    expect(step.state.oxygen).toBe(2)
    s = answerPractice(answerPractice(step.state, false).state, false).state
    expect(s.over).toBe('oxygen')
    expect(answerPractice(s, true).state).toBe(s)
  })

  it('stops at the Challenger Deep', () => {
    const s = answerPractice({ ...startPractice(), depth: MAX_DEPTH - 10 }, true).state
    expect(s.depth).toBe(MAX_DEPTH)
    expect(s.over).toBe('bottom')
  })

  it('asks questions matching the zone and avoids repeats', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 8; i++) {
      const q = nextPracticeQuestion('history', 5000, seen)
      expect(q.question.difficulty).toBe(zoneAt(5000).difficulty)
      expect(seen.has(q.question.id)).toBe(false)
      seen.add(q.question.id)
    }
  })
})

describe('streaks', () => {
  it('counts consecutive days ending today or yesterday', () => {
    const today = '2026-10-20'
    expect(streak(['2026-10-18', '2026-10-19', '2026-10-20'], today)).toBe(3)
    expect(streak(['2026-10-18', '2026-10-19'], today)).toBe(2)
    expect(streak(['2026-10-17'], today)).toBe(0)
    expect(longestStreak(['2026-10-01', '2026-10-02', '2026-10-05', '2026-10-06', '2026-10-07'])).toBe(3)
  })

  it('only finished Daily Dives count', () => {
    const data: AppData = { ...emptyData(), daily: { '2026-10-19': result('2026-10-19', [true]), '2026-10-20': result('2026-10-20', [true], null) } }
    expect(dailyStreak(data, '2026-10-20')).toBe(1)
  })
})

describe('saves', () => {
  it('migrates a Funmental save to an empty Fathom save that keeps the profile', () => {
    const old = { version: 1, profile: { name: 'Sam', createdAt: 5 }, subjects: {}, sessions: [{}], activeDays: ['2026-01-01'] }
    const data = migrate(old)
    expect(data).toEqual({ ...emptyData(5), profile: { name: 'Sam', createdAt: 5 } })
  })

  it('merging keeps the first finished result for a day', () => {
    const local = { ...emptyData(), daily: { d: { ...result('2026-10-10', [true, true, true, true, true, true, true]), finishedAt: 200 } } }
    const remote = { ...emptyData(), daily: { d: { ...result('2026-10-10', [false, false, false, false, false, false, false]), finishedAt: 100 } } }
    expect(mergeAppData(local, remote).daily.d.finishedAt).toBe(100)
    expect(mergeAppData(remote, local).daily.d.finishedAt).toBe(100)
    // A finished dive beats one still in progress.
    const partial = { ...emptyData(), daily: { d: result('2026-10-10', [true, true], null) } }
    expect(mergeAppData(partial, remote).daily.d.finishedAt).toBe(100)
  })

  it('merging unions practice dives and keeps the earliest sightings', () => {
    const p = (id: string) => ({ id, topic: 'mixed' as const, startedAt: Number(id), endedAt: 0, maxDepth: 10, answered: 1, correct: 1, bestStreak: 1, endReason: 'quit' as const })
    const a = { ...emptyData(), practice: [p('1'), p('2')], creatures: { clownfish: { spottedAt: 50 } } }
    const b = { ...emptyData(), practice: [p('2'), p('3')], creatures: { clownfish: { spottedAt: 20 } } }
    const m = mergeAppData(a, b)
    expect(m.practice.map((x) => x.id)).toEqual(['3', '2', '1'])
    expect(m.creatures.clownfish.spottedAt).toBe(20)
  })
})

describe('creatures', () => {
  it('spots creatures from dive history', () => {
    const data: AppData = { ...emptyData(), daily: { '2026-10-10': result('2026-10-10', Array(7).fill(true)) } }
    const found = Object.keys(newlySpotted(data))
    expect(found).toEqual(expect.arrayContaining(['clownfish', 'dolphin', 'moon-jelly', 'vampire-squid', 'anglerfish', 'snailfish', 'amphipod']))
    expect(found).not.toContain('challenger')
  })

  it('every creature has a unique id', () => {
    expect(new Set(CREATURES.map((c) => c.id)).size).toBe(CREATURES.length)
  })
})
