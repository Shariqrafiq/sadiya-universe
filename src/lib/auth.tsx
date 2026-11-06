
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { Session } from '@supabase/supabase-js'
import { supabase, demoMode } from './supabase'
import {
  nextDelayMs,
  recordFailure,
  resetFailures,
} from './security'

interface AuthState {
  authed: boolean
  isAdmin: boolean
  loading: boolean
  userId: string | null
  login: (
    password: string,
    email?: string
  ) => Promise<{ ok: boolean; message?: string }>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

const GENERIC = 'That is not our little secret. Try again.'

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [demoAuthed, setDemoAuthed] = useState(false)
  const [adminFlag, setAdminFlag] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession)
      }
    )

    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase || !session) {
      setAdminFlag(false)
      return
    }

    supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setAdminFlag(!!data)
      })
  }, [session])

  const login: AuthState['login'] = async (
    password,
    emailOverride
  ) => {
    const wait = nextDelayMs()

    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait))
    }

    if (demoMode) {
      if (password.length > 0) {
        setDemoAuthed(true)
        return { ok: true }
      }

      return { ok: false, message: GENERIC }
    }

    const email =
      emailOverride ??
      (import.meta.env.VITE_LOGIN_EMAIL as string | undefined)

    if (!supabase || !email) {
      console.error('Supabase configuration is missing:', {
        supabaseAvailable: !!supabase,
        loginEmailAvailable: !!email,
      })

      return {
        ok: false,
        message: 'The site is not set up yet.',
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Supabase login error:', error.message)

      recordFailure()

      return {
        ok: false,
        message: error.message,
      }
    }

    resetFailures()

    return { ok: true }
  }

  const logout = async () => {
    setDemoAuthed(false)

    if (supabase) {
      await supabase.auth.signOut()
    }
  }

  return (
    <Ctx.Provider
      value={{
        authed: demoAuthed || !!session,
        isAdmin: demoMode ? demoAuthed : adminFlag,
        loading,
        userId: session?.user.id ?? (demoAuthed ? 'demo' : null),
        login,
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const context = useContext(Ctx)

  if (!context) {
    throw new Error('useAuth outside AuthProvider')
  }

  return context
}
