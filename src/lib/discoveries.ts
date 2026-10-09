import type { AppData, Sighting } from '../types'
import { streak, longestStreak } from './dates'
import { MAX_HEIGHT, type Zone } from './space'

export interface DiscoveryDef {
  id: string
  name: string
  zone: Zone['id']
  /** How to find it, shown while it's still missing. */
  hint: string
  fact: string
  /** Only reachable in Practice. */
  practiceOnly?: boolean
  found: (data: AppData) => boolean
}

const finishedDailies = (d: AppData) => Object.values(d.daily).filter((r) => r.finishedAt !== null)
const highest = (d: AppData) => Math.max(0, ...Object.values(d.daily).map((r) => r.height), ...d.practice.map((p) => p.maxHeight))
const bestStreak = (d: AppData) => longestStreak(finishedDailies(d).map((r) => r.date))

/**
 * Everything on the star chart. Each one is checked after every change and
 * added as soon as its condition holds, including for older saves.
 */
export const DISCOVERIES: DiscoveryDef[] = [
  {
    id: 'sputnik', name: 'Sputnik 1', zone: 'near',
    hint: 'Finish your first launch.',
    fact: 'The first satellite, launched in 1957, beeped its way around Earth for three weeks.',
    found: (d) => finishedDailies(d).length > 0 || d.practice.length > 0,
  },
  {
    id: 'iss', name: 'Space Station', zone: 'near',
    hint: 'Launch three days in a row.',
    fact: 'The ISS circles Earth every 90 minutes, so its crew sees 16 sunrises a day.',
    found: (d) => bestStreak(d) >= 3,
  },
  {
    id: 'hubble', name: 'Hubble Telescope', zone: 'near',
    hint: 'Get 5 or more right in one Daily Launch.',
    fact: 'Hubble orbits about 540 km up, above the blur of the atmosphere.',
    found: (d) => finishedDailies(d).some((r) => r.answers.filter(Boolean).length >= 5),
  },
  {
    id: 'moon', name: 'The Moon', zone: 'lunar',
    hint: 'Reach the Moon.',
    fact: 'The Moon drifts about 3.8 cm farther from Earth every year.',
    found: (d) => highest(d) >= 3,
  },
  {
    id: 'lunar-lander', name: 'Lunar Lander', zone: 'lunar',
    hint: 'Launch seven days in a row.',
    fact: 'Twelve people walked on the Moon between 1969 and 1972.',
    found: (d) => bestStreak(d) >= 7,
  },
  {
    id: 'mars', name: 'Mars', zone: 'planets',
    hint: 'Reach Mars.',
    fact: 'Olympus Mons on Mars is about two and a half times as tall as Mount Everest.',
    found: (d) => highest(d) >= 4,
  },
  {
    id: 'saturn', name: 'Saturn', zone: 'planets',
    hint: 'Finish 10 Daily Launches.',
    fact: 'Saturn is so light for its size that it would float in a big enough bathtub.',
    found: (d) => finishedDailies(d).length >= 10,
  },
  {
    id: 'jupiter', name: 'Jupiter', zone: 'planets',
    hint: 'Get halfway from Mars to Neptune in Practice.',
    fact: "Jupiter's Great Red Spot is a storm wider than Earth that has raged for centuries.",
    practiceOnly: true,
    found: (d) => d.practice.some((p) => p.maxHeight >= 4.5),
  },
  {
    id: 'neptune', name: 'Neptune', zone: 'planets',
    hint: 'Reach Neptune.',
    fact: 'Neptune has the fastest winds in the solar system, over 2,000 km/h.',
    found: (d) => highest(d) >= 5,
  },
  {
    id: 'voyager', name: 'Voyager 1', zone: 'interstellar',
    hint: 'Launch 14 days in a row.',
    fact: 'Launched in 1977, Voyager 1 is the farthest human-made object from Earth.',
    found: (d) => bestStreak(d) >= 14,
  },
  {
    id: 'comet', name: 'Comet', zone: 'interstellar',
    hint: 'Get 10 right in a row in Practice.',
    fact: "A comet's tail always points away from the Sun, whichever way the comet is moving.",
    practiceOnly: true,
    found: (d) => d.practice.some((p) => p.bestStreak >= 10),
  },
  {
    id: 'proxima', name: 'Proxima Centauri', zone: 'interstellar',
    hint: 'Reach Proxima Centauri.',
    fact: 'The nearest star to the Sun. Its light takes 4.2 years to reach us.',
    found: (d) => highest(d) >= 6,
  },
  {
    id: 'galactic-center', name: 'Galactic Center', zone: 'galaxy',
    hint: 'Get a perfect 7/7 Daily Launch.',
    fact: 'The heart of the Milky Way is hidden from our eyes by thick clouds of dust.',
    found: (d) => finishedDailies(d).some((r) => r.answers.length === 7 && r.answers.every(Boolean)),
  },
  {
    id: 'black-hole', name: 'Sagittarius A*', zone: 'galaxy',
    hint: 'Reach the Galactic Center in Practice.',
    fact: 'The black hole at the center of our galaxy is about 4 million times as massive as the Sun.',
    practiceOnly: true,
    found: (d) => d.practice.some((p) => p.maxHeight >= MAX_HEIGHT),
  },
]

export const discoveryById = (id: string) => DISCOVERIES.find((c) => c.id === id)

/** Discoveries whose conditions now hold but that aren't on the star chart yet. */
export function newlyFound(data: AppData, now = Date.now()): Record<string, Sighting> {
  const out: Record<string, Sighting> = {}
  for (const c of DISCOVERIES) if (!data.discoveries[c.id] && c.found(data)) out[c.id] = { spottedAt: now }
  return out
}

/** Current daily streak: consecutive days with a finished Daily Launch. */
export const dailyStreak = (data: AppData, today?: string) => streak(finishedDailies(data).map((r) => r.date), today)
export const longestDailyStreak = bestStreak
