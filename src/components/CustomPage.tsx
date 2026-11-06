import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useContent } from '../lib/content'
import { Frame } from '../components/Frame'
import { Modal } from '../components/Modal'
import { AudioClip } from '../components/AudioClip'

export default function CustomPage() {
  const { id } = useParams()
  const { content } = useContent()
  const [sel, setSel] = useState<number | null>(null)
  const page = content.pages.find((p) => p.id === id)
  if (!page) return <Navigate to="/world" replace />
  const it = sel === null ? null : page.items[sel]
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 animate-rise">
      <h1 className="text-center font-script text-4xl">{page.emoji} {page.title}</h1>
      {page.intro && <p className="text-center whitespace-pre-line">{page.intro}</p>}
      {page.items.length === 0 && <p className="card text-center">Nothing here yet.</p>}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
        {page.items.map((x, i) => (
          <button key={x.id} onClick={() => setSel(i)} aria-label={`Open: ${x.title}`} className="block w-full text-left">
            <Frame path={x.photoPath} emoji={x.emoji} frame={x.frame} fc={x.fc} caption={x.caption || x.title} alt={x.title} />
          </button>
        ))}
      </div>
      <Modal open={!!it} onClose={() => setSel(null)} title={it?.title ?? ''}>
        {it && (
          <div>
            <div className="mx-auto max-w-[300px]"><Frame path={it.photoPath} emoji={it.emoji} frame={it.frame} fc={it.fc} caption={it.caption} alt={it.title} /></div>
            <p className="mt-3 whitespace-pre-line">{it.text}</p>
            <AudioClip path={it.audioPath} label={`Audio for ${it.title}`} />
          </div>
        )}
      </Modal>
    </main>
  )
}
