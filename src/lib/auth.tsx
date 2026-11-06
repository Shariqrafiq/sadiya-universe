
const login: AuthState['login'] = async (password, emailOverride) => {
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
    // Debugging only: do not display this message to users.
    console.error('Supabase login error:', error.message)

    recordFailure()

    return {
      ok: false,
      message: GENERIC,
    }
  }

  resetFailures()

  return { ok: true }
}
