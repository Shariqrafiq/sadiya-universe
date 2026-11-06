import { useCallback, useEffect, useState } from 'react'
import { supabase, demoMode } from '../lib/supabase'
import { useAuth } from '../lib/auth'
import { giftIdSchema } from '../lib/validation'

const LS = 'demo_gifts'

export function useGiftProgress() {
  const { userId } = useAuth()
  const [opened, setOpened] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (demoMode) {
      try { setOpened(JSON.parse(localStorage.getItem(LS) ?? '[]')) } catch { setOpened([]) }
      return
    }
    if (!supabase || !userId) return
    supabase.from('gift_progress').select('gift_id').then(({ data, error: e }) => {
      if (e) setError('Could not load your progress.')
      else setOpened((data ?? []).map((r) => r.gift_id as number))
    })
  }, [userId])

  const open = useCallback(async (id: number) => {
    if (!giftIdSchema.safeParse(id).success) return
    setOpened((o) => {
      const next = o.includes(id) ? o : [...o, id]
      if (demoMode) localStorage.setItem(LS, JSON.stringify(next))
      return next
    })
    if (!demoMode && supabase && userId) {
      const { error: e } = await supabase.from('gift_progress').upsert({ user_id: userId, gift_id: id })
      if (e) setError('Saved on this screen, but could not sync.')
    }
  }, [userId])

  const reset = useCallback(async () => {
    setOpened([])
    if (demoMode) { localStorage.removeItem(LS); return }
    if (supabase && userId) await supabase.from('gift_progress').delete().eq('user_id', userId)
  }, [userId])

  return { opened, open, reset, error, count: opened.length }
}
