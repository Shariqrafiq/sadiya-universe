import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, demoMode } from './supabase'
import { useAuth } from './auth'
import { contentSchema, validateUpload, type Content } from './validation'
import { birthday } from '../config/birthday'
import { memories as defMemories } from '../config/memories'
import { gifts as defGifts } from '../config/gifts'
import { loveLetter } from '../config/loveLetter'

const BUCKET = 'private-media'
const DEMO_KEY = 'demo_content'

export function defaultContent(): Content {
  return {
    skin: 'blush',
    main: birthday.mainMessage,
    birthday: '2026-11-14',
    relationshipStart: birthday.relationshipStart, // empty on purpose: never invented
    wish: 'May every beautiful wish in your heart come true. You deserve all the happiness in this universe.',
    letter: { greeting: loveLetter.greeting, text: loveLetter.lines.join('\n'), signature: loveLetter.signature },
    dateIdeas: birthday.dateIdeas.join('\n'),
    eggs: { moon: birthday.moonMessage, heart: birthday.heartCompliment, star: 'Surprise! A tiny star just for the curious.', key: birthday.secretNote },
    voice: { caption: birthday.voiceMessage.caption, mediaPath: birthday.voiceMessage.mediaPath || undefined, kind: birthday.voiceMessage.kind },
    memories: defMemories.map((m) => ({ ...m })),
    gifts: defGifts.map((g) => ({ ...g })),
  }
}

/** Merge saved data over defaults, then validate. Anything invalid falls back to the defaults. */
function parse(raw: unknown): Content {
  const base = defaultContent()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Partial<Content>
  const merged = {
    ...base, ...r,
    letter: { ...base.letter, ...r.letter }, eggs: { ...base.eggs, ...r.eggs }, voice: { ...base.voice, ...r.voice },
    gifts: Array.isArray(r.gifts) && r.gifts.length === 12 ? r.gifts : base.gifts,
  }
  const res = contentSchema.safeParse(merged)
  return res.success ? res.data : base
}

/* ---------------- storage backend ---------------- */
const demoMedia = new Map<string, string>() // demo only: lives in memory, gone on refresh

async function loadRemote(): Promise<Content> {
  if (demoMode) {
    try { return parse(JSON.parse(localStorage.getItem(DEMO_KEY) ?? 'null')) } catch { return defaultContent() }
  }
  if (!supabase) return defaultContent()
  const { data, error } = await supabase.from('site_content').select('data').eq('id', 'main').maybeSingle()
  if (error) throw new Error('Could not load content.')
  return parse(data?.data)
}

async function saveRemote(c: Content): Promise<void> {
  if (demoMode) { localStorage.setItem(DEMO_KEY, JSON.stringify(c)); return }
  if (!supabase) throw new Error('Not connected to Supabase.')
  const { error } = await supabase.from('site_content').upsert({ id: 'main', data: c, updated_at: new Date().toISOString() })
  if (error) throw new Error('Save failed. Are you signed in as the admin?')
}

/** Resize photos in the browser so they stay small (about 150-400 KB each) and fit the free tier. */
async function shrinkImage(file: File, max = 1400, quality = 0.82): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const r = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * r); c.height = Math.round(bmp.height * r)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('Could not process the image.'))), 'image/jpeg', quality))
}

export async function uploadMedia(file: File): Promise<string> {
  const bad = validateUpload(file)
  if (bad) throw new Error(bad)
  const isImage = file.type.startsWith('image/')
  const body: Blob = isImage ? await shrinkImage(file) : file
  const ext = isImage ? 'jpg' : (file.type.split('/')[1] ?? 'bin').replace('mpeg', 'mp3')
  const id = crypto.randomUUID()
  if (demoMode) { const p = `demo:${id}`; demoMedia.set(p, URL.createObjectURL(body)); return p }
  if (!supabase) throw new Error('Not connected to Supabase.')
  const path = `${isImage ? 'photos' : 'voice'}/${id}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: body.type || file.type, upsert: false })
  if (error) throw new Error('Upload failed. Are you signed in as the admin?')
  return path
}

export async function removeMedia(paths: string[]): Promise<void> {
  const real = paths.filter((p) => p && !p.startsWith('demo:'))
  if (supabase && real.length) await supabase.storage.from(BUCKET).remove(real)
  paths.filter((p) => p.startsWith('demo:')).forEach((p) => demoMedia.delete(p))
}

const urlCache = new Map<string, { url: string; exp: number }>()
async function mediaUrl(path: string): Promise<string | null> {
  if (path.startsWith('demo:')) return demoMedia.get(path) ?? null
  const hit = urlCache.get(path)
  if (hit && hit.exp > Date.now()) return hit.url
  if (!supabase) return null
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600) // 1 hour
  if (error || !data) return null
  urlCache.set(path, { url: data.signedUrl, exp: Date.now() + 50 * 60 * 1000 })
  return data.signedUrl
}

export function useMediaUrl(path?: string) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let live = true
    setUrl(null)
    if (path) mediaUrl(path).then((u) => { if (live) setUrl(u) })
    return () => { live = false }
  }, [path])
  return url
}

/* ---------------- provider ---------------- */
interface ContentState {
  content: Content
  loading: boolean
  error: string | null
  /** Validate, save to the database, then show it everywhere. */
  commit: (next: Content) => Promise<void>
}
const Ctx = createContext<ContentState | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const { authed } = useAuth()
  const [content, setContent] = useState<Content>(defaultContent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authed) return
    let live = true
    setLoading(true)
    loadRemote().then((c) => { if (live) { setContent(c); setError(null) } })
      .catch(() => { if (live) setError('Could not load the latest content. Showing defaults.') })
      .finally(() => { if (live) setLoading(false) })
    return () => { live = false }
  }, [authed])

  useEffect(() => { document.documentElement.dataset.skin = content.skin }, [content.skin])

  const commit = useCallback(async (next: Content) => {
    const ok = contentSchema.safeParse(next)
    if (!ok.success) throw new Error('Some text is too long or invalid. Please shorten it and try again.')
    await saveRemote(ok.data)
    setContent(ok.data)
  }, [])

  return <Ctx.Provider value={{ content, loading, error, commit }}>{children}</Ctx.Provider>
}

export function useContent() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useContent outside ContentProvider')
  return c
}
