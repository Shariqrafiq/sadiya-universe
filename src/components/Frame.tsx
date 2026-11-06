import type { CSSProperties } from 'react'
import { useMediaUrl } from '../lib/content'
import type { FrameStyle } from '../config/memories'

interface Props { path?: string; emoji: string; frame: FrameStyle; fc: string; caption?: string; className?: string }

/** A photo (from the private bucket) inside a chosen frame; falls back to an emoji placeholder. */
export function Frame({ path, emoji, frame, fc, caption, className = '' }: Props) {
  const url = useMediaUrl(path)
  const showCap = (frame === 'polaroid' || frame === 'tape') && !!caption
  return (
    <figure className={`fr fr-${frame} ${className}`} style={{ '--fc': fc } as CSSProperties}>
      {url
        ? <img src={url} alt={caption ?? 'Photo'} loading="lazy" decoding="async" />
        : <div className="ph" role="img" aria-label="Placeholder photo">{emoji}</div>}
      {showCap && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
