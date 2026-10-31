import { WATER_EDGE } from './palette.js'

const STEP_DIYAS = [
  [150, 793], [236, 793], [322, 793], [604, 793], [692, 793], [868, 793], [952, 793], [1196, 793], [1282, 793], [1368, 793],
  [110, 837], [278, 837], [520, 837], [760, 837], [846, 837], [1008, 837], [1250, 837], [1430, 837],
  [196, 879], [404, 879], [640, 879], [902, 879], [1150, 879], [1330, 879],
]

/** A small clay diya resting on stone, with its glow and a streak of reflection on the wet step. */
function StepDiya({ x, y, i }) {
  return (
    <g transform={`translate(${x} ${y}) scale(1.35)`}>
      <ellipse cx="0" cy="-6" rx="40" ry="26" fill="url(#diyaGlow)" className="glow-breathe" style={{ animationDelay: `${-i * 0.37}s` }} />
      <ellipse cx="0" cy="5" rx="3" ry="9" fill="#ffc36b" opacity="0.28" />
      <path d="M-9 -3 C-7 3 7 3 9 -3 Z" fill="#7a3518" />
      <ellipse cx="0" cy="-3" rx="9" ry="2" fill="#3a1608" />
      <path className="flame" style={{ animationDelay: `${-i * 0.23}s` }} d="M0 -15 C3.6 -10 3.4 -6 0 -4 C-3.4 -6 -3.6 -10 0 -15 Z" fill="url(#flame)" />
    </g>
  )
}

/** Banana plant: a pseudostem and broad leaves that sway from where they join it. */
function BananaPlant({ x, flip = 1, p }) {
  const leaves = [
    [-60, 0.9, 0.2], [-25, 1.05, -0.6], [10, 1.15, 0.4], [42, 1, -0.3], [78, 0.85, 0.7], [118, 0.7, -0.4],
  ]
  return (
    <g transform={`translate(${x} 905) scale(${flip} 1)`}>
      <path d="M-16 0 C-14 -120 -9 -230 -5 -300 L5 -300 C9 -230 14 -120 16 0 Z" fill={p.leaf} />
      {leaves.map(([a, len, d]) => (
        <g key={a} transform={`translate(0 -290) rotate(${a - 90})`}>
          <g className="leaf-sway" style={{ animationDelay: `${d}s` }}>
            <path
              d={`M0 0 C${60 * len} -40 ${170 * len} -44 ${260 * len} -6 C${170 * len} 34 ${60 * len} 30 0 0 Z`}
              fill={p.leaf}
              stroke={p.leafRim}
              strokeWidth="1.4"
              strokeOpacity="0.55"
            />
            <path d={`M0 0 C${90 * len} -6 ${180 * len} -8 ${255 * len} -6`} stroke={p.leafRim} strokeOpacity="0.35" strokeWidth="1.2" fill="none" />
          </g>
        </g>
      ))}
    </g>
  )
}

