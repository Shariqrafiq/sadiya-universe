import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useContent } from '../lib/content'
import { useReducedMotion } from '../hooks/useReducedMotion'

export function LoveLetter() {
  const reduced = useReducedMotion()
  const { content } = useContent()
  const loveLetter = content.letter
  const [opened, setOpened] = useState(false)
  const [shown, setShown] = useState(0) // characters typed in total
  const full = loveLetter.text

  useEffect(() => {
    if (!opened) return
    if (reduced) { setShown(full.length); return }
    if (shown >= full.length) return
    const t = setTimeout(() => setShown((s) => s + 1), 35)
    return () => clearTimeout(t)
  }, [opened, shown, full.length, reduced])

  const again = () => { setShown(0); setOpened(false); setTimeout(() => setOpened(true), 200) }
  const save = () => {
    const blob = new Blob([`${loveLetter.greeting}\n\n${full}\n\n${loveLetter.signature}\n`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'letter-for-sadiya.txt'; a.click()
    URL.revokeObjectURL(url)
  }
  const done = shown >= full.length

  return (
    <section aria-label="Love letter" className="space-y-4 text-center">
      {!opened ? (
        <button onClick={() => setOpened(true)} aria-label="Break the wax seal and open the letter" className="mx-auto block">
          <div className="relative mx-auto h-40 w-64 rounded-xl bg-peach shadow-xl">
            <div aria-hidden className="absolute inset-x-0 top-0 h-20 [clip-path:polygon(0_0,100%_0,50%_100%)] bg-rose/60" />
            <span aria-hidden className="absolute left-1/2 top-14 grid h-12 w-12 -translate-x-1/2 place-items-center rounded-full bg-red-700 text-xl text-white shadow">♥</span>
          </div>
          <p className="mt-2 font-semibold">Tap the seal</p>
        </button>
      ) : (
        <motion.article initial={{ opacity: 0, y: 40, rotateX: -30 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: reduced ? 0 : 1.2 }}
          className="mx-auto max-w-xl rounded-2xl bg-[#fffaf0] p-6 text-left shadow-xl" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #f0e4d0 32px)' }}>
          <h2 className="font-script text-3xl">{loveLetter.greeting}</h2>
          {/* Full text for screen readers; typing is visual only. */}
          <p className="sr-only">{full}</p>
          <p aria-hidden className="mt-3 whitespace-pre-line font-script text-2xl leading-8">{full.slice(0, shown)}</p>
          {done && <p className="mt-4 text-right font-script text-3xl">{loveLetter.signature} 💗</p>}
        </motion.article>
      )}
      {opened && (
        <div className="flex justify-center gap-2">
          <button className="btn" onClick={again}>Read Again</button>
          <button className="btn-soft" onClick={save}>Save This Letter</button>
        </div>
      )}
    </section>
  )
}
