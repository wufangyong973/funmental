import { useSyncExternalStore } from 'react'
import type { AppData, DailyResult, PracticeRecord } from '../types'
import { newlyFound } from './discoveries'
import { emptyData, migrate } from './data'
import { MAX_PRACTICE } from './merge'

// Kept from Fathom so existing saves load; they're migrated on read.
const KEY = 'fathom:v1'
/** Funmental's save; its profile is carried over on first load. */
const LEGACY_KEY = 'funmental:v1'

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY)
    return raw ? migrate(JSON.parse(raw)) : emptyData()
  } catch {
    return emptyData()
  }
}

let data: AppData = load()
const listeners = new Set<() => void>()

// Discoveries made during this visit, waiting to be shown.
let toasts: string[] = []
const toastListeners = new Set<() => void>()

/** Saves the next state and adds any discoveries it now qualifies for. */
function commit(next: AppData, { announce = true } = {}) {
  const found = newlyFound(next)
  const ids = Object.keys(found)
  if (ids.length) next = { ...next, discoveries: { ...next.discoveries, ...found } }
  data = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage unavailable (private mode, quota); keep in-memory state.
  }
  listeners.forEach((l) => l())
  if (announce && ids.length) {
    toasts = [...toasts, ...ids]
    toastListeners.forEach((l) => l())
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, () => data)
}

export const getData = () => data

/** Notified after every change; used by cloud sync. */
export const subscribeAppData = subscribe

/** Replace local data with a merged copy from sync. Discoveries found by the merge aren't announced. */
export function replaceAppData(next: AppData) {
  commit(next, { announce: false })
}

export function useDiscoveryToasts(): string[] {
  return useSyncExternalStore(
    (l) => {
      toastListeners.add(l)
      return () => toastListeners.delete(l)
    },
    () => toasts,
  )
}

export function dismissDiscoveryToast(id: string) {
  toasts = toasts.filter((t) => t !== id)
  toastListeners.forEach((l) => l())
}

/** Starts today's launch, or returns the one already under way. */
export function startDaily(date: string, number: number, topic: DailyResult['topic']): DailyResult {
  const existing = data.daily[date]
  if (existing) return existing
  const result: DailyResult = { date, number, topic, answers: [], height: 0, startedAt: Date.now(), finishedAt: null }
  commit({ ...data, daily: { ...data.daily, [date]: result } })
  return result
}

/** Records one answer. Each answer is saved as it happens, so a reload can't re-roll a question. */
export function answerDaily(date: string, correct: boolean, height: number, total: number) {
  const r = data.daily[date]
  if (!r || r.finishedAt !== null) return
  const answers = [...r.answers, correct]
  const finishedAt = answers.length >= total ? Date.now() : null
  commit({ ...data, daily: { ...data.daily, [date]: { ...r, answers, height, finishedAt } } })
}

export function addPractice(record: PracticeRecord) {
  commit({ ...data, practice: [record, ...data.practice].slice(0, MAX_PRACTICE) })
}

export function setProfileName(name: string) {
  commit({ ...data, profile: { ...data.profile, name: name.trim().slice(0, 40) } })
}

export function resetAll() {
  toasts = []
  commit(emptyData(), { announce: false })
}
