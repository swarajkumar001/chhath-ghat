import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

/** Warm specks of light drifting up through the air — dust in the low sun, sparks from the diyas. */
export default function Embers() {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || reduced) return undefined
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    const spawn = (y = h * (0.55 + Math.random() * 0.45)) => ({
      x: Math.random() * w,
      y,
      r: 0.6 + Math.random() * 1.6,
      vy: 0.15 + Math.random() * 0.35,
      sway: Math.random() * Math.PI * 2,
      life: 0,
      max: 400 + Math.random() * 500,
    })
    const motes = Array.from({ length: 46 }, () => spawn())
    const tick = () => {
      ctx.clearRect(0, 0, w, h)
      for (const m of motes) {
        m.life += 1
        m.y -= m.vy
        m.sway += 0.012
        const x = m.x + Math.sin(m.sway) * 8
        const a = Math.sin((m.life / m.max) * Math.PI) * 0.7
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 206, 130, ${a})`
        ctx.shadowColor = 'rgba(255, 170, 80, 0.9)'
        ctx.shadowBlur = 6
        ctx.arc(x, m.y, m.r, 0, Math.PI * 2)
        ctx.fill()
        if (m.life > m.max || m.y < 0) Object.assign(m, spawn(h + 4))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
}
