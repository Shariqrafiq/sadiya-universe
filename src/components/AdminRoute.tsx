import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'

// UX gate. The real gate is Supabase RLS: only users in public.admins can write content or upload files.
export function AdminRoute() {
  const { isAdmin, loading } = useAuth()
  if (loading) return <p role="status" className="p-10 text-center">Loading…</p>
  return isAdmin ? <Outlet /> : <Navigate to="/admin" replace />
}
