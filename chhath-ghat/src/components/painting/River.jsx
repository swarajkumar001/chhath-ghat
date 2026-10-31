import { useMemo } from 'react'
import { HORIZON, SUN, WATER_EDGE, rng } from './palette.js'

/** The river: sky reflected in the water, the sun's glittering path, drifting ripples and (at dawn) mist. */
export default function River({ p }) {
  const glints = useMemo(() => {
    const r = rng(3)
    // Denser and finer near the horizon, wider and sparser towards us, thinning out at the sides.
    return Array.from({ length: 190 }, () => {
      const t = Math.pow(r(), 1.4)
      const y = HORIZON + 3 + t * (WATER_EDGE - HORIZON - 10)
      const spread = 10 + (y - HORIZON) * 0.7
      const off = (r() + r() + r() - 1.5) / 1.5
      return { x: SUN.x + off * spread, y, rx: 1.2 + (y - HORIZON) * 0.03 + r() * 2.2, d: -r() * 3, dur: 1.4 + r() * 2.4 }
    })
  }, [])

  const ripples = useMemo(() => {
    const r = rng(11)
    return Array.from({ length: 46 }, () => {
      const y = HORIZON + 10 + Math.pow(r(), 0.8) * (WATER_EDGE - HORIZON - 16)
      const len = 30 + (y - HORIZON) * 0.9 * (0.4 + r())
      return { x: -100 + r() * 1800, y, len, d: -r() * 14, dur: 10 + r() * 10 }
    })
  }, [])

  return (
    <g>
      <defs>
        <linearGradient id="water" x1="0" y1={HORIZON} x2="0" y2={WATER_EDGE} gradientUnits="userSpaceOnUse">
          {p.water.map((c, i) => (
            <stop key={c} offset={i / (p.water.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id="waterBloom" cx={SUN.x} cy={HORIZON + 6} r="420" gradientTransform={`translate(0 ${HORIZON + 6}) scale(1 0.32) translate(0 ${-(HORIZON + 6)})`} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.glow} stopOpacity="0.85" />
          <stop offset="0.4" stopColor={p.glow} stopOpacity="0.3" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sunPath" x1="0" y1={HORIZON} x2="0" y2={WATER_EDGE} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.glint} stopOpacity="0.75" />
          <stop offset="1" stopColor={p.glint} stopOpacity="0.05" />
        </linearGradient>
        <filter id="mistBlur" x="-10%" y="-100%" width="120%" height="300%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      <rect x="-400" y={HORIZON} width="2400" height={WATER_EDGE - HORIZON + 30} fill="url(#water)" />
      <rect x="-400" y={HORIZON} width="2400" height="200" fill="url(#waterBloom)" />
      {/* the sun's column on the water */}
      <path d={`M${SUN.x - 16} ${HORIZON} L${SUN.x + 16} ${HORIZON} L${SUN.x + 150} ${WATER_EDGE} L${SUN.x - 150} ${WATER_EDGE} Z`} fill="url(#sunPath)" opacity="0.35" />

      <g stroke={p.ripple} strokeLinecap="round" fill="none">
        {ripples.map((rp, i) => (
          <line
            key={i}
            className="ripple-drift"
            style={{ animationDelay: `${rp.d}s`, animationDuration: `${rp.dur}s` }}
            x1={rp.x}
            x2={rp.x + rp.len}
            y1={rp.y}
            y2={rp.y}
            strokeWidth={0.6 + (rp.y - HORIZON) / 140}
            opacity={0.12 + (rp.y - HORIZON) / 1400}
          />
        ))}
      </g>

      <g fill={p.glint} opacity="0.85">
        {glints.map((g, i) => (
          <ellipse key={i} className="glint" style={{ animationDelay: `${g.d}s`, animationDuration: `${g.dur}s` }} cx={g.x} cy={g.y} rx={g.rx} ry={0.5 + (g.y - HORIZON) / 260} />
        ))}
      </g>

      {p.mist > 0 && (
        <g className="mist-drift" opacity={p.mist}>
          <ellipse cx="420" cy={HORIZON + 8} rx="520" ry="26" fill="#fff4ec" filter="url(#mistBlur)" />
          <ellipse cx="1220" cy={HORIZON + 14} rx="560" ry="30" fill="#fff1ea" filter="url(#mistBlur)" />
          <ellipse cx="800" cy={HORIZON - 6} rx="700" ry="18" fill="#fff6f0" filter="url(#mistBlur)" opacity="0.7" />
        </g>
      )}
    </g>
  )
}
