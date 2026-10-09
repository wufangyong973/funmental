import type { Difficulty } from '../content/topics/types'

export interface Zone {
  id: 'sunlight' | 'twilight' | 'midnight' | 'abyss' | 'hadal'
  name: string
  top: number
  bottom: number
  difficulty: Difficulty
  /** Share-grid square for a right answer in this zone. */
  square: string
  /** Water color at the top and bottom of the zone. */
  colors: [string, string]
}

/** The bottom of the Challenger Deep, in meters. */
export const MAX_DEPTH = 10_935

export const ZONES: Zone[] = [
  { id: 'sunlight', name: 'Sunlight Zone', top: 0, bottom: 200, difficulty: 1, square: '🟨', colors: ['#1c8fcf', '#0a6fae'] },
  { id: 'twilight', name: 'Twilight Zone', top: 200, bottom: 1000, difficulty: 2, square: '🟦', colors: ['#0a6fae', '#0b3d74'] },
  { id: 'midnight', name: 'Midnight Zone', top: 1000, bottom: 4000, difficulty: 3, square: '🟪', colors: ['#0b3d74', '#0a1838'] },
  { id: 'abyss', name: 'Abyss', top: 4000, bottom: 6000, difficulty: 4, square: '🟫', colors: ['#0a1838', '#060c20'] },
  { id: 'hadal', name: 'Hadal Zone', top: 6000, bottom: MAX_DEPTH, difficulty: 5, square: '🟥', colors: ['#060c20', '#020308'] },
]

export function zoneIndexAt(depth: number): number {
  const i = ZONES.findIndex((z) => depth < z.bottom)
  return i === -1 ? ZONES.length - 1 : i
}

export const zoneAt = (depth: number) => ZONES[zoneIndexAt(depth)]

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(' ')})`
}

/** Water color at a depth, blending within the zone. */
export function waterColor(depth: number): string {
  const z = zoneAt(depth)
  const t = Math.min(1, Math.max(0, (depth - z.top) / (z.bottom - z.top)))
  return mix(z.colors[0], z.colors[1], t)
}

export const formatDepth = (m: number) => `${Math.round(m).toLocaleString('en-US')} m`

/** Plain-words difficulty, shown on each question. */
export const DIFFICULTY_NAMES = ['', 'Easy', 'Medium', 'Tricky', 'Hard', 'Expert'] as const
