// Client-side progressive delay. This is UX only: real brute-force protection is
// Supabase Auth rate limits (see README). Never rely on this for security.
const KEY = 'login_fail'
export function nextDelayMs(): number {
  const n = Number(sessionStorage.getItem(KEY) ?? '0')
  return Math.min(30000, n * n * 1000)
}
export function recordFailure() {
  sessionStorage.setItem(KEY, String(Number(sessionStorage.getItem(KEY) ?? '0') + 1))
}
export function resetFailures() {
  sessionStorage.removeItem(KEY)
}

export function safeExternalUrl(u?: string): string | undefined {
  if (!u) return undefined
  try {
    const p = new URL(u)
    return p.protocol === 'https:' ? p.href : undefined
  } catch {
    return undefined
  }
}
