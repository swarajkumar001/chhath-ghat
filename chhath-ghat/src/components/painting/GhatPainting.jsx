import { useEffect, useRef, useState } from 'react'
import { useScene } from '../../context/SceneContext.jsx'
import Devotees from './Devotees.jsx'
import Embers from './Embers.jsx'
import FarBank from './FarBank.jsx'
import Foreground from './Foreground.jsx'
import { PALETTES } from './palette.js'
import River from './River.jsx'
import Sky from './Sky.jsx'
import WaterDiyas from './WaterDiyas.jsx'

// Wide screens see the whole ghat; tall phones see its centre (sun, devotees, kosi) with the sky above.
const FRAMES = {
  wide: { viewBox: '0 0 1600 900', fit: 'xMidYMax slice' },
  tall: { viewBox: '545 330 520 570', fit: 'xMidYMax meet' },
}

/** The whole painted ghat, back to front, plus drifting embers, grain and a soft vignette. */
export default function GhatPainting() {
  const { mode } = useScene()
  const p = PALETTES[mode]
  const ref = useRef(null)
  const [tall, setTall] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const ro = new ResizeObserver(([e]) => setTall(e.contentRect.width / e.contentRect.height < 0.9))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const frame = FRAMES[tall ? 'tall' : 'wide']
  return (
    <div ref={ref} className="absolute inset-0 select-none overflow-hidden" style={{ background: p.sky[0] }}>
      <svg className="absolute inset-0 h-full w-full" style={{ overflow: 'visible' }} viewBox={frame.viewBox} preserveAspectRatio={frame.fit} role="img" aria-label="छठ घाट">
        <Sky p={p} />
        <FarBank p={p} />
        <River p={p} />
        <Devotees p={p} />
        <WaterDiyas />
        <Foreground p={p} />
      </svg>
      <Embers />
      <div className="film-grain pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden="true" />
    </div>
  )
}
