import { useMemo } from 'react'
import { useCountdown } from '../hooks/useCountdown'
import { useContent } from '../lib/content'

export function Countdown() {
  const { content } = useContent()
  const target = useMemo(() => { const [y, m, d] = content.birthday.split('-').map(Number); return new Date(y, m - 1, d, 0, 0, 0) }, [content.birthday])
  const c = useCountdown(target)
  if (c.done) return <p className="text-center font-script text-3xl">It is your birthday, Sadiya! 🎂</p>
  const cell = (n: number, l: string) => (
    <div className="card min-w-[64px] !p-2 text-center"><div className="text-3xl font-bold tabular-nums">{n}</div><div className="text-xs">{l}</div></div>
  )
  return (
    <section aria-label="Countdown to Sadiya's birthday" className="text-center">
      <p className="mb-2 font-semibold">Countdown to {target.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
      <div className="flex justify-center gap-2" role="timer">{cell(c.days, 'days')}{cell(c.hours, 'hrs')}{cell(c.minutes, 'min')}{cell(c.seconds, 'sec')}</div>
    </section>
  )
}
