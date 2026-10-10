import { describe, expect, it } from 'vitest'
import { dailyQuestions } from '../lib/daily'
import { COUNTRIES, LOOKALIKE_FLAGS } from './countries'
import { allPictureQuestions, picturePool } from './pictures'
import type { Difficulty } from './topics/types'

describe('picture questions', () => {
  it('has a picture for every question, bundled in public/', () => {
    const bundled = new Set(Object.keys(import.meta.glob('/public/geo/**/*.svg')).map((f) => f.replace(/^\/public/, '')))
    for (const q of allPictureQuestions()) expect(bundled.has(q.image!.src), q.id).toBe(true)
  })

  it('every question has four different countries, with the right one first', () => {
    for (const q of allPictureQuestions()) {
      expect(new Set(q.answers).size, q.id).toBe(4)
      expect(q.answers[0]).toBe(COUNTRIES.find((c) => q.id.endsWith(`-${c[0]}`))![1])
    }
  })

  it("doesn't give the answer away in the picture's address or description", () => {
    for (const q of allPictureQuestions()) {
      expect(q.image!.src.toLowerCase()).not.toContain(q.answers[0].toLowerCase())
      expect(q.image!.alt.toLowerCase()).not.toContain(q.answers[0].toLowerCase())
    }
  })

  it('offers lookalike flags as wrong answers', () => {
    const chad = allPictureQuestions().find((q) => q.id === 'geography-flag-td')!
    expect(chad.answers).toContain('Romania')
  })

  it('only lists lookalikes that are in the country list', () => {
    const codes = new Set(COUNTRIES.map((c) => c[0]))
    for (const g of LOOKALIKE_FLAGS) for (const c of g) expect(codes.has(c), c).toBe(true)
  })

  it('every launch has one flag and one country outline', () => {
    for (let n = 1; n <= 20; n++) {
      const kinds = dailyQuestions(n).map((q) => q.question.image?.kind).filter(Boolean)
      expect(kinds.sort(), `day ${n}`).toEqual(['flag', 'outline'])
    }
  })

  it('has pictures at every difficulty', () => {
    for (const d of [1, 2, 3, 4, 5] as Difficulty[]) {
      expect(picturePool('flag', d).length, `flag ${d}`).toBeGreaterThan(0)
      expect(picturePool('outline', d).length, `outline ${d}`).toBeGreaterThan(0)
    }
  })
})
