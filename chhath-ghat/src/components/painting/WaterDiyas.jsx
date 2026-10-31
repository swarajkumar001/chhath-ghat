import { motion } from 'framer-motion'
import { useScene } from '../../context/SceneContext.jsx'
import { HORIZON, WATER_EDGE } from './palette.js'

const depth = (y) => 0.35 + ((y - HORIZON) / (WATER_EDGE - HORIZON)) * 0.8

function FloatingDiya({ d, onDone }) {
  const s = depth(d.y)
  return (
    <g transform={`translate(${d.x} ${d.y})`}>
      {d.fresh && (
        <motion.ellipse
          cx="0"
          cy="1"
          fill="none"
          stroke="#ffe3ad"
          strokeWidth="1.4"
          initial={{ rx: 3, ry: 1, opacity: 0.9 }}
          animate={{ rx: 44 * s, ry: 7 * s, opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />
      )}
      <motion.g
        initial={{ x: 0, opacity: d.fresh ? 0 : 1 }}
        animate={{ x: d.drift, opacity: [d.fresh ? 0 : 1, 1, 1, 0] }}
        transition={{ duration: d.duration, ease: 'linear', opacity: { duration: d.duration, times: [0, 0.04, 0.9, 1] } }}
        onAnimationComplete={() => onDone(d.id)}
      >
        <g transform={`scale(${s})`}>
          <g className="bob" style={{ animationDelay: `${d.bob}s` }}>
            <ellipse cx="0" cy="6" rx="5" ry="22" fill="#ffc46b" opacity="0.35" />
            <ellipse cx="0" cy="-8" rx="38" ry="26" fill="url(#diyaGlow)" />
            <ellipse cx="0" cy="1" rx="17" ry="4" fill="#2f4a1f" />
            <circle cx="-12" cy="0" r="2.4" fill="#ff8f00" />
            <circle cx="12" cy="0.5" r="2.4" fill="#ffc107" />
            <path d="M-10 -4 C-8 3 8 3 10 -4 Z" fill="#7a3518" />
            <ellipse cx="0" cy="-4" rx="10" ry="2.2" fill="#3a1608" />
            <path className="flame" d="M0 -20 C4 -14 4 -9 0 -6 C-4 -9 -4 -14 0 -20 Z" fill="url(#flame)" />
          </g>
        </g>
      </motion.g>
    </g>
  )
}

/** Tap anywhere on the river to set a diya afloat. */
export default function WaterDiyas() {
  const { diyas, removeDiya, floatDiyaAt } = useScene()

  const onWater = (e) => {
    const svg = e.currentTarget.ownerSVGElement
    const ctm = svg?.getScreenCTM()
    if (!ctm) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    floatDiyaAt(pt.x, pt.y)
  }

  return (
    <g>
      <rect x="-400" y={HORIZON + 14} width="2400" height={WATER_EDGE - HORIZON - 20} fill="transparent" className="cursor-pointer" onClick={onWater} aria-hidden="true" />
      <g pointerEvents="none">
        {diyas.map((d) => (
          <FloatingDiya key={d.id} d={d} onDone={removeDiya} />
        ))}
      </g>
    </g>
  )
}
