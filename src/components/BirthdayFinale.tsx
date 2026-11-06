import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useGiftProgress } from '../hooks/useGiftProgress'
import { Confetti } from './Confetti'

export function BirthdayFinale() {
  const { opened, count, reset } = useGiftProgress()
  const [fire, setFire] = useState(0)
  const done = count >= 12
  useEffect(() => { if (done) setFire((f) => f + 1) }, [done])

  if (!done) {
    return (
      <section className="card space-y-2 text-center" aria-label="Birthday finale">
        <p className="font-script text-2xl">The finale is waiting…</p>
        <p>You have found {opened.length}/12 surprises. Open them all to see the grand finale.</p>
        <Link to="/gifts" className="btn">Back to the gifts</Link>
      </section>
    )
  }
  return (
    <section aria-label="Birthday finale" className="space-y-4 text-center">
      <Confetti fire={fire} count={150} />
      <motion.div aria-hidden animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.4 }} className="text-9xl drop-shadow-[0_0_25px_#ff6fa5]">💗</motion.div>
      <h2 className="font-script text-4xl">Happy Birthday, Sadiya!</h2>
      <p className="text-xl">You found every little surprise, but the greatest gift in my life will always be you.</p>
      <div className="flex justify-center gap-2">
        <button className="btn" onClick={() => setFire((f) => f + 1)}>More confetti 🎉</button>
        <button className="btn-soft" onClick={() => void reset()}>Replay from the start</button>
      </div>
    </section>
  )
}
