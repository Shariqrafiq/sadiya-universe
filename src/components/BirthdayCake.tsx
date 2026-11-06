import { useEffect, useRef, useState } from 'react'
import { Confetti } from './Confetti'
import { chime } from '../lib/sfx'
import { useContent } from '../lib/content'

const CANDLES = [0, 1, 2]

export function BirthdayCake() {
  const { content } = useContent()
  const [lit, setLit] = useState<boolean[]>(CANDLES.map(() => true))
  const [fire, setFire] = useState(0)
  const [micOn, setMicOn] = useState(false)
  const [micMsg, setMicMsg] = useState<string | null>(null)
  const stop = useRef<(() => void) | null>(null)
  const allOut = lit.every((l) => !l)

  const blow = (i: number) => setLit((l) => l.map((v, j) => (j === i ? false : v)))
  const blowAll = () => setLit(CANDLES.map(() => false))

  useEffect(() => { if (allOut) { setFire((f) => f + 1); chime(); stop.current?.() } }, [allOut])
  useEffect(() => () => stop.current?.(), [])

  // Microphone only after an explicit button press.
  const enableMic = async () => {
    setMicMsg(null)
    if (!navigator.mediaDevices?.getUserMedia) { setMicMsg('Microphone not available. Use the button instead.'); return }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ac = new AudioContext(); const an = ac.createAnalyser(); an.fftSize = 512
      ac.createMediaStreamSource(s).connect(an)
      const data = new Uint8Array(an.fftSize); let raf = 0; let loud = 0
      const tick = () => {
        an.getByteTimeDomainData(data)
        const peak = Math.max(...data.map((d) => Math.abs(d - 128)))
        loud = peak > 60 ? loud + 1 : 0
        if (loud > 8) { blowAll(); return }
        raf = requestAnimationFrame(tick)
      }
      tick(); setMicOn(true)
      stop.current = () => { cancelAnimationFrame(raf); s.getTracks().forEach((t) => t.stop()); void ac.close(); setMicOn(false) }
    } catch { setMicMsg('No problem, the microphone was not allowed. Tap the candles or use the button.') }
  }

  return (
    <section aria-label="Birthday cake" className="space-y-3 text-center">
      <p className="font-script text-3xl">Make a wish, my love.</p>
      <div className="relative mx-auto w-64 pt-14" aria-hidden>
        <div className="absolute inset-x-0 top-0 flex justify-center gap-8">
          {CANDLES.map((i) => (
            <div key={i} className="relative h-14 w-3 rounded bg-peach" style={{ marginTop: 0 }}>
              {lit[i] && <span className="absolute -top-5 left-1/2 h-5 w-3 -translate-x-1/2 animate-flame rounded-full bg-gradient-to-t from-orange-400 to-yellow-200 shadow-[0_0_14px_#ffd27a]" />}
              {!lit[i] && <span className="absolute -top-6 left-1/2 -translate-x-1/2 animate-floaty text-sm">✨</span>}
            </div>
          ))}
        </div>
        <div className="mx-auto h-12 w-40 rounded-t-3xl bg-blush">🍓 🍓 🍓</div>
        <div className="mx-auto h-14 w-52 bg-lavender" />
        <div className="mx-auto h-16 w-64 rounded-b-3xl bg-peach shadow-xl" />
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {CANDLES.map((i) => <button key={i} className="btn-soft" disabled={!lit[i]} onClick={() => blow(i)} aria-label={`Blow out candle ${i + 1}`}>🕯️ {i + 1}</button>)}
        <button className="btn" onClick={blowAll} disabled={allOut}>Blow Out Candles</button>
        <button className="btn-soft" onClick={enableMic} disabled={micOn || allOut}>{micOn ? 'Listening… blow!' : 'Use microphone'}</button>
      </div>
      {micMsg && <p role="status" className="text-sm">{micMsg}</p>}
      {allOut && <p role="status" className="card font-script text-2xl">{content.wish}</p>}
      <Confetti fire={fire} />
    </section>
  )
}
