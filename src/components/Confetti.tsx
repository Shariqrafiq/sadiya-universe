import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Lightweight canvas confetti. Fires whenever `fire` changes to a new truthy number.
export function Confetti({ fire, count = 120 }: { fire: number; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!fire || reduced) return
    const c = ref.current!; const g = c.getContext('2d')!
    c.width = window.innerWidth; c.height = window.innerHeight
    const colors = ['#ff9ec4', '#d9ccff', '#ffd9c2', '#c98a86', '#fff8ee']
    const ps = Array.from({ length: Math.min(count, 150) }, () => ({
      x: c.width / 2, y: c.height / 3, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 3,
      r: 3 + Math.random() * 4, col: colors[Math.floor(Math.random() * colors.length)], life: 0,
    }))
    let raf = 0
    const tick = () => {
      g.clearRect(0, 0, c.width, c.height)
      let alive = false
      for (const p of ps) {
        p.vy += 0.25; p.x += p.vx; p.y += p.vy; p.life++
        if (p.y < c.height + 20 && p.life < 200) { alive = true; g.fillStyle = p.col; g.fillRect(p.x, p.y, p.r, p.r * 1.6) }
      }
      if (alive) raf = requestAnimationFrame(tick); else g.clearRect(0, 0, c.width, c.height)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [fire, reduced, count])
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full" />
}
