import { useMemo } from 'react'
import { HORIZON, rng } from './palette.js'

/** A soft, bumpy tree line along the horizon. */
function treeLine(seed, base, minH, maxH, step) {
  const r = rng(seed)
  let d = `M-200 ${base}`
  for (let x = -200; x <= 1800; x += step) {
    const h = minH + r() * (maxH - minH)
    d += ` Q${x + step / 2} ${base - h - r() * 10} ${x + step} ${base - h * (0.6 + r() * 0.4)}`
  }
  return `${d} L1800 ${base} Z`
}

const PALMS = [[118, 64], [372, 78], [1335, 70], [1512, 86], [905, 58]]
// Village houses on the far bank: [x, width, height]
const HOUSES = [[205, 46, 22], [256, 34, 30], [296, 52, 18], [1232, 40, 26], [1278, 58, 20], [1342, 36, 28], [1390, 44, 16]]
const LIGHTS = Array.from({ length: 34 }, (_, i) => 930 + i * 15)

/** Taad (palmyra) palm: a thin trunk and a crown of fronds. */
function Palm({ x, h, fill }) {
  const top = HORIZON - h
  const fronds = [-70, -40, -12, 15, 42, 72, 100, 130, 160]
  return (
    <g fill={fill}>
      <path d={`M${x - 1.6} ${HORIZON - 4} C${x - 3} ${top + h * 0.5} ${x + 2} ${top + 10} ${x} ${top} L${x + 1.6} ${top} C${x + 4} ${top + 10} ${x - 1} ${top + h * 0.5} ${x + 1.8} ${HORIZON - 4} Z`} />
      {fronds.map((a) => (
        <path
          key={a}
          transform={`translate(${x} ${top}) rotate(${a})`}
          d="M0 0 C6 -4 14 -4 22 0 C14 1.5 6 1.5 0 0 Z"
        />
      ))}
    </g>
  )
}

/** The far bank: hazy trees, palms, a village, a small temple and the ghat's string lights. */
export default function FarBank({ p }) {
  const far = useMemo(() => treeLine(7, HORIZON, 14, 34, 46), [])
  const near = useMemo(() => treeLine(21, HORIZON + 2, 6, 22, 30), [])
  return (
    <g>
      <defs>
        <linearGradient id="haze" x1="0" y1={HORIZON - 90} x2="0" y2={HORIZON} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={p.haze} stopOpacity="0" />
          <stop offset="1" stopColor={p.haze} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <path d={far} fill={p.farTrees} opacity="0.75" />
      {PALMS.map(([x, h]) => (
        <Palm key={x} x={x} h={h} fill={p.nearTrees} />
      ))}
      {HOUSES.map(([x, w, h]) => (
        <g key={x} fill={p.nearTrees}>
          <rect x={x} y={HORIZON - h} width={w} height={h} />
          <path d={`M${x - 3} ${HORIZON - h} L${x + w / 2} ${HORIZON - h - 9} L${x + w + 3} ${HORIZON - h} Z`} />
          <rect x={x + w * 0.3} y={HORIZON - h * 0.6} width="4" height="5" fill="#ffc46b" opacity={p.windows} />
        </g>
      ))}
      {/* A modest village temple with its flag */}
      <g fill={p.nearTrees}>
        <path d={`M1158 ${HORIZON} L1158 ${HORIZON - 22} L1166 ${HORIZON - 22} C1168 ${HORIZON - 48} 1174 ${HORIZON - 62} 1178 ${HORIZON - 70} C1182 ${HORIZON - 62} 1188 ${HORIZON - 48} 1190 ${HORIZON - 22} L1198 ${HORIZON - 22} L1198 ${HORIZON} Z`} />
        <line x1="1178" y1={HORIZON - 70} x2="1178" y2={HORIZON - 92} stroke={p.nearTrees} strokeWidth="1.2" />
        <path className="flag-wave" d={`M1178 ${HORIZON - 92} L1194 ${HORIZON - 88} L1178 ${HORIZON - 83} Z`} fill="#d9471f" />
      </g>
      <path d={near} fill={p.nearTrees} />
      <rect x="-400" y={HORIZON - 4} width="2400" height="7" fill={p.nearTrees} />
      {LIGHTS.map((x, i) => (
        <circle key={x} cx={x} cy={HORIZON - 6 + Math.sin(i / 3) * 1.5} r="1.3" fill="#ffd27a" className="twinkle" style={{ animationDelay: `${-(i % 7) * 0.4}s` }} />
      ))}
      <rect x="-400" y={HORIZON - 90} width="2400" height="94" fill="url(#haze)" />
    </g>
  )
}
