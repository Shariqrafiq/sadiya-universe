import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { tracks } from '../config/music'

interface AudioState {
  playing: boolean; index: number; time: number; duration: number; volume: number
  toggle: () => void; next: () => void; prev: () => void; seek: (t: number) => void; setVolume: (v: number) => void
  hasTracks: boolean
}
const Ctx = createContext<AudioState | null>(null)

// Mounted once above the router content so playback survives navigation.
export function AudioProvider({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [index, setIndex] = useState(0)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVol] = useState(() => Number(localStorage.getItem('music_volume') ?? '0.6'))

  useEffect(() => {
    const a = new Audio()
    a.preload = 'none'
    a.volume = volume
    a.addEventListener('timeupdate', () => setTime(a.currentTime))
    a.addEventListener('loadedmetadata', () => setDuration(a.duration))
    a.addEventListener('ended', () => setIndex((i) => (i + 1) % Math.max(1, tracks.length)))
    a.addEventListener('error', () => setPlaying(false))
    ref.current = a
    return () => { a.pause(); a.src = '' }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const a = ref.current
    if (!a || !tracks[index]) return
    if (!a.src.endsWith(tracks[index].src)) a.src = tracks[index].src
    if (playing) a.play().catch(() => setPlaying(false))
    else a.pause()
  }, [playing, index])

  const n = tracks.length
  const value: AudioState = {
    playing, index, time, duration, volume, hasTracks: n > 0,
    toggle: () => { if (n) setPlaying((p) => !p) },
    next: () => { if (n) setIndex((i) => (i + 1) % n) },
    prev: () => { if (n) setIndex((i) => (i - 1 + n) % n) },
    seek: (t) => { if (ref.current) ref.current.currentTime = t },
    setVolume: (v) => { setVol(v); localStorage.setItem('music_volume', String(v)); if (ref.current) ref.current.volume = v },
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAudio() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAudio outside AudioProvider')
  return c
}
