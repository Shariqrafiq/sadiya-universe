import { useEffect, useState } from 'react'

export function useCountdown(target: Date) {
  const [ms, setMs] = useState(() => Math.max(0, target.getTime() - Date.now()))
  useEffect(() => {
    const t = setInterval(() => setMs(Math.max(0, target.getTime() - Date.now())), 1000)
    return () => clearInterval(t)
  }, [target])
  const s = Math.floor(ms / 1000)
  return { done: ms === 0, days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 }
}
