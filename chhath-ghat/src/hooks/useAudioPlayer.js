import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { featuredOf, loadCatalogue, toTrack } from '../data/catalogue.js'
import { LICENSED_TRACKS } from '../data/tracks.js'
import { usePersistentState } from './usePersistentState.js'

async function localFiles() {
  if (!import.meta.env.DEV) return new Set()
  try {
    const res = await fetch('/local-audio/index.json')
    return new Set(res.ok ? await res.json() : [])
  } catch {
    return new Set() // no local songs folder
  }
}

async function loadTracks() {
  const [catalogue, files] = await Promise.all([loadCatalogue(), localFiles()])
  const ranked = catalogue.songs.map((s) => toTrack(s, files))
  return {
    tracks: [...ranked, ...LICENSED_TRACKS.map((t) => ({ ...t, licensed: true }))],
    hasLocal: files.size > 0,
    fetchedAt: catalogue.fetchedAt,
  }
}

/**
 * One shared HTML5 Audio element. Never starts on its own. Every visit begins on the most popular
 * single (selected, not played); next/previous walk the singles in order of popularity.
 */
export function useAudioPlayer() {
  const audioRef = useRef(null)
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio()
    audioRef.current.preload = 'none'
  }

  const [tracks, setTracks] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | empty
  const [hasLocal, setHasLocal] = useState(false)
  const [fetchedAt, setFetchedAt] = useState(null)
  const [currentId, setCurrentId] = useState(null)
  const [queue, setQueue] = useState([]) // ids that next/previous move through
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null) // null | 'unavailable' (no audio file) | 'failed' (file wouldn't play)
  const [volume, setVolume] = usePersistentState('ghat.volume', 0.8)
  const [muted, setMuted] = useState(false)

  const byId = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks])
  const track = byId.get(currentId) ?? null
  const featured = useMemo(() => featuredOf(tracks), [tracks])
  const currentRef = useRef(currentId)
  currentRef.current = currentId

  useEffect(() => {
    let alive = true
    loadTracks()
      .then((data) => {
        if (!alive) return
        setTracks(data.tracks)
        setHasLocal(data.hasLocal)
        setFetchedAt(data.fetchedAt)
        setQueue(data.tracks.filter((t) => !t.compilation).map((t) => t.id))
        setCurrentId(featuredOf(data.tracks)?.id ?? null)
        setStatus(data.tracks.length ? 'ready' : 'empty')
      })
      .catch(() => alive && setStatus('empty'))
    return () => {
      alive = false
    }
  }, [])

  /** Select a song and play it. `list` (ids) becomes the queue for next/previous. */
  const playTrack = useCallback(
    (id, list) => {
      const audio = audioRef.current
      const t = byId.get(id)
      if (!audio || !t) return
      if (list) setQueue(list)
      if (currentRef.current !== id || !audio.src) {
        audio.pause()
        setTime(0)
        setDuration(0)
        setCurrentId(id)
        if (!t.src) {
          audio.removeAttribute('src')
          audio.load()
          setPlaying(false)
          setError('unavailable')
          return
        }
        audio.src = t.src
      }
      if (!t.src) return setError('unavailable')
      setError(null)
      audio.play().catch((err) => {
        if (err.name !== 'AbortError') setPlaying(false)
      })
    },
    [byId],
  )

  const step = useCallback(
    (dir) => {
      if (!queue.length) return
      const at = queue.indexOf(currentRef.current)
      playTrack(queue[(at + dir + queue.length) % queue.length])
    },
    [queue, playTrack],
  )
  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 4) {
      audio.currentTime = 0
      return
    }
    step(-1)
  }, [step])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentRef.current) return
    if (audio.paused || !audio.src) playTrack(currentRef.current)
    else audio.pause()
  }, [playTrack])

  const seek = useCallback((seconds) => {
    const audio = audioRef.current
    if (audio && Number.isFinite(seconds)) audio.currentTime = seconds
  }, [])

  // Wire audio element events to React state.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    const on = {
      play: () => setPlaying(true),
      pause: () => setPlaying(false),
      playing: () => setBuffering(false),
      waiting: () => setBuffering(true),
      timeupdate: () => setTime(audio.currentTime),
      durationchange: () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0),
      ended: () => next(),
      error: () => {
        if (!audio.getAttribute('src')) return
        setBuffering(false)
        setPlaying(false)
        setError('failed')
      },
    }
    Object.entries(on).forEach(([evt, fn]) => audio.addEventListener(evt, fn))
    return () => Object.entries(on).forEach(([evt, fn]) => audio.removeEventListener(evt, fn))
  }, [next])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      audioRef.current.muted = muted
    }
  }, [volume, muted])

  // Lock-screen / headset controls on phones.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !track) return
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.singer, album: 'छठ घाट' })
    navigator.mediaSession.setActionHandler('play', toggle)
    navigator.mediaSession.setActionHandler('pause', toggle)
    navigator.mediaSession.setActionHandler('nexttrack', next)
    navigator.mediaSession.setActionHandler('previoustrack', prev)
  }, [track, toggle, next, prev])

  useEffect(() => () => audioRef.current?.pause(), [])

  return {
    tracks, status, hasLocal, fetchedAt, track, featured, playing, buffering, time, duration, error,
    volume, setVolume, muted, setMuted, playTrack, toggle, next, prev, seek,
  }
}
