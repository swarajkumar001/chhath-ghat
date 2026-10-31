import { HORIZON, SUN } from './palette.js'

// Long evening clouds near the horizon, wisps higher up. [x, y, rx, ry, drift seconds]
const CLOUDS = [
  [260, 470, 260, 14, 160], [690, 438, 330, 11, 190], [1250, 462, 300, 16, 170], [1010, 410, 210, 8, 210],
  [430, 392, 190, 7, 230], [1460, 404, 170, 8, 200], [300, 250, 240, 10, 260], [1120, 230, 280, 9, 280],
  [760, 160, 200, 6, 300],
]

const BIRDS = [
  [0, 300, 1], [40, 318, 0.8], [-30, 330, 0.7], [70, 292, 0.6],
]

/** Painted sky: layered gradient, the low sun and its bloom, lit cloud streaks, a few birds. */
export default function Sky({ p }) {
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="-300" x2="0" y2={HORIZON} gradientUnits="userSpaceOnUse">
          {p.sky.map((c, i) => (
            <stop key={c} offset={p.skyStops[i]} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id="sunBloom" cx={SUN.x} cy={SUN.y} r="520" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.glow} stopOpacity="0.85" />
          <stop offset="0.18" stopColor={p.glow} stopOpacity="0.45" />
          <stop offset="0.5" stopColor={p.glow} stopOpacity="0.12" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunDisc">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor={p.sun} />
          <stop offset="1" stopColor={p.sunEdge} />
        </radialGradient>
        <linearGradient id="cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.cloudTop} stopOpacity="0.15" />
          <stop offset="0.55" stopColor={p.cloudTop} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.cloudLit} stopOpacity="0.9" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="softer" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <rect x="-400" y="-1400" width="2400" height={HORIZON + 1420} fill="url(#sky)" />
      <rect x="-400" y="-600" width="2400" height={HORIZON + 620} fill="url(#sunBloom)" />

      {CLOUDS.map(([x, y, rx, ry, dur], i) => (
        <g key={i} className="cloud-drift" style={{ animationDuration: `${dur}s`, animationDelay: `${-i * 23}s` }}>
          <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#cloud)" filter="url(#soft)" />
          <ellipse cx={x + rx * 0.25} cy={y + ry * 0.5} rx={rx * 0.55} ry={ry * 0.45} fill={p.cloudLit} opacity="0.35" filter="url(#soft)" />
        </g>
      ))}

      <circle cx={SUN.x} cy={SUN.y} r="78" fill={p.sun} opacity="0.35" filter="url(#softer)" className="sun-breathe" />
      <circle cx={SUN.x} cy={SUN.y} r="44" fill="url(#sunDisc)" />

      <g className="birds" fill="none" stroke={p.figure} strokeLinecap="round" opacity="0.8">
        {BIRDS.map(([x, y, s], i) => (
          <path key={i} className="bird-wing" style={{ animationDelay: `${-i * 0.27}s` }} d={`M${x - 9 * s} ${y} q${4.5 * s} ${-5 * s} ${9 * s} 0 q${4.5 * s} ${-5 * s} ${9 * s} 0`} strokeWidth={1.6 * s} />
        ))}
      </g>
    </g>
  )
}
