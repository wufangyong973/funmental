import { CREATURES } from '../lib/creatures'
import { MAX_DEPTH, ZONES, formatDepth, waterColor, zoneAt } from '../lib/ocean'

/** The water behind a dive: its color darkens with depth, and the zone's creatures drift past. */
export function Ocean({ depth }: { depth: number }) {
  const zone = zoneAt(depth)
  const drifters = CREATURES.filter((c) => c.zone === zone.id)
  return (
    <div className={`ocean zone-${zone.id}`} style={{ background: waterColor(depth) }} aria-hidden>
      {zone.id === 'sunlight' && <div className="rays" />}
      <div className="snow" />
      {drifters.map((c, i) => (
        <span key={c.id} className="drifter" style={{ top: `${18 + i * 26}%`, animationDelay: `${-i * 7}s`, animationDuration: `${22 + i * 6}s` }}>
          {c.emoji}
        </span>
      ))}
    </div>
  )
}

/** Gauge position for a depth, on a square-root scale so the shallow zones aren't slivers. */
const gaugePos = (m: number) => Math.sqrt(Math.min(1, m / MAX_DEPTH)) * 100

/** Vertical depth gauge with the zone bands marked. */
export function DepthGauge({ depth }: { depth: number }) {
  return (
    <div className="gauge" role="img" aria-label={`Depth ${formatDepth(depth)}, ${zoneAt(depth).name}`}>
      {ZONES.map((z) => (
        <span
          key={z.id}
          className="gauge-band"
          style={{ top: `${gaugePos(z.top)}%`, height: `${gaugePos(z.bottom) - gaugePos(z.top)}%`, background: z.colors[1] }}
          title={z.name}
        />
      ))}
      <span className="gauge-marker" style={{ top: `${gaugePos(depth)}%` }} />
    </div>
  )
}
