import type { CSSProperties } from 'react'
import { useMediaUrl } from '../lib/content'
import type { FrameStyle } from '../config/memories'

interface Props { path?: string; emoji: string; frame: FrameStyle; fc: string; caption?: string; alt?: string; className?: string }

/** A photo (from the private bucket) inside a chosen frame, with an optional caption under it. */
export function Frame({ path, emoji, frame, fc, caption, alt, className = '' }: Props) {
  const url = useMediaUrl(path)
  const inside = frame === 'polaroid' || frame === 'tape'
  const fig = (
    <figure className={`fr fr-${frame} ${className}`} style={{ '--fc': fc } as CSSProperties}>
      {url
        ? <img src={url} alt={alt ?? caption ?? 'Photo'} loading="lazy" decoding="async" />
        : <div className="ph" role="img" aria-label="Placeholder photo">{emoji}</div>}
      {inside && caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
  if (inside || !caption) return fig
  return <div>{fig}<p className="fr-cap">{caption}</p></div>
}
