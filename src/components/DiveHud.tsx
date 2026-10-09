import type { ReactNode } from 'react'
import { formatDepth, zoneAt } from '../lib/ocean'
import { DepthGauge, Ocean } from './Ocean'
import { SoundToggle } from './SoundToggle'

/** The frame around a dive: water, gauge, depth readout, and a slot for progress (dots or tanks). */
export function DiveFrame({ depth, title, status, banner, children }: { depth: number; title: string; status: ReactNode; banner?: string | null; children: ReactNode }) {
  return (
    <div className="dive">
      <Ocean depth={depth} />
      <DepthGauge depth={depth} />
      <header className="dive-hud">
        <div>
          <span className="eyebrow">{title}</span>
          <div className="depth-readout" aria-live="polite">
            {formatDepth(depth)}
          </div>
          <span className="zone-name">{zoneAt(depth).name}</span>
        </div>
        <div className="hud-right">
          {status}
          <SoundToggle />
        </div>
      </header>
      {banner && (
        <div className="zone-banner" role="status" key={banner}>
          Entering the {banner}
        </div>
      )}
      <div className="dive-body">{children}</div>
    </div>
  )
}

/** One dot per daily question: filled by zone color when right, dark when missed. */
export function ProgressDots({ answers, total, zoneOf }: { answers: readonly boolean[]; total: number; zoneOf: (i: number) => string }) {
  return (
    <div className="dots" aria-label={`Question ${Math.min(answers.length + 1, total)} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`dot ${i < answers.length ? (answers[i] ? `hit z-${zoneOf(i)}` : 'miss') : i === answers.length ? 'current' : ''}`} />
      ))}
    </div>
  )
}

export function OxygenTanks({ oxygen, max }: { oxygen: number; max: number }) {
  return (
    <div className="tanks" aria-label={`${oxygen} of ${max} oxygen tanks left`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`tank ${i < oxygen ? 'full' : 'empty'}`} />
      ))}
    </div>
  )
}
