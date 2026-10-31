import { Loader2, Pause, Play, Volume1, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../../context/PlayerContext.jsx'
import { useLanguage } from '../../i18n/LanguageContext.jsx'

export const fmtTime = (s) => {
  if (!Number.isFinite(s) || s <= 0) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(Math.floor(s % 60)).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

export function IconButton({ label, onClick, children, className = '', ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-amber-50/90 transition hover:bg-white/10 hover:text-white disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function PlayButton({ size = 'md' }) {
  const p = usePlayer()
  const { t } = useLanguage()
  const Icon = p.buffering ? Loader2 : p.playing ? Pause : Play
  const dims = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
  return (
    <button
      type="button"
      onClick={p.toggle}
      disabled={!p.track}
      aria-label={p.playing ? t.player.pause : t.player.play}
      title={p.playing ? t.player.pause : t.player.play}
      className={`grid ${dims} shrink-0 place-items-center rounded-full bg-amber-50 text-[#3a1306] shadow-md transition hover:bg-white disabled:opacity-40`}
    >
      <Icon className={`h-5 w-5 ${p.buffering ? 'animate-spin' : ''} ${!p.playing && !p.buffering ? 'translate-x-[1px]' : ''}`} fill={p.playing || p.buffering ? 'none' : 'currentColor'} aria-hidden="true" />
    </button>
  )
}

/** Thin seek bar; keyboard accessible (it's a range input). */
export function SeekBar({ className = '' }) {
  const p = usePlayer()
  const { t } = useLanguage()
  const fill = p.duration ? (p.time / p.duration) * 100 : 0
  return (
    <input
      type="range"
      min="0"
      max={p.duration || 0}
      step="0.5"
      value={Math.min(p.time, p.duration || 0)}
      onChange={(e) => p.seek(Number(e.target.value))}
      aria-label={t.player.seek}
      aria-valuetext={`${fmtTime(p.time)} / ${fmtTime(p.duration)}`}
      disabled={!p.duration}
      className={`range w-full disabled:cursor-default ${className}`}
      style={{ '--fill': `${fill}%` }}
    />
  )
}

/** Speaker button with a small slider that opens above it. */
export function VolumeControl() {
  const p = usePlayer()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const level = p.muted ? 0 : p.volume
  const Icon = level === 0 ? VolumeX : level < 0.5 ? Volume1 : Volume2

  useEffect(() => {
    if (!open) return undefined
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <IconButton label={t.player.volume} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </IconButton>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 flex items-center gap-2 rounded-full border border-white/10 bg-[#24110b] px-3 py-2 shadow-xl">
          <IconButton label={p.muted ? t.player.unmute : t.player.mute} onClick={() => p.setMuted(!p.muted)} className="h-7 w-7">
            {p.muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
          </IconButton>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={level}
            onChange={(e) => {
              p.setVolume(Number(e.target.value))
              p.setMuted(false)
            }}
            aria-label={t.player.volume}
            className="range w-28"
            style={{ '--fill': `${level * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

/** Song artwork: a tiny painting of the sun setting over the river, with a level meter while playing. */
export function Artwork({ className = '' }) {
  const { playing } = usePlayer()
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl ${className}`}>
      <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="artSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#47204f" />
            <stop offset="0.55" stopColor="#d6553a" />
            <stop offset="1" stopColor="#ffcf7a" />
          </linearGradient>
          <linearGradient id="artWater" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3a24f" />
            <stop offset="1" stopColor="#2a1222" />
          </linearGradient>
        </defs>
        <rect width="48" height="30" fill="url(#artSky)" />
        <circle cx="24" cy="29" r="7" fill="#fff1c4" />
        <rect y="29" width="48" height="19" fill="url(#artWater)" />
        <path d="M0 29 Q8 25 14 28 Q22 24 30 28 Q38 25 48 28 L48 30 L0 30 Z" fill="#2a1222" />
        <path d="M20 31 L28 31 L33 46 L15 46 Z" fill="#fff0c0" opacity="0.3" />
        <path d="M14 46 C14 38 12 34 12 32 C14 31 16 31 17 32 C17 34 16 38 17 46 Z" fill="#1b0b10" />
      </svg>
      {playing && (
        <span className="eq absolute bottom-1 left-1 flex h-3 items-end gap-[2px]" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </div>
  )
}