/** The kosi: five sugarcanes tied at the top over a clay kalash circled with diyas. */
function Kosi({ x, y, p }) {
  const feet = [-62, -32, 0, 32, 62]
  const apex = [x, y - 190]
  return (
    <g>
      {feet.map((f) => (
        <g key={f}>
          <line x1={x + f} y1={y} x2={apex[0] + f * 0.06} y2={apex[1]} stroke="#3c2a17" strokeWidth="6" strokeLinecap="round" />
          <line x1={x + f - 1.5} y1={y} x2={apex[0] + f * 0.06 - 1.5} y2={apex[1]} stroke={p.rim} strokeOpacity="0.35" strokeWidth="1.2" />
          {[0.25, 0.45, 0.65, 0.82].map((t) => (
            <circle key={t} cx={x + f + (apex[0] + f * 0.06 - x - f) * t} cy={y + (apex[1] - y) * t} r="3.2" fill="#2a1c0f" />
          ))}
        </g>
      ))}
      {[-150, -120, -95, -70, -45, -20, 200, 230].map((a, i) => (
        <g key={a} transform={`translate(${apex[0]} ${apex[1]}) rotate(${a})`}>
          <path className="leaf-sway" style={{ animationDelay: `${-i * 0.4}s` }} d="M0 0 C30 -6 70 4 104 34 C68 12 32 4 0 0 Z" fill="#23301a" stroke={p.leafRim} strokeOpacity="0.45" strokeWidth="1" />
        </g>
      ))}
      <path d={`M${apex[0] - 8} ${apex[1] + 4} L${apex[0] + 22} ${apex[1] + 16} L${apex[0] + 2} ${apex[1] + 22} Z`} fill="#b3261e" />
      <path d={`M${apex[0] - 6} ${apex[1] + 2} L${apex[0] - 26} ${apex[1] + 18} L${apex[0] - 4} ${apex[1] + 16} Z`} fill="#e0a21a" />
      {/* kalash */}
      <path d={`M${x - 26} ${y - 30} C${x - 34} ${y - 4} ${x - 18} ${y} ${x} ${y} C${x + 18} ${y} ${x + 34} ${y - 4} ${x + 26} ${y - 30} C${x + 18} ${y - 42} ${x - 18} ${y - 42} ${x - 26} ${y - 30} Z`} fill="#7a3a1c" />
      <path d={`M${x - 12} ${y - 40} L${x + 12} ${y - 40} L${x + 10} ${y - 48} L${x - 10} ${y - 48} Z`} fill="#5c2a14" />
      <path d={`M${x - 24} ${y - 22} C${x - 8} ${y - 16} ${x + 8} ${y - 16} ${x + 24} ${y - 22}`} stroke="#e8b04a" strokeWidth="2" fill="none" opacity="0.7" />
      <path d={`M${x - 6} ${y - 48} C${x - 20} ${y - 70} ${x - 6} ${y - 76} ${x} ${y - 58} C${x + 6} ${y - 76} ${x + 20} ${y - 70} ${x + 6} ${y - 48} Z`} fill="#2e4a1d" />
      <path className="smoke" d={`M${x + 40} ${y - 30} C${x + 30} ${y - 70} ${x + 56} ${y - 100} ${x + 40} ${y - 140} C${x + 28} ${y - 170} ${x + 50} ${y - 196} ${x + 42} ${y - 226}`} stroke="#f3e2d0" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <line x1={x + 40} y1={y} x2={x + 40} y2={y - 30} stroke="#5a2a14" strokeWidth="1.5" />
    </g>
  )
}

/** A bamboo daura (basket) piled with bananas, coconut, gagal and sugarcane. */
function Daura({ x, y, s = 1, p }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* a stick of sugarcane standing in the basket, its leaves drooping */}
      <line x1="-14" y1="-30" x2="-24" y2="-104" stroke="#3c2a17" strokeWidth="3.5" />
      {[-60, -82].map((y) => (
        <circle key={y} cx={-14 - (10 * (y + 30)) / -74} cy={y} r="2.4" fill="#2a1c0f" />
      ))}
      <path d="M-24 -104 C-34 -110 -46 -104 -54 -88 M-24 -104 C-16 -114 -4 -112 4 -98 M-24 -104 C-26 -116 -22 -124 -14 -128" stroke="#2c3a1d" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M-26 -34 C-30 -48 -14 -54 -4 -44 C2 -56 18 -52 16 -38 Z" fill="#a8861c" />
      <path d="M-24 -38 C-16 -50 -6 -48 -6 -40 M-14 -40 C-6 -54 6 -50 4 -40 M0 -40 C8 -52 18 -48 14 -36" stroke="#5a4510" strokeWidth="1" fill="none" />
      <circle cx="18" cy="-36" r="11" fill="#6b4524" />
      <circle cx="30" cy="-30" r="9" fill="#9a9a2a" />
      <path d="M-36 -26 L36 -26 L28 0 L-28 0 Z" fill="#5b3a1e" />
      <ellipse cx="0" cy="-26" rx="36" ry="5" fill="#7a5229" />
      <g stroke="#3a2412" strokeWidth="1.2" opacity="0.7">
        {[-28, -18, -8, 2, 12, 22].map((v) => (
          <line key={v} x1={v} y1="-24" x2={v + 8} y2="-1" />
        ))}
      </g>
      <path d="M-36 -26 L36 -26 L28 0 L-28 0 Z" fill="none" stroke={p.rim} strokeOpacity="0.35" strokeWidth="1.2" />
    </g>
  )
}

