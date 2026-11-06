import { useState } from 'react'
import { Music, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'
import { useAudio } from '../hooks/useAudio'
import { tracks } from '../config/music'

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00')

export function MusicPlayer() {
  const a = useAudio()
  const [open, setOpen] = useState(false)
  const t = tracks[a.index]
  return (
    <>
      <button aria-label="Open music player" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-30 rounded-full bg-gradient-to-r from-petal to-rose p-4 text-white shadow-lg">
        <Music />
      </button>
      {open && (
        <section aria-label="Music player" className="card fixed bottom-20 right-4 z-30 w-[min(92vw,20rem)] bg-cream">
          <button aria-label="Close music player" onClick={() => setOpen(false)} className="absolute right-2 top-2 p-2"><X size={18} /></button>
          {!a.hasTracks || !t ? (
            <p className="pr-6">No music added yet. Add your own or royalty-free tracks in <code>src/config/music.ts</code>.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {t.art ? <img src={t.art} alt="" className="h-14 w-14 rounded-xl object-cover" loading="lazy" /> : <div className="grid h-14 w-14 place-items-center rounded-xl bg-lavender text-2xl">🎵</div>}
                <div><p className="font-bold">{t.title}</p><p className="text-sm">{t.artist}</p></div>
              </div>
              <div aria-hidden className="my-2 flex h-6 items-end gap-1">
                {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`w-2 rounded bg-petal ${a.playing ? 'animate-floaty' : ''}`} style={{ height: 8 + i * 3, animationDelay: `${i * 0.15}s` }} />)}
              </div>
              <input aria-label="Seek" type="range" min={0} max={a.duration || 0} value={a.time} step={1} onChange={(e) => a.seek(Number(e.target.value))} className="w-full" />
              <div className="flex justify-between text-xs"><span>{fmt(a.time)}</span><span>{fmt(a.duration)}</span></div>
              <div className="mt-2 flex items-center justify-center gap-3">
                <button aria-label="Previous track" onClick={a.prev} className="p-2"><SkipBack /></button>
                <button aria-label={a.playing ? 'Pause' : 'Play'} onClick={a.toggle} className="btn !px-4">{a.playing ? <Pause /> : <Play />}</button>
                <button aria-label="Next track" onClick={a.next} className="p-2"><SkipForward /></button>
              </div>
              <label className="mt-2 block text-sm">Volume
                <input type="range" min={0} max={1} step={0.05} value={a.volume} onChange={(e) => a.setVolume(Number(e.target.value))} className="w-full" />
              </label>
            </>
          )}
        </section>
      )}
    </>
  )
}
