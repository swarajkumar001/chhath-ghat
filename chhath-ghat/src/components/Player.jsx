import { AlertCircle, ExternalLink, SkipBack, SkipForward } from 'lucide-react'
import { usePlayer } from '../context/PlayerContext.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { Artwork, IconButton, PlayButton, SeekBar, VolumeControl, fmtTime } from './music/controls.jsx'

/**
 * The music player in the middle of the page. No song list: it starts on the most popular Chhath
 * song, and previous/next move through the rest in order of popularity.
 */
export default function Player() {
  const p = usePlayer()
  const { t } = useLanguage()
  const missing = p.error === 'unavailable' || p.error === 'failed'
  const isTop = p.featured && p.track?.id === p.featured.id

  return (
    <section aria-label={t.player.label} className="player-card w-full max-w-[420px] rounded-2xl px-3 pb-2.5 pt-3 text-left text-amber-50">
      <div className="flex items-center gap-3">
        <Artwork className="h-12 w-12" />
        <div className="min-w-0 flex-1" aria-live="polite">
          {p.status === 'loading' ? (
            <>
              <span className="block h-3.5 w-36 animate-pulse rounded bg-white/15" />
              <span className="mt-1.5 block h-3 w-24 animate-pulse rounded bg-white/10" />
              <span className="sr-only">{t.player.loading}</span>
            </>
          ) : p.status === 'empty' ? (
            <p className="text-sm text-amber-100/80">{t.player.empty}</p>
          ) : (
            <>
              <p className="flex items-center gap-2">
                <span className="truncate text-[15px] font-semibold leading-tight" title={p.track?.youtubeTitle}>
                  {p.track?.title}
                </span>
                {isTop && <span className="hidden shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-gold sm:inline">{t.player.popular}</span>}
              </p>
              <p className="mt-0.5 flex min-w-0 text-xs text-amber-100/70">
                {missing ? (
                  <span className="flex min-w-0 items-center gap-1 text-amber-200/90">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{p.error === 'failed' ? t.player.failed : t.player.unavailable}</span>
                  </span>
                ) : (
                  <span className="truncate">{p.track?.singer || t.player.unknownSinger}</span>
                )}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton label={t.player.prev} onClick={p.prev} disabled={!p.track}>
            <SkipBack className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true" />
          </IconButton>
          <PlayButton />
          <IconButton label={t.player.next} onClick={p.next} disabled={!p.track}>
            <SkipForward className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      {missing && p.track?.youtube ? (
        <a
          href={p.track.youtube}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-white/[0.07] py-1.5 text-xs text-amber-50 hover:bg-white/[0.12]"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          {t.player.onYoutube}
        </a>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-[11px] tabular-nums text-amber-100/60">
          <span className="w-9 text-right">{fmtTime(p.time)}</span>
          <SeekBar />
          <span className="w-9">{p.buffering ? '…' : fmtTime(p.duration)}</span>
          <VolumeControl />
        </div>
      )}
    </section>
  )
}
