import { useSyncExternalStore } from 'react'
import type { AppData } from '../types'
import { emptyData, migrate } from './data'
import { mergeAppData } from './merge'
import { getData, replaceAppData, subscribeAppData } from './store'

/**
 * Optional cloud sync. The app is local-first: without a server or an account,
 * nothing here runs and progress stays in this browser. When signed in, local
 * changes are pushed in the background, and the server's copy is merged in on
 * sign-in and whenever two devices race (the server rejects stale versions).
 */

export interface SyncUser {
  id: string
  email: string
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

export interface SyncState {
  /** null until checked; false when there's no API (e.g. a static-only deploy). */
  available: boolean | null
  user: SyncUser | null
  /** Whether the signed-in account has bought the full game (Practice). */
  unlocked: boolean
  status: SyncStatus
  lastSyncedAt: number | null
  error: string | null
}

const OWNER_KEY = 'fathom:sync-owner'
const PUSH_DELAY_MS = 1500
const MAX_CONFLICT_RETRIES = 3

let state: SyncState = { available: null, user: null, unlocked: false, status: 'idle', lastSyncedAt: null, error: null }
const listeners = new Set<() => void>()

let version = 0
let applying = false
let pushTimer: ReturnType<typeof setTimeout> | undefined
let inFlight = false
let pendingAfterFlight = false
let started = false

function set(patch: Partial<SyncState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export function useSync(): SyncState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}

// ---------- helpers ----------

class Unavailable extends Error {}

async function api(method: string, path: string, body?: unknown): Promise<{ status: number; data: any }> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  try {
    return { status: res.status, data: text ? JSON.parse(text) : null }
  } catch {
    // A static host answers /api/* with index.html: there is no backend.
    throw new Unavailable()
  }
}

/** JSON with sorted keys, so copies that differ only in key order (Postgres jsonb) compare equal. */
function stable(value: unknown): string {
  return JSON.stringify(value, (_k, v) =>
    v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v,
  )
}

function readOwner(): string | null {
  try {
    return localStorage.getItem(OWNER_KEY)
  } catch {
    return null
  }
}

function writeOwner(id: string) {
  try {
    localStorage.setItem(OWNER_KEY, id)
  } catch {
    // ignore
  }
}

function applyLocally(save: AppData) {
  applying = true
  try {
    replaceAppData(save)
  } finally {
    applying = false
  }
}

function signedOut() {
  clearTimeout(pushTimer)
  version = 0
  set({ user: null, unlocked: false, status: 'idle', error: null })
}

// ---------- sync ----------

/** Fetch the account's save and merge it with this browser's progress. */
async function pull() {
  const user = state.user
  if (!user) return
  set({ status: 'syncing' })
  try {
    const res = await api('GET', '/save')
    if (res.status === 401) return signedOut()
    if (res.status !== 200) return set({ status: 'error', error: res.data?.error ?? 'Could not load your saved progress.' })

    const remote: AppData | null = res.data.save ? migrate(res.data.save) : null

    // Local progress that already belongs to another account must not leak into this one.
    const owner = readOwner()
    const mine = owner === null || owner === user.id
    const save = mine ? (remote ? mergeAppData(getData(), remote) : getData()) : (remote ?? emptyData())

    writeOwner(user.id)
    version = res.data.version
    applyLocally(save)

    if (stable(save) !== stable(res.data.save)) await push()
    else set({ status: 'synced', lastSyncedAt: Date.now(), error: null })
  } catch (e) {
    set(e instanceof Unavailable ? { available: false } : { status: 'offline' })
  }
}

/** Send the full local state. On a version conflict, merge the server's copy and retry. */
async function push(attempt = 0): Promise<void> {
  if (!state.user) return
  if (inFlight) {
    pendingAfterFlight = true
    return
  }
  inFlight = true
  set({ status: 'syncing' })
  let retry = false
  try {
    const res = await api('PUT', '/save', { save: getData(), baseVersion: version })
    if (res.status === 200) {
      version = res.data.version
      set({ status: 'synced', lastSyncedAt: Date.now(), error: null })
    } else if (res.status === 409) {
      version = res.data.version
      applyLocally(res.data.save ? mergeAppData(getData(), migrate(res.data.save)) : getData())
      retry = attempt < MAX_CONFLICT_RETRIES
      if (!retry) set({ status: 'error', error: 'Sync kept conflicting. It will try again on your next change.' })
    } else if (res.status === 401) {
      signedOut()
    } else {
      set({ status: 'error', error: res.data?.error ?? 'Sync failed.' })
    }
  } catch (e) {
    set(e instanceof Unavailable ? { available: false } : { status: 'offline' })
  } finally {
    inFlight = false
  }
  if (retry) return push(attempt + 1)
  if (pendingAfterFlight) {
    pendingAfterFlight = false
    schedulePush(0)
  }
}

function schedulePush(delay = PUSH_DELAY_MS) {
  clearTimeout(pushTimer)
  pushTimer = setTimeout(() => void push(), delay)
}

function onLocalChange() {
  if (!applying && state.user) schedulePush()
}

/** Call once at startup. Detects the API and resumes an existing session. */
export async function initSync() {
  if (started) return
  started = true
  subscribeAppData(onLocalChange)
  window.addEventListener('online', () => state.user && schedulePush(0))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && pushTimer && state.user) {
      clearTimeout(pushTimer)
      void push()
    }
  })

  try {
    const res = await api('GET', '/me')
    if (res.status === 200) {
      set({ available: true, user: res.data.user, unlocked: !!res.data.unlocked })
      await pull()
    } else {
      set({ available: res.status === 401 })
    }
  } catch {
    set({ available: false })
  }
}

async function authenticate(path: string, email: string, password: string): Promise<string | null> {
  try {
    const res = await api('POST', path, { email, password })
    if (res.status !== 200 && res.status !== 201) return res.data?.error ?? 'Something went wrong.'
    set({ user: res.data.user, unlocked: !!res.data.unlocked, error: null })
    await pull()
    return null
  } catch (e) {
    if (e instanceof Unavailable) set({ available: false })
    return "Couldn't reach the server. Check your connection and try again."
  }
}

/** Returns an error message, or null on success. */
export const signUp = (email: string, password: string) => authenticate('/auth/signup', email, password)
export const logIn = (email: string, password: string) => authenticate('/auth/login', email, password)

/** Signs out. Progress stays in this browser. */
export async function logOut() {
  if (pushTimer) {
    clearTimeout(pushTimer)
    await push()
  }
  try {
    await api('POST', '/auth/logout', {})
  } catch {
    // Signing out locally still makes sense if the server is unreachable.
  }
  signedOut()
}

/**
 * Development only: unlock Practice for the signed-in account without paying.
 * The server refuses this in production. Returns an error message, or null.
 */
export async function devUnlock(): Promise<string | null> {
  try {
    const res = await api('POST', '/dev/unlock', {})
    if (res.status !== 200) return res.data?.error ?? 'Could not unlock.'
    set({ unlocked: true })
    return null
  } catch {
    return "Couldn't reach the server."
  }
}
