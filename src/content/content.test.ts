import { describe, expect, it } from 'vitest'
import { TOPICS } from '../lib/topics'
import { BANKS, allQuestions, pool } from './questions'
import type { Difficulty } from './topics/types'

const NEEDED: Record<Difficulty, number> = { 1: 12, 2: 8, 3: 12, 4: 8, 5: 8 }

describe('question banks', () => {
  it('has a bank for every topic with enough questions at each difficulty', () => {
    for (const t of TOPICS) {
      expect(BANKS[t.id], t.id).toBeDefined()
      for (const d of [1, 2, 3, 4, 5] as Difficulty[]) expect(pool(t.id, d).length, `${t.id} difficulty ${d}`).toBeGreaterThanOrEqual(NEEDED[d])
    }
  })

  it('every question is well formed', () => {
    for (const q of allQuestions()) {
      expect(q.prompt.trim(), q.id).not.toBe('')
      expect(q.answers.every((a) => a.trim() !== ''), q.prompt).toBe(true)
      expect(new Set(q.answers.map((a) => a.trim().toLowerCase())).size, `duplicate choices: ${q.prompt}`).toBe(4)
      expect([1, 2, 3, 4, 5]).toContain(q.difficulty)
    }
  })

  it('question ids and prompts are unique', () => {
    const ids = allQuestions().map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    const prompts = allQuestions().map((q) => q.prompt.toLowerCase())
    expect(new Set(prompts).size).toBe(prompts.length)
  })
})
