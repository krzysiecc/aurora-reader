import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

/**
 * Gate for authenticated routes. While the persisted session is still
 * resolving we render nothing (avoids a flash of the login page); once
 * resolved, unauthenticated users are redirected to /login.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
