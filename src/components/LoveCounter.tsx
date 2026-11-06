import { useEffect, useState } from 'react'
import { useContent } from '../lib/content'

export function LoveCounter() {
  const { content } = useContent()
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  const start = content.relationshipStart ? Date.parse(`${content.relationshipStart}T00:00:00`) : NaN
  if (Number.isNaN(start)) {
    return (
      <section className="card text-center">
        <h2 className="font-script text-2xl">Love Counter</h2>
        <p>Setup needed: set the "Together since" date in the Studio. It is never invented.</p>
      </section>
    )
  }
  const mins = Math.max(0, Math.floor((now - start) / 60000))
  return (
    <section className="card text-center" aria-label="Time together">
      <h2 className="font-script text-2xl">Our time together</h2>
      <p><b>{Math.floor(mins / 1440).toLocaleString()}</b> days · <b>{Math.floor(mins / 60).toLocaleString()}</b> hours · <b>{mins.toLocaleString()}</b> minutes 💞</p>
    </section>
  )
}
