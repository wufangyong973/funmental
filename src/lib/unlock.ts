import { useSyncExternalStore } from 'react'
import { useSync } from './sync'

/**
 * Practice is part of the full game, a one-time purchase tied to an account.
 * Payments aren't wired up yet; until then development builds can unlock it
 * locally (add ?unlock=1 to the URL, or use the switch on the unlock page) and
 * a dev server can unlock a signed-in account.
 */

const KEY = 'fathom:dev-unlock'
const DEV = import.meta.env.DEV

function readLocal(): boolean {
  if (!DEV) return false
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

let local = readLocal()
const listeners = new Set<() => void>()

export function setDevUnlocked(on: boolean) {
  if (!DEV) return
  local = on
  try {
    if (on) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  listeners.forEach((l) => l())
}

if (DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('unlock') === '1') setDevUnlocked(true)

export const canDevUnlock = DEV

export function useUnlocked(): boolean {
  const sync = useSync()
  const dev = useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => local,
  )
  return sync.unlocked || dev
}
