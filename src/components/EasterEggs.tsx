import { useEffect, useRef, useState } from 'react'
import { useContent } from '../lib/content'
import { birthday } from '../config/birthday'
import { Modal } from './Modal'

// Harmless surprises only. Nothing here touches auth or private data.
export function EasterEggs() {
  const { content } = useContent()
  const [note, setNote] = useState<{ title: string; text: string } | null>(null)
  const [bloom, setBloom] = useState(false)
  const buf = useRef<string[]>([])

  useEffect(() => {
    const seq = birthday.secretKeySequence
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      buf.current = [...buf.current, e.key.toLowerCase()].slice(-seq.length)
      if (buf.current.join() === seq.join()) setNote({ title: 'A hidden note', text: content.eggs.key })
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const egg = 'p-2 text-3xl transition hover:scale-125'
  return (
    <aside aria-label="Little secrets to find" className="flex items-center justify-center gap-2">
      <button className={egg} aria-label="The moon" onClick={() => setNote({ title: 'The moon', text: content.eggs.moon })}>🌙</button>
      <button className={egg} aria-label="A little heart" onClick={() => setNote({ title: 'A compliment', text: content.eggs.heart })}>💖</button>
      <button className={egg} aria-label="A flower" aria-pressed={bloom} onClick={() => setBloom((b) => !b)}>{bloom ? '🌸' : '🌱'}</button>
      <button className={`${egg} opacity-40`} aria-label="A tiny hidden star" onClick={() => setNote({ title: 'You found a hidden star', text: content.eggs.star })}>✦</button>
      <Modal open={!!note} onClose={() => setNote(null)} title={note?.title ?? ''}><p>{note?.text}</p></Modal>
    </aside>
  )
}
