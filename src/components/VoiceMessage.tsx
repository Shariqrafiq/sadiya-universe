import { useRef, useState } from 'react'
import { Maximize, Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useContent, useMediaUrl } from '../lib/content'
import { useAuth } from '../lib/auth'

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

export function VoiceMessage() {
  const { content } = useContent()
  const { isAdmin } = useAuth()
  const { mediaPath, kind, caption } = content.voice
  const src = useMediaUrl(mediaPath)
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [d, setD] = useState(0)
  const el = useRef<HTMLVideoElement & HTMLAudioElement>(null)

  const toggle = () => { const m = el.current; if (!m) return; if (m.paused) void m.play().catch(() => setFailed(true)); else m.pause() }
  const common = {
    ref: el, src: src ?? undefined, preload: 'none' as const, playsInline: true,
    onPlay: () => setPlaying(true), onPause: () => setPlaying(false),
    onTimeUpdate: () => setT(el.current?.currentTime ?? 0), onLoadedMetadata: () => setD(el.current?.duration ?? 0),
    onError: () => setFailed(true),
  }

  return (
    <section aria-label="Listen to My Heart" className="card space-y-3 text-center">
      <h2 className="font-script text-3xl">Listen to My Heart</h2>
      <p>{caption}</p>
      {!mediaPath && <p role="status">No recording added yet.{isAdmin && <> <Link className="underline" to="/studio">Add one in the Studio.</Link></>}</p>}
      {mediaPath && !src && !failed && <p role="status">Loading…</p>}
      {failed && <p role="alert">This message could not be loaded right now. Please try again later.</p>}
      {mediaPath && src && !failed && (
        <>
          {kind === 'video'
            ? <video {...common} className="mx-auto w-full max-w-md rounded-2xl border-4 border-white shadow-lg" aria-label="Video message"><track kind="captions" /></video>
            : <><div aria-hidden className="text-6xl">🎙️</div><audio {...common} /></>}
          <input aria-label="Seek" type="range" min={0} max={d || 0} step={1} value={t} onChange={(e) => { if (el.current) el.current.currentTime = Number(e.target.value) }} className="w-full" />
          <div className="flex justify-between text-xs"><span>{fmt(t)}</span><span>{fmt(d)}</span></div>
          <div className="flex justify-center gap-2">
            <button className="btn" onClick={toggle} aria-label={playing ? 'Pause message' : 'Play message'}>{playing ? <Pause /> : <Play />}</button>
            {kind === 'video' && <button className="btn-soft" aria-label="Fullscreen" onClick={() => { void el.current?.requestFullscreen?.() }}><Maximize size={18} /></button>}
          </div>
        </>
      )}
    </section>
  )
}
