import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { birthday } from '../config/birthday'
import { Countdown } from './Countdown'
import { blip, chime } from '../lib/sfx'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function HeroSection() {
  const nav = useNavigate()
  const reduced = useReducedMotion()
  const [leaving, setLeaving] = useState(false)

  const enter = () => {
    chime(); blip(880)
    setLeaving(true)
    setTimeout(() => nav('/login'), reduced ? 0 : 900)
  }

  return (
    <motion.main
      initial={{ opacity: 0 }} animate={{ opacity: leaving ? 0 : 1, scale: leaving && !reduced ? 1.15 : 1 }}
      transition={{ duration: reduced ? 0 : 0.9 }}
      className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 px-5 py-10 text-center">
      <h1 className="font-script text-4xl sm:text-5xl">{birthday.title}</h1>
      <motion.div aria-hidden className="text-8xl drop-shadow-[0_0_20px_#ff9ec4]"
        animate={reduced ? undefined : { y: [0, -10, 0], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 4 }}>
        💌
      </motion.div>
      <div aria-hidden className="text-5xl">🧸🎁</div>
      <p className="text-xl font-semibold">Hey {birthday.name}, my favorite person in the entire universe…</p>
      <p>I made something special for you. But there’s a little secret…</p>
      <Countdown />
      <button className="btn text-lg" onClick={enter} disabled={leaving}>Enter Our Little World 💗</button>
      {leaving && !reduced && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
          <motion.span initial={{ scale: 0, opacity: 1 }} animate={{ scale: 12, opacity: 0 }} transition={{ duration: 0.9 }} className="text-7xl">💗</motion.span>
        </div>
      )}
    </motion.main>
  )
}
