import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Gift } from '../config/gifts'
import { useContent } from '../lib/content'
import { useGiftProgress } from '../hooks/useGiftProgress'
import { Frame } from './Frame'
import { Modal } from './Modal'
import { Confetti } from './Confetti'
import { chime } from '../lib/sfx'

// Each gift has its own state; a click only touches that gift's id.
function GiftTile({ gift, isOpen, onPick }: { gift: Gift; isOpen: boolean; onPick: (g: Gift) => void }) {
  return (
    <button onClick={() => onPick(gift)} aria-label={`Gift ${gift.id}${isOpen ? `: ${gift.title} (opened)` : ' (not opened yet)'}`}
      className={`card relative flex aspect-square flex-col items-center justify-center gap-1 transition hover:-translate-y-1 hover:scale-105 ${isOpen ? 'ring-2 ring-petal' : ''}`}>
      <span className="absolute left-3 top-2 text-xs font-bold">#{gift.id}</span>
      <div aria-hidden className="relative h-16 w-16">
        <div className="absolute bottom-0 h-11 w-16 rounded-md bg-petal"><div className="mx-auto h-full w-3 bg-rose" /></div>
        <motion.div animate={{ y: isOpen ? -24 : 0, rotate: isOpen ? -22 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }} className="absolute bottom-9 h-5 w-[72px] -translate-x-1 rounded bg-lavender">
          <div className="mx-auto h-full w-3 bg-rose" /><span className="absolute -top-3 left-1/2 -translate-x-1/2">🎀</span>
        </motion.div>
        {isOpen && <span className="absolute -top-2 left-1/2 -translate-x-1/2 animate-floaty text-2xl">{gift.emoji}</span>}
      </div>
      <span className="text-xs font-semibold">{isOpen ? gift.title : 'Tap to open'}</span>
    </button>
  )
}

export function GiftCollection() {
  const { content } = useContent()
  const { opened, open, count, error } = useGiftProgress()
  const [current, setCurrent] = useState<Gift | null>(null)
  const [fire, setFire] = useState(0)

  const pick = (g: Gift) => {
    setCurrent(g)
    if (!opened.includes(g.id)) { void open(g.id); chime(); setFire((f) => f + 1) }
  }
  return (
    <section aria-label="Twelve gifts" className="space-y-4 text-center">
      <p className="font-script text-2xl">12 little gifts. One person I love endlessly.</p>
      <p role="status" aria-live="polite" className="font-semibold">Your surprises discovered: {count}/12</p>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {content.gifts.map((g) => <GiftTile key={g.id} gift={g} isOpen={opened.includes(g.id)} onPick={pick} />)}
      </div>
      <Confetti fire={fire} count={60} />
      <Modal open={!!current} onClose={() => setCurrent(null)} title={current ? `Gift ${current.id}: ${current.title}` : ''}>
        {current && (
          <div className="text-center">
            {current.photoPath
              ? <div className="mx-auto mb-3 max-w-[260px]"><Frame path={current.photoPath} emoji={current.emoji} frame={current.frame} fc={current.fc} caption={current.title} /></div>
              : <div aria-hidden className="text-6xl">{current.emoji}</div>}
            <p className="mt-2 whitespace-pre-line text-lg">{current.message}</p>
          </div>
        )}
      </Modal>
    </section>
  )
}
