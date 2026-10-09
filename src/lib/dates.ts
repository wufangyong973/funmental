/** Local calendar date, YYYY-MM-DD. */
export function dateKey(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Noon on a date key, so stepping by days never trips over DST. */
export const fromKey = (key: string) => new Date(`${key}T12:00:00`)

export function addDays(key: string, n: number): string {
  const d = fromKey(key)
  d.setDate(d.getDate() + n)
  return dateKey(d)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((fromKey(b).getTime() - fromKey(a).getTime()) / 86_400_000)
}

/** Consecutive days present in `days`, ending today (or yesterday, if today isn't there yet). */
export function streak(days: Iterable<string>, today = dateKey()): number {
  const set = new Set(days)
  let d = set.has(today) ? today : addDays(today, -1)
  let n = 0
  while (set.has(d)) {
    n++
    d = addDays(d, -1)
  }
  return n
}

export function longestStreak(days: Iterable<string>): number {
  const set = new Set(days)
  let best = 0
  for (const k of set) {
    if (set.has(addDays(k, -1))) continue
    let run = 0
    for (let d = k; set.has(d); d = addDays(d, 1)) run++
    best = Math.max(best, run)
  }
  return best
}

/** Time until local midnight, e.g. "14h 22m". */
export function untilMidnight(now = new Date()): string {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  const mins = Math.max(0, Math.ceil((next.getTime() - now.getTime()) / 60_000))
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}
