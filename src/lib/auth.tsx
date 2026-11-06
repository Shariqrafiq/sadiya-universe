import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, demoMode } from './supabase'
import { nextDelayMs, recordFailure, resetFailures } from './security'

interface AuthState {
  authed: boolean
  isAdmin: boolean
  loading: boolean
  userId: string | null
  /** Sadiya signs in with the shared secret; the admin passes their own email. */
  login: (password: string, email?: string) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>
}
const Ctx = createContext<AuthState | null>(null)
const GENERIC = 'That is not our little secret. Try again.'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [demoAuthed, setDemoAuthed] = useState(false)
  const [adminFlag, setAdminFlag] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  // The server decides who is admin (RLS on public.admins). This flag only shows or hides UI.
  useEffect(() => {
    if (!supabase || !session) { setAdminFlag(false); return }
    supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => setAdminFlag(!!data))
  }, [session])

  const login: AuthState['login'] = async (password, emailOverride) => {
    const wait = nextDelayMs()
    if (wait > 0) await new Promise((r) => setTimeout(r, wait))
    if (demoMode) {
      // DEMO ONLY (dev builds): any non-empty password works. Disabled in production builds.
      if (password.length > 0) { setDemoAuthed(true); return { ok: true } }
      return { ok: false, message: GENERIC }
    }
    const email = emailOverride ?? (import.meta.env.VITE_LOGIN_EMAIL as string | undefined)
    if (!supabase || !email) return { ok: false, message: 'The site is not set up yet.' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { recordFailure(); return { ok: false, message: GENERIC } }
    resetFailures()
    return { ok: true }
  }

  const logout = async () => {
    setDemoAuthed(false)
    if (supabase) await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider value={{
      authed: demoAuthed || !!session, isAdmin: demoMode ? demoAuthed : adminFlag, loading,
      userId: session?.user.id ?? (demoAuthed ? 'demo' : null), login, logout,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth outside AuthProvider')
  return c
}
