import { z } from 'zod'

export const loginSchema = z.object({
  password: z.string().min(1, 'Please enter the secret').max(128),
})
export type LoginInput = z.infer<typeof loginSchema>

export const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email').max(254),
  password: z.string().min(1, 'Enter your password').max(128),
})
export type AdminLoginInput = z.infer<typeof adminLoginSchema>

export const giftIdSchema = z.number().int().min(1).max(12)

// Photos are re-encoded to JPEG in the browser, so only audio/video are checked here.
const ALLOWED = ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/ogg', 'video/mp4', 'video/webm']
export function validateUpload(file: { type: string; size: number }): string | null {
  if (!ALLOWED.includes(file.type)) return 'Unsupported file. Use MP3, M4A, MP4 or WebM (iPhone videos: export as MP4).'
  if (file.size > 50 * 1024 * 1024) return 'File too large (max 50 MB).'
  return null
}

/* ---- site content (everything the Studio edits) ---- */
const text = (n: number) => z.string().max(n)
const mediaPath = z.string().max(200).regex(/^[A-Za-z0-9_\-/.:]*$/).optional()
const frame = z.enum(['polaroid', 'gold', 'heart', 'round', 'film', 'tape', 'blob', 'sticker', 'plain'])
const colour = z.string().regex(/^#[0-9a-fA-F]{6}$/)
const isoDate = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/)

const media = { caption: text(200).optional(), photoPath: mediaPath, audioPath: mediaPath, frame, fc: colour }

export const contentSchema = z.object({
  skin: z.enum(['blush', 'lavender', 'rosegold', 'midnight']),
  main: text(300),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  relationshipStart: isoDate,
  wish: text(300),
  labels: z.object({ world: text(20), memories: text(20), gifts: text(20), stars: text(20), letter: text(20), finale: text(20) }),
  layouts: z.object({ timeline: text(20), polaroid: text(20), carousel: text(20), scrapbook: text(20) }),
  letter: z.object({ greeting: text(200), text: text(6000), signature: text(100) }),
  dateIdeas: text(2000),
  eggs: z.object({ moon: text(300), heart: text(300), star: text(300), key: text(300) }),
  voice: z.object({ caption: text(600), mediaPath, kind: z.enum(['audio', 'video']) }),
  memories: z.array(z.object({
    id: text(40), title: text(120), date: text(40), description: text(1500), emoji: text(8), mapUrl: text(300).optional(), ...media,
  })).max(12),
  gifts: z.array(z.object({
    id: z.number().int().min(1).max(12), title: text(120), emoji: text(8), message: text(2000), ...media,
  })).length(12),
  pages: z.array(z.object({
    id: z.string().regex(/^[a-z0-9-]{1,24}$/), title: text(24), emoji: text(8), intro: text(600),
    items: z.array(z.object({ id: text(40), title: text(120), text: text(2000), emoji: text(8), ...media })).max(24),
  })).max(6),
})
export type Content = z.infer<typeof contentSchema>
export type PageItem = Content['pages'][number]['items'][number]
