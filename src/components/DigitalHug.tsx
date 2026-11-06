import { useState } from 'react'
import { motion } from 'framer-motion'
import { blip } from '../lib/sfx'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function DigitalHug() {
  const [hug, setHug] = useState(false)
  const reduced = useReducedMotion()
  const go = () => { setHug(true); blip(520, 0.3); setTimeout(() => blip(700, 0.3), 150); setTimeout(() => setHug(false), 4000) }
  const t = { duration: reduced ? 0 : 0.8 }
  return (
    <section aria-label="Digital hug" className="card space-y-3 text-center">
      <div aria-hidden className="relative flex h-24 items-center justify-center text-6xl">
        <motion.span animate={{ x: hug ? 24 : -40 }} transition={t}>🧸</motion.span>
        <motion.span animate={{ x: hug ? -24 : 40 }} transition={t}>🐰</motion.span>
        {hug && <motion.span initial={{ scale: 0, y: 0 }} animate={{ scale: 1.2, y: -40 }} className="absolute text-4xl">💗</motion.span>}
      </div>
      <button className="btn" onClick={go}>Send a hug 🤗</button>
      <p role="status" className="font-script text-2xl">{hug ? 'Sending you the biggest hug in the universe.' : ''}</p>
    </section>
  )
}
