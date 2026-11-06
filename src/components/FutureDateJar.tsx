import { useState } from 'react'
import { useContent } from '../lib/content'
import { blip } from '../lib/sfx'

export function FutureDateJar() {
  const [idea, setIdea] = useState<string | null>(null)
  const { content } = useContent()
  const ideas = content.dateIdeas.split('\n').map((s) => s.trim()).filter(Boolean)
  if (ideas.length === 0) return <p className="card text-center">The jar is empty. Add ideas in the Studio.</p>
  const draw = () => { setIdea(ideas[Math.floor(Math.random() * ideas.length)]); blip(780) }
  return (
    <section aria-label="Future date jar" className="card space-y-3 text-center">
      <button onClick={draw} aria-label="Draw a date idea from the jar" className="mx-auto block rounded-3xl border-4 border-white/80 bg-white/40 px-8 py-4 text-5xl shadow-inner">🫙<br /><span className="text-2xl">💌 💌 💌</span></button>
      <p role="status" className="min-h-[2rem] font-script text-2xl">{idea ?? 'Tap the jar to pick a date'}</p>
    </section>
  )
}
