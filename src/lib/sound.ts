import { useSyncExternalStore } from 'react'

/**
 * Small synthesized sound effects plus haptics for answering questions. Everything
 * is generated with Web Audio, so there are no audio files to load, and sounds
 * start instantly on phones. One toggle covers both sound and vibration.
 */

export type Sound = 'tap' | 'submit' | 'correct' | 'wrong' | 'levelUp' | 'complete' | 'badge'

const KEY = 'funmental:sound'

function loadOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off'
  } catch {
    return true
  }
}

let on = loadOn()
const listeners = new Set<() => void>()

export function useSoundOn(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => on,
  )
}

export function setSoundOn(next: boolean) {
  on = next
  try {
    localStorage.setItem(KEY, next ? 'on' : 'off')
  } catch {
    // Storage unavailable; the choice lasts for this visit.
  }
  listeners.forEach((l) => l())
  if (next) play('tap')
}

let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || !window.AudioContext) return null
  // Created lazily from a tap so mobile browsers allow it to play.
  ctx ??= new AudioContext()
  // Phones suspend the context when the tab is backgrounded.
  if (ctx.state !== 'running') void ctx.resume().catch(() => {})
  return ctx
}

interface Note {
  freq: number
  /** Seconds after the sound starts. */
  at: number
  dur: number
  type?: OscillatorType
  gain?: number
  /** Glide to this frequency over the note. */
  to?: number
}

function notes(list: Note[]) {
  const ac = audio()
  if (!ac) return
  const now = ac.currentTime + 0.01
  for (const n of list) {
    const osc = ac.createOscillator()
    const amp = ac.createGain()
    const start = now + n.at
    const end = start + n.dur
    osc.type = n.type ?? 'sine'
    osc.frequency.setValueAtTime(n.freq, start)
    if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, end)
    // Quick attack and a smooth decay keep it soft in headphones.
    const peak = n.gain ?? 0.18
    amp.gain.setValueAtTime(0.0001, start)
    amp.gain.exponentialRampToValueAtTime(peak, start + 0.012)
    amp.gain.exponentialRampToValueAtTime(0.0001, end)
    osc.connect(amp).connect(ac.destination)
    osc.start(start)
    osc.stop(end + 0.02)
  }
}

const C5 = 523.25
const B5 = 987.77
const E5 = 659.25
const G5 = 783.99
const C6 = 1046.5
const E6 = 1318.5
const G6 = 1568

const SOUNDS: Record<Sound, Note[]> = {
  tap: [{ freq: 880, at: 0, dur: 0.05, type: 'triangle', gain: 0.1 }],
  submit: [{ freq: 600, to: 760, at: 0, dur: 0.08, type: 'triangle', gain: 0.12 }],
  correct: [
    { freq: B5, at: 0, dur: 0.1, type: 'triangle' },
    { freq: E6, at: 0.08, dur: 0.22, type: 'triangle' },
  ],
  wrong: [
    { freq: 220, to: 180, at: 0, dur: 0.14, type: 'sawtooth', gain: 0.07 },
    { freq: 185, to: 140, at: 0.13, dur: 0.24, type: 'sawtooth', gain: 0.07 },
  ],
  levelUp: [C5, E5, G5, C6].map((freq, i) => ({ freq, at: 0.25 + i * 0.09, dur: 0.18, type: 'square' as const, gain: 0.06 })),
  complete: [
    { freq: G5, at: 0, dur: 0.14, type: 'triangle' },
    { freq: C6, at: 0.12, dur: 0.14, type: 'triangle' },
    { freq: E6, at: 0.24, dur: 0.14, type: 'triangle' },
    { freq: G6, at: 0.36, dur: 0.4, type: 'triangle' },
  ],
  badge: [
    { freq: C6, at: 0, dur: 0.3, gain: 0.12 },
    { freq: E6, at: 0.07, dur: 0.3, gain: 0.12 },
    { freq: G6, at: 0.14, dur: 0.5, gain: 0.12 },
  ],
}

const VIBRATE: Partial<Record<Sound, number | number[]>> = {
  tap: 8,
  submit: 12,
  correct: 25,
  wrong: [40, 50, 40],
  levelUp: [20, 40, 20, 40, 60],
  complete: [30, 40, 60],
  badge: [20, 30, 20],
}

export function play(sound: Sound) {
  if (!on) return
  try {
    notes(SOUNDS[sound])
  } catch {
    // Audio unsupported or blocked; stay silent.
  }
  const pattern = VIBRATE[sound]
  if (pattern !== undefined && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Some browsers throw when vibration isn't allowed.
    }
  }
}
