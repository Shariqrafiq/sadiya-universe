import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Play } from 'lucide-react'
import { useContent } from '../lib/content'
import { Frame } from './Frame'
import { Modal } from './Modal'
import { AudioClip } from './AudioClip'
import { safeExternalUrl } from '../lib/security'

type View = 'timeline' | 'polaroid' | 'carousel' | 'scrapbook'
const VIEWS: View[] = ['timeline', 'polaroid', 'carousel', 'scrapbook']

export function MemoryGallery() {
  const { content } = useContent()
  const memories = content.memories
  const [view, setView] = useState<View>('timeline')
  const [sel, setSel] = useState<number | null>(null)
  const [replay, setReplay] = useState(false)
  const touchX = useRef<number | null>(null)

  useEffect(() => {
    if (!replay || sel === null) return
    const t = setTimeout(() => {
      if (sel >= memories.length - 1) { setReplay(false); return }
      setSel(sel + 1)
    }, 4000)
    return () => clearTimeout(t)
  }, [replay, sel, memories.length])

  const step = (d: number) => setSel((s) => (s === null ? s : (s + d + memories.length) % memories.length))
  if (memories.length === 0) return <p className="card text-center">No memories yet. Add some in the Studio.</p>
  const m = sel === null ? null : memories[sel]

  const tile = (i: number, extra = '') => (
    <button key={memories[i].id} onClick={() => setSel(i)} aria-label={`Open memory: ${memories[i].title}`} className={`block w-full ${extra}`}>
      <Frame path={memories[i].photoPath} emoji={memories[i].emoji} frame={memories[i].frame} fc={memories[i].fc} caption={memories[i].caption || memories[i].title} alt={memories[i].title} />
    </button>
  )

  return (
    <section aria-label="Our memories" className="space-y-4">
      <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Memory layouts">
        {VIEWS.map((v) => <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`btn-soft ${view === v ? '!bg-petal text-white' : ''}`}>{content.layouts[v]}</button>)}
        <button className="btn" onClick={() => { setSel(0); setReplay(true) }}><Play size={18} /> Replay Our Story</button>
      </div>

      {view === 'timeline' && (
        <ol className="relative ml-4 space-y-6 border-l-4 border-petal pl-6">
          {memories.map((x, i) => (
            <li key={x.id}>
              <span aria-hidden className="absolute -left-[14px] text-xl">{x.emoji}</span>
              <button onClick={() => setSel(i)} className="card flex w-full items-center gap-3 text-left" aria-label={`Open memory: ${x.title}`}>
                <div className="w-24 shrink-0"><Frame path={x.photoPath} emoji={x.emoji} frame={x.frame} fc={x.fc} /></div>
                <div className="min-w-0"><p className="text-xs">{x.date}</p><h3 className="font-script text-2xl">{x.title}</h3><p className="line-clamp-3">{x.description}</p></div>
              </button>
            </li>
          ))}
        </ol>
      )}
      {view === 'polaroid' && <div className="grid grid-cols-2 gap-5 md:grid-cols-3">{memories.map((_, i) => tile(i, i % 2 ? 'rotate-2' : '-rotate-2'))}</div>}
      {view === 'carousel' && (
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-4 pt-2" tabIndex={0} aria-label="Swipeable memories">
          {memories.map((_, i) => <div key={i} className="w-3/4 max-w-xs shrink-0 snap-center">{tile(i)}</div>)}
        </div>
      )}
      {view === 'scrapbook' && (
        <div className="card flex flex-wrap justify-center gap-5 !bg-cream/80">
          {memories.map((_, i) => <div key={i} className="w-36" style={{ transform: `rotate(${((i * 7) % 9) - 4}deg)` }}>{tile(i)}</div>)}
        </div>
      )}

      <Modal open={!!m} onClose={() => { setSel(null); setReplay(false) }} title={m?.title ?? ''}>
        {m && (
          <div onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
            onTouchEnd={(e) => { if (touchX.current !== null) { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) { setReplay(false); step(dx < 0 ? 1 : -1) } touchX.current = null } }}>
            <div className="mx-auto max-w-[300px]"><Frame path={m.photoPath} emoji={m.emoji} frame={m.frame} fc={m.fc} caption={m.caption} alt={m.title} /></div>
            <p className="mt-3 text-xs">{m.date}</p>
            <p>{m.description}</p>
            <AudioClip path={m.audioPath} label={`Audio for ${m.title}`} />
            {safeExternalUrl(m.mapUrl) && <a href={safeExternalUrl(m.mapUrl)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 underline"><MapPin size={16} /> Open map</a>}
            <div className="mt-3 flex justify-between">
              <button aria-label="Previous memory" className="btn-soft" onClick={() => { setReplay(false); step(-1) }}><ChevronLeft /></button>
              <button aria-label="Next memory" className="btn-soft" onClick={() => { setReplay(false); step(1) }}><ChevronRight /></button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