/** A woman and a child seated on the step, watching the river (seen from behind). */
function SeatedFamily({ x, y, p }) {
  return (
    <g transform={`translate(${x} ${y})`} fill={p.figure}>
      <path d="M-34 0 C-38 -20 -30 -40 -18 -50 C-20 -64 -12 -74 0 -74 C12 -74 20 -64 18 -50 C30 -40 38 -20 34 0 Z" stroke={p.rim} strokeOpacity="0.6" strokeWidth="1.3" />
      <path d="M2 -72 C16 -62 26 -40 30 -6 L22 -4 C18 -34 12 -56 0 -68 Z" fill="#8e1b1b" opacity="0.55" />
      <g transform="translate(-58 0) scale(0.6)">
        <path d="M-26 0 C-30 -18 -22 -36 -12 -42 C-15 -52 -10 -60 0 -60 C10 -60 15 -52 12 -42 C22 -36 30 -18 26 0 Z" stroke={p.rim} strokeOpacity="0.6" strokeWidth="1.6" />
      </g>
    </g>
  )
}

/** The near ghat: steps, offerings, the kosi, banana plants framing the view, and diyas. */
export default function Foreground({ p }) {
  return (
    <g>
      <defs>
        <radialGradient id="diyaGlow">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#ff9a3c" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d0" />
          <stop offset="0.6" stopColor="#ffc24a" />
          <stop offset="1" stopColor="#ff7a1a" />
        </linearGradient>
        <filter id="stoneTex" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="2" seed="9" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* foam where the river laps the first step */}
      <path className="foam" d={`M-400 ${WATER_EDGE} Q400 ${WATER_EDGE - 3} 800 ${WATER_EDGE} T2000 ${WATER_EDGE}`} stroke={p.ripple} strokeOpacity="0.6" strokeWidth="1.6" strokeDasharray="30 14 8 18" fill="none" />

      <g>
        <rect x="-400" y={WATER_EDGE + 2} width="2400" height="14" fill={p.stone[0]} />
        <rect x="-400" y={WATER_EDGE + 16} width="2400" height="28" fill={p.stone[1]} />
        <rect x="-400" y={WATER_EDGE + 44} width="2400" height="16" fill={p.stone[0]} opacity="0.85" />
        <rect x="-400" y={WATER_EDGE + 60} width="2400" height="26" fill={p.stone[1]} />
        <rect x="-400" y={WATER_EDGE + 86} width="2400" height="16" fill={p.stone[0]} opacity="0.7" />
        <rect x="-400" y={WATER_EDGE + 102} width="2400" height="60" fill={p.stone[2]} />
        <rect x="-400" y={WATER_EDGE + 2} width="2400" height="160" fill="#000" filter="url(#stoneTex)" opacity="0.6" />
        {[WATER_EDGE + 2, WATER_EDGE + 44, WATER_EDGE + 86].map((y) => (
          <line key={y} x1="-400" x2="2000" y1={y} y2={y} stroke={p.rim} strokeOpacity="0.4" strokeWidth="1.2" />
        ))}
      </g>

      <Kosi x={1090} y={WATER_EDGE + 12} p={p} />
      <Daura x={548} y={WATER_EDGE + 14} p={p} />
      <Daura x={640} y={WATER_EDGE + 15} s={0.9} p={p} />
      <Daura x={1250} y={WATER_EDGE + 15} s={0.85} p={p} />
      <SeatedFamily x={430} y={WATER_EDGE + 54} p={p} />

      {STEP_DIYAS.map(([x, y], i) => (
        <StepDiya key={`${x}-${y}`} x={x} y={y} i={i} />
      ))}

      <BananaPlant x={60} p={p} />
      <BananaPlant x={1545} flip={-1} p={p} />
    </g>
  )
}
