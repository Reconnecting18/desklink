import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { restoreSession } from '@/api/session'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    async function init() {
      try {
        await restoreSession()
      } catch {
        useAuthStore.getState().setLoading(false)
      }
    }

    if (isLoading) {
      void init()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-notion-accent border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
