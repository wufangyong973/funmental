import { useState } from 'react'
import { AccountPanel } from '../components/AccountPanel'
import { Avatar } from '../components/Avatar'
import { CREATURES, dailyStreak, longestDailyStreak } from '../lib/creatures'
import { addDays, dateKey, fromKey } from '../lib/dates'
import { MAX_DEPTH, ZONES, formatDepth, zoneAt } from '../lib/ocean'
import { setSoundOn, useSoundOn } from '../lib/sound'
import { resetAll, setProfileName, useAppData } from '../lib/store'
import { MIXED, TOPICS } from '../lib/topics'

const CALENDAR_WEEKS = 6

export function Logbook() {
  const data = useAppData()
  const finished = Object.values(data.daily).filter((r) => r.finishedAt !== null)
  const deepest = Math.max(0, ...finished.map((r) => r.depth), ...data.practice.map((p) => p.maxDepth))
  const perfect = finished.filter((r) => r.depth >= MAX_DEPTH).length
  const spotted = CREATURES.filter((c) => data.creatures[c.id]).length

  const tiles = [
    { label: 'day streak', value: `🔥 ${dailyStreak(data)}` },
    { label: 'longest streak', value: String(longestDailyStreak(data)) },
    { label: 'daily dives', value: String(finished.length) },
    { label: 'perfect dives', value: String(perfect) },
    { label: 'deepest', value: formatDepth(deepest) },
    { label: 'practice dives', value: String(data.practice.length) },
  ]

  return (
    <div className="page logbook">
      <section className="panel profile-header">
        <Avatar name={data.profile.name} size="lg" />
        <div>
          <NameEditor name={data.profile.name} />
          <p className="muted">
            Diving since {new Date(data.profile.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      <section className="tiles">
        {tiles.map((t) => (
          <div key={t.label} className="stat">
            <strong>{t.value}</strong>
            <span className="muted small">{t.label}</span>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2>Daily Dives</h2>
        <DiveCalendar daily={data.daily} />
      </section>

      <section className="panel">
        <div className="section-head">
          <h2>Creatures</h2>
          <span className="muted small">
            {spotted} of {CREATURES.length} spotted
          </span>
        </div>
        {ZONES.map((z) => (
          <div key={z.id} className="creature-zone">
            <h3>{z.name}</h3>
            <div className="creature-grid">
              {CREATURES.filter((c) => c.zone === z.id).map((c) => {
                const seen = data.creatures[c.id]
                return (
                  <div key={c.id} className={`creature ${seen ? 'seen' : 'unseen'}`}>
                    <span className="creature-emoji" aria-hidden>
                      {seen ? c.emoji : '❔'}
                    </span>
                    <strong>{seen ? c.name : '???'}</strong>
                    <span className="muted small">{seen ? c.fact : c.hint}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {data.practice.length > 0 && (
        <section className="panel">
          <h2>Practice bests</h2>
          <ul className="bests">
            {[MIXED, ...TOPICS].map((t) => {
              const best = Math.max(0, ...data.practice.filter((p) => p.topic === t.id).map((p) => p.maxDepth))
              return (
                <li key={t.id}>
                  <span>
                    {t.emoji} {t.name}
                  </span>
                  <span className="muted">{best ? formatDepth(best) : '—'}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <AccountPanel />

      <section className="panel settings">
        <h2>Settings</h2>
        <SoundSetting />
        <ResetButton />
      </section>
    </div>
  )
}

function DiveCalendar({ daily }: { daily: ReturnType<typeof useAppData>['daily'] }) {
  const today = dateKey()
  const start = addDays(today, -(fromKey(today).getDay() + (CALENDAR_WEEKS - 1) * 7))
  const days = Array.from({ length: CALENDAR_WEEKS * 7 }, (_, i) => addDays(start, i))
  return (
    <div className="calendar" role="list">
      {days.map((d) => {
        const r = daily[d]
        const future = d > today
        const cls = future ? 'future' : !r?.finishedAt ? 'empty' : r.depth === 0 ? 'surface' : `z-${zoneAt(r.depth).id}`
        const label = `${fromKey(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: ${r?.finishedAt ? formatDepth(r.depth) : 'no dive'}`
        return <span key={d} role="listitem" className={`cal-day ${cls} ${d === today ? 'today' : ''}`} title={label} aria-label={label} />
      })}
    </div>
  )
}

function NameEditor({ name }: { name: string }) {
  const [editing, setEditing] = useState(!name)
  const [draft, setDraft] = useState(name)
  if (!editing) {
    return (
      <div className="name-row">
        <h1>{name}</h1>
        <button className="btn ghost small" onClick={() => (setDraft(name), setEditing(true))}>
          Edit
        </button>
      </div>
    )
  }
  return (
    <form
      className="name-row"
      onSubmit={(e) => {
        e.preventDefault()
        if (!draft.trim()) return
        setProfileName(draft)
        setEditing(false)
      }}
    >
      <input className="name-input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your name" aria-label="Your name" maxLength={40} />
      <button className="btn primary small" type="submit" disabled={!draft.trim()}>
        Save
      </button>
    </form>
  )
}

function SoundSetting() {
  const on = useSoundOn()
  return (
    <label className="setting">
      <input type="checkbox" checked={on} onChange={(e) => setSoundOn(e.target.checked)} /> Sounds and vibration
    </label>
  )
}

function ResetButton() {
  const [confirm, setConfirm] = useState(false)
  if (!confirm) {
    return (
      <button className="btn ghost danger" onClick={() => setConfirm(true)}>
        Reset all progress on this device
      </button>
    )
  }
  return (
    <div className="row">
      <span>This erases your dives and logbook on this device. Are you sure?</span>
      <button className="btn danger" onClick={() => (resetAll(), setConfirm(false))}>
        Yes, reset
      </button>
      <button className="btn ghost" onClick={() => setConfirm(false)}>
        Cancel
      </button>
    </div>
  )
}
