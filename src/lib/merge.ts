import type { AppData, DailyResult } from '../types'
import { migrate } from './data'

export const MAX_PRACTICE = 500

/** The first finished result for a date wins, so a day can't be replayed on another device. */
function pickDaily(a: DailyResult, b: DailyResult): DailyResult {
  if (a.finishedAt !== null && b.finishedAt !== null) return b.finishedAt < a.finishedAt ? b : a
  if (a.finishedAt !== null) return a
  if (b.finishedAt !== null) return b
  return b.answers.length > a.answers.length ? b : a
}

/** Combines two copies of a save (this browser and the account) without losing anything. */
export function mergeAppData(local: AppData, remote: AppData): AppData {
  const daily: AppData['daily'] = { ...remote.daily }
  for (const [date, r] of Object.entries(local.daily)) daily[date] = daily[date] ? pickDaily(r, daily[date]) : r

  const byId = new Map([...remote.practice, ...local.practice].map((p) => [p.id, p]))
  const practice = [...byId.values()].sort((x, y) => y.startedAt - x.startedAt).slice(0, MAX_PRACTICE)

  const creatures: AppData['creatures'] = { ...remote.creatures }
  for (const [id, c] of Object.entries(local.creatures)) {
    if (!creatures[id] || c.spottedAt < creatures[id].spottedAt) creatures[id] = c
  }

  return migrate({
    version: 2,
    profile: {
      name: local.profile.name || remote.profile.name,
      createdAt: Math.min(local.profile.createdAt, remote.profile.createdAt),
    },
    daily,
    practice,
    creatures,
  })
}
