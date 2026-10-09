import type { AppData } from '../types'
import { newlySpotted } from './creatures'

export function emptyData(now = Date.now()): AppData {
  return { version: 2, profile: { name: '', createdAt: now }, daily: {}, practice: [], creatures: {} }
}

/**
 * Reads any saved shape. Version 1 saves come from Funmental, the brain-gym this
 * app replaced: only the profile carries over.
 */
export function migrate(saved: unknown, now = Date.now()): AppData {
  const s = (saved && typeof saved === 'object' ? saved : {}) as Partial<AppData> & { version?: number }
  const base = emptyData(s.profile?.createdAt ?? now)
  const profile = { ...base.profile, ...s.profile }
  if (s.version !== 2) return { ...base, profile }
  const data: AppData = {
    version: 2,
    profile,
    daily: { ...s.daily },
    practice: s.practice ?? [],
    creatures: { ...s.creatures },
  }
  data.creatures = { ...data.creatures, ...newlySpotted(data, now) }
  return data
}
