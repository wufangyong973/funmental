import type { AppData, CreatureSighting } from '../types'
import { streak, longestStreak } from './dates'
import { MAX_DEPTH, type Zone } from './ocean'

export interface CreatureDef {
  id: string
  name: string
  emoji: string
  zone: Zone['id']
  /** How to spot it, shown while it's still missing. */
  hint: string
  fact: string
  /** Only reachable in Practice. */
  practiceOnly?: boolean
  spotted: (data: AppData) => boolean
}

const finishedDailies = (d: AppData) => Object.values(d.daily).filter((r) => r.finishedAt !== null)
const deepest = (d: AppData) => Math.max(0, ...Object.values(d.daily).map((r) => r.depth), ...d.practice.map((p) => p.maxDepth))
const bestStreak = (d: AppData) => longestStreak(finishedDailies(d).map((r) => r.date))

/**
 * Every creature in the logbook. Each one is checked after every change and
 * added as soon as its condition holds, including for older saves.
 */
export const CREATURES: CreatureDef[] = [
  {
    id: 'clownfish', name: 'Clownfish', emoji: '🐠', zone: 'sunlight',
    hint: 'Finish your first dive.',
    fact: 'Clownfish live among stinging anemones, protected by a layer of mucus.',
    spotted: (d) => finishedDailies(d).length > 0 || d.practice.length > 0,
  },
  {
    id: 'sea-turtle', name: 'Sea Turtle', emoji: '🐢', zone: 'sunlight',
    hint: 'Dive three days in a row.',
    fact: 'Female sea turtles return to the beach where they hatched to lay their eggs.',
    spotted: (d) => bestStreak(d) >= 3,
  },
  {
    id: 'dolphin', name: 'Bottlenose Dolphin', emoji: '🐬', zone: 'sunlight',
    hint: 'Get 5 or more right in one Daily Dive.',
    fact: 'Dolphins sleep with one half of their brain at a time.',
    spotted: (d) => finishedDailies(d).some((r) => r.answers.filter(Boolean).length >= 5),
  },
  {
    id: 'moon-jelly', name: 'Moon Jellyfish', emoji: '🪼', zone: 'twilight',
    hint: 'Reach the Twilight Zone (200 m).',
    fact: 'Moon jellies have no brain, heart or bones, and are about 95% water.',
    spotted: (d) => deepest(d) >= 200,
  },
  {
    id: 'lanternfish', name: 'Lanternfish', emoji: '🐟', zone: 'twilight',
    hint: 'Dive seven days in a row.',
    fact: 'Lanternfish rise to the surface every night in the largest migration on Earth.',
    spotted: (d) => bestStreak(d) >= 7,
  },
  {
    id: 'vampire-squid', name: 'Vampire Squid', emoji: '🦑', zone: 'midnight',
    hint: 'Reach the Midnight Zone (1,000 m).',
    fact: 'Despite the name, the vampire squid eats drifting "marine snow", not blood.',
    spotted: (d) => deepest(d) >= 1000,
  },
  {
    id: 'firefly-squid', name: 'Firefly Squid', emoji: '✨', zone: 'midnight',
    hint: 'Finish 10 Daily Dives.',
    fact: 'Firefly squid flash blue light from hundreds of tiny organs on their bodies.',
    spotted: (d) => finishedDailies(d).length >= 10,
  },
  {
    id: 'sperm-whale', name: 'Sperm Whale', emoji: '🐋', zone: 'midnight',
    hint: 'Reach 2,500 m in Practice.',
    fact: 'Sperm whales dive over 2 km deep to hunt giant squid.',
    practiceOnly: true,
    spotted: (d) => d.practice.some((p) => p.maxDepth >= 2500),
  },
  {
    id: 'anglerfish', name: 'Anglerfish', emoji: '🎣', zone: 'abyss',
    hint: 'Reach the Abyss (4,000 m).',
    fact: 'The anglerfish\'s glowing lure is lit by bacteria living inside it.',
    spotted: (d) => deepest(d) >= 4000,
  },
  {
    id: 'dumbo-octopus', name: 'Dumbo Octopus', emoji: '🐙', zone: 'abyss',
    hint: 'Dive 14 days in a row.',
    fact: 'Dumbo octopuses "fly" through the deep by flapping ear-like fins.',
    spotted: (d) => bestStreak(d) >= 14,
  },
  {
    id: 'gulper-eel', name: 'Gulper Eel', emoji: '🐍', zone: 'abyss',
    hint: 'Get 10 right in a row in Practice.',
    fact: 'A gulper eel\'s mouth can open wide enough to swallow prey bigger than itself.',
    practiceOnly: true,
    spotted: (d) => d.practice.some((p) => p.bestStreak >= 10),
  },
  {
    id: 'snailfish', name: 'Snailfish', emoji: '🐡', zone: 'hadal',
    hint: 'Reach the Hadal Zone (6,000 m).',
    fact: 'Snailfish have been filmed over 8,000 m down, deeper than any other fish.',
    spotted: (d) => deepest(d) >= 6000,
  },
  {
    id: 'amphipod', name: 'Giant Amphipod', emoji: '🦐', zone: 'hadal',
    hint: 'Get a perfect 7/7 Daily Dive.',
    fact: 'Supergiant amphipods in the trenches grow up to 30 cm long.',
    spotted: (d) => finishedDailies(d).some((r) => r.answers.length === 7 && r.answers.every(Boolean)),
  },
  {
    id: 'challenger', name: 'Challenger Deep', emoji: '🏆', zone: 'hadal',
    hint: 'Touch the bottom in Practice.',
    fact: 'Only a handful of people have ever visited the deepest point on Earth.',
    practiceOnly: true,
    spotted: (d) => d.practice.some((p) => p.maxDepth >= MAX_DEPTH),
  },
]

export const creatureById = (id: string) => CREATURES.find((c) => c.id === id)

/** Creatures whose conditions now hold but that aren't in the logbook yet. */
export function newlySpotted(data: AppData, now = Date.now()): Record<string, CreatureSighting> {
  const out: Record<string, CreatureSighting> = {}
  for (const c of CREATURES) if (!data.creatures[c.id] && c.spotted(data)) out[c.id] = { spottedAt: now }
  return out
}

/** Current daily streak: consecutive days with a finished Daily Dive. */
export const dailyStreak = (data: AppData, today?: string) => streak(finishedDailies(data).map((r) => r.date), today)
export const longestDailyStreak = bestStreak
