import { memo, useMemo } from 'react'

// Decorative floating hearts/stars. aria-hidden; CSS handles reduced motion.
function BackdropImpl() {
  const items = useMemo(
    () => Array.from({ length: 18 }, (_, i) => ({
      id: i, left: (i * 37) % 100, top: (i * 53) % 100, size: 10 + (i % 4) * 6,
      glyph: ['💗', '✨', '⭐', '🌸'][i % 4], delay: (i % 6) * 0.5,
    })), [])
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute right-6 top-6 text-5xl animate-floaty">🌙</div>
      <div className="absolute left-4 top-24 text-4xl opacity-70 animate-floaty">☁️</div>
      {items.map((s) => (
        <span key={s.id} className="absolute animate-twinkle" style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, animationDelay: `${s.delay}s` }}>{s.glyph}</span>
      ))}
    </div>
  )
}
export const Backdrop = memo(BackdropImpl)
