import { setSoundOn, useSoundOn } from '../lib/sound'

/** Speaker button that turns answer sounds and vibration on or off. */
export function SoundToggle() {
  const on = useSoundOn()
  return (
    <button
      className="icon-btn sound-toggle"
      onClick={() => setSoundOn(!on)}
      aria-pressed={on}
      aria-label={on ? 'Turn sounds off' : 'Turn sounds on'}
      title={on ? 'Sounds on' : 'Sounds off'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}
      </svg>
    </button>
  )
}
