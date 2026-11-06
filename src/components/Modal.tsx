import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

// Accessible modal: role=dialog, focus moved in, Escape closes, focus restored.
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('keydown', key); prev?.focus() }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/50 p-4" onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}
        className="card relative max-h-[90vh] w-full max-w-md overflow-y-auto bg-cream" onClick={(e) => e.stopPropagation()}>
        <button aria-label="Close" onClick={onClose} className="absolute right-3 top-3 rounded-full p-2"><X /></button>
        <h2 className="pr-8 font-script text-3xl">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  )
}
