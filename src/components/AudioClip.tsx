import { useMediaUrl } from '../lib/content'

/** Small audio player for a voice note attached to a memory, gift or tab item. */
export function AudioClip({ path, label }: { path?: string; label?: string }) {
  const url = useMediaUrl(path)
  if (!path) return null
  return (
    <div className="mt-3">
      {url
        ? <audio controls preload="none" src={url} className="w-full" aria-label={label ?? 'Audio message'} />
        : <p role="status" className="text-xs">Loading audio…</p>}
    </div>
  )
}
