// Devotees standing waist-deep in the river, facing the sun — so we see them from behind, against the light.
// Women hold the soop in front of them at face height: from behind you see the bent elbows, the tray's
// edge and fruit either side of the head, and the diya on it glowing through. Origin = waterline.

const WOMAN =
  'M-22 0 C-23 -18 -24 -38 -26 -52 C-29 -56 -32 -57 -33 -54 C-35 -61 -31 -66 -26 -68 C-21 -71 -17 -75 -14 -80 ' +
  'C-15 -94 -9 -104 1 -104 C11 -103 15 -93 13 -80 C17 -75 22 -71 27 -68 C32 -66 36 -61 34 -54 C32 -57 29 -56 27 -52 C25 -38 24 -18 22 0 Z'
const WOMAN_PRAY =
  'M-22 0 C-23 -18 -24 -38 -26 -52 C-29 -60 -24 -67 -15 -76 C-16 -92 -9 -102 1 -102 C11 -101 15 -91 13 -77 C22 -67 28 -60 26 -52 C24 -38 23 -18 22 0 Z'
// The saree's border along the head-cover and down one side
const BORDER = 'M-14 -80 C-15 -94 -9 -104 1 -104 C11 -103 15 -93 13 -80 C18 -72 26 -60 24 -24'
const SOOP = 'M-44 -80 Q-38 -92 -20 -94 L20 -94 Q38 -92 44 -80 Q22 -76 0 -76 Q-22 -76 -44 -80 Z'
const MAN =
  'M-26 0 C-27 -22 -29 -44 -31 -58 C-31 -67 -24 -71 -10 -73 L-6 -79 L6 -79 L10 -73 C24 -71 31 -67 31 -58 C29 -44 27 -22 26 0 Z'

/** [x, waterline y, scale, pose, saree colour] */
const PEOPLE = [
  [470, 642, 0.5, 'soop', '#9c1f2e'],
  [1150, 650, 0.54, 'pray', '#b8661a'],
  [1236, 636, 0.46, 'man'],
  [612, 694, 0.9, 'soop', '#b3261e'],
  [1012, 690, 0.86, 'soop', '#c99a1a'],
  [704, 712, 1.0, 'pray', '#6a1b7a'],
  [916, 706, 1.04, 'lota'],
  [800, 718, 1.14, 'soop', '#d9661a'],
]

function Figure({ pose, tint, p }) {
  const isMan = pose === 'man' || pose === 'lota'
  const body = isMan ? MAN : pose === 'pray' ? WOMAN_PRAY : WOMAN
  const outline = { stroke: p.rim, strokeWidth: 1.3, strokeOpacity: 0.8, strokeLinejoin: 'round' }
  return (
    <g>
      {pose === 'soop' && (
        <g>
          <circle cx="0" cy="-100" r="30" fill="url(#flameGlow)" />
          <path d={SOOP} fill={p.figure} {...outline} />
          <g fill={p.figure} {...outline} strokeWidth="1">
            <circle cx="-33" cy="-93" r="5.5" />
            <circle cx="-23" cy="-96" r="4.5" />
            <path d="M22 -94 C25 -105 36 -105 38 -95 C34 -99 28 -98 22 -94 Z" />
            <circle cx="31" cy="-93" r="4" />
          </g>
        </g>
      )}
      {pose === 'lota' && (
        <g>
          <path d="M26 -66 C34 -84 38 -104 36 -118" stroke={p.figure} strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M26 -66 C34 -84 38 -104 36 -118" stroke={p.rim} strokeWidth="1.2" strokeOpacity="0.6" fill="none" transform="translate(3.5 0)" />
          <path d="M28 -122 C28 -134 46 -134 46 -122 C46 -116 41 -113 37 -113 C33 -113 28 -116 28 -122 Z M32 -133 L42 -133 L41 -129 L33 -129 Z" fill={p.figure} {...outline} />
          <path className="arghya-stream" d="M46 -121 C55 -112 58 -70 56 0" fill="none" stroke={p.glint} strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      <path d={body} fill={p.figure} {...outline} />
      {isMan && <circle cx="0" cy="-89" r="10.5" fill={p.figure} {...outline} />}
      {isMan && <path d="M-22 -70 C-8 -62 6 -62 24 -70 L22 -64 C6 -57 -8 -57 -21 -64 Z" fill="#7a1d12" opacity="0.5" />}
      {tint && <path d={body} fill={tint} opacity="0.13" />}
      {tint && <path d={BORDER} fill="none" stroke={tint} strokeWidth="2.2" opacity="0.55" />}
      <path d={body} fill="url(#figureLight)" />
      {pose === 'soop' && <path className="flame" d="M1 -118 C4 -113 4 -109 1 -106 C-2 -109 -2 -113 1 -118 Z" fill="#ffe7a3" />}
    </g>
  )
}

export default function Devotees({ p }) {
  return (
    <g>
      <defs>
        <linearGradient id="figureLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.rim} stopOpacity="0.18" />
          <stop offset="0.45" stopColor={p.rim} stopOpacity="0" />
        </linearGradient>
        <radialGradient id="flameGlow">
          <stop offset="0" stopColor="#ffd36b" stopOpacity="0.85" />
          <stop offset="0.4" stopColor="#ffb347" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <filter id="wave" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.3" numOctaves="1" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="8" />
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
      </defs>

      {PEOPLE.map(([x, y, s, pose, tint]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <g transform="scale(1 -0.62)" opacity="0.28" filter="url(#wave)">
            <Figure pose={pose} tint={tint} p={p} />
          </g>
          <g className="figure-sway" style={{ animationDelay: `${-x / 97}s` }}>
            <Figure pose={pose} tint={tint} p={p} />
          </g>
          <ellipse cx="0" cy="1" rx="31" ry="4.5" fill={p.water[2]} opacity="0.7" />
          <ellipse cx="0" cy="1" rx="31" ry="4.5" fill="none" stroke={p.ripple} strokeWidth="1.3" opacity="0.65" />
          <ellipse className="ring-out" style={{ animationDelay: `${-x / 211}s` }} cx="0" cy="1" rx="31" ry="4.5" fill="none" stroke={p.ripple} strokeWidth="1" />
          {pose === 'lota' && <ellipse className="ring-out ring-fast" cx="56" cy="1" rx="10" ry="2" fill="none" stroke={p.glint} strokeWidth="1.2" />}
        </g>
      ))}
    </g>
  )
}
