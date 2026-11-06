import { useState } from 'react'
import { useContent } from '../lib/content'
import { Frame } from './Frame'
import { Modal } from './Modal'
import { AudioClip } from './AudioClip'
import { blip } from '../lib/sfx'

const POS = [[15, 70], [32, 35], [52, 60], [70, 25], [86, 55], [50, 12], [22, 15], [92, 20], [8, 40], [62, 85], [38, 88], [78, 70]]

export function Constellation() {
  const { content } = useContent()
  const [sel, setSel] = useState<number | null>(null)
  const [lit, setLit] = useState<number[]>([])
  const memories = content.memories.slice(0, POS.length)
  const pts = memories.map((_, i) => POS[i])
  if (memories.length === 0) return <p className="card text-center">No stars yet. Add memories to light them up.</p>
  const m = sel === null ? null : memories[sel]
  return (
    <section aria-label="Constellation of our love" className="space-y-2 text-center">
      <p className="font-script text-2xl">Every star is a moment with you.</p>
      <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#4a3166] to-[#241638]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
          {pts.slice(1).map((p, i) => <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={p[0]} y2={p[1]} stroke="#ffd6e5" strokeOpacity="0.6" strokeWidth="0.3" strokeDasharray="1.2" />)}
        </svg>
        {pts.map(([x, y], i) => (
          <button key={memories[i].id} aria-label={`Star: ${memories[i].title}`} onClick={() => { setSel(i); setLit((l) => Array.from(new Set([...l, i]))); blip(900 + i * 80) }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 text-2xl transition hover:scale-125 ${lit.includes(i) ? 'drop-shadow-[0_0_10px_#fff]' : 'animate-twinkle'}`} style={{ left: `${x}%`, top: `${y}%` }}>
            {lit.includes(i) ? '🌟' : '⭐'}
          </button>
        ))}
      </div>
      <Modal open={!!m} onClose={() => setSel(null)} title={m?.title ?? ''}>
        {m && <><div className="mx-auto max-w-[260px]"><Frame path={m.photoPath} emoji={m.emoji} frame={m.frame} fc={m.fc} caption={m.caption} alt={m.title} /></div><p className="mt-2 text-xs">{m.date}</p><p>{m.description}</p><AudioClip path={m.audioPath} label={`Audio for ${m.title}`} /></>}
      </Modal>
    </section>
  )
}
