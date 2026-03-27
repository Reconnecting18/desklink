import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { getMe } from '@/api/auth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, setAuth, setLoading, accessToken } = useAuthStore()

  useEffect(() => {
    async function init() {
      try {
        const storedToken = await window.api.getToken('accessToken')
        if (storedToken) {
          useAuthStore.setState({ accessToken: storedToken })
          const user = await getMe()
          setAuth(user, storedToken)
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }

    if (isLoading) {
      init()
    }
  }, [isLoading, setAuth, setLoading])

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
