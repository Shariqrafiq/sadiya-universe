import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

// UX gate only. Real protection is Supabase RLS + private storage: private data is never in the bundle.
export function ProtectedRoute() {
  const { authed, loading } = useAuth()
  if (loading) return <p role="status" className="p-10 text-center">Loading our little world…</p>
  return authed ? <Outlet /> : <Navigate to="/login" replace />
}
