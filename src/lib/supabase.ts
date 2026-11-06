import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Demo mode can never be enabled in a production build.
export const demoMode = import.meta.env.VITE_DEMO_MODE === 'true' && !import.meta.env.PROD
export const configured = Boolean(url && key)

export const supabase = configured
  ? createClient(url!, key!, { auth: { persistSession: true, autoRefreshToken: true } })
  : null

export async function signedMediaUrl(path: string, seconds = 300): Promise<string | null> {
  if (!path || !supabase) return null
  const { data, error } = await supabase.storage.from('private-media').createSignedUrl(path, seconds)
  return error ? null : data.signedUrl
}
