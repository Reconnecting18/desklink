import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { getMe } from '@/api/auth'
import { API_BASE } from '@/api/client'
import { getStoredToken, storeToken } from '@/lib/tokenStorage'

/**
 * Restore auth from secure storage: try access token, then refresh token.
 * Call once on app load (e.g. from ProtectedRoute).
 */
export async function restoreSession(): Promise<void> {
  const { setAuth, setLoading, logout } = useAuthStore.getState()

  try {
    const accessToken = (await getStoredToken('accessToken')) ?? null
    const refreshToken = (await getStoredToken('refreshToken')) ?? null

    if (!accessToken && !refreshToken) {
      setLoading(false)
      return
    }

    if (accessToken) {
      useAuthStore.setState({ accessToken })
      try {
        const user = await getMe()
        // Interceptor may have rotated the access token; do not overwrite with stale closure value.
        const tokenAfterMe = useAuthStore.getState().accessToken ?? accessToken
        setAuth(user, tokenAfterMe)
        return
      } catch {
        // Expired access: interceptor may refresh and succeed; if not, try refresh-only path below.
      }
    }

    const rt = (await getStoredToken('refreshToken')) ?? null
    if (rt) {
      try {
        const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken: rt })
        const body = response.data as { success?: boolean; data?: { accessToken: string; refreshToken: string } }
        if (!body?.success || !body.data?.accessToken || !body.data?.refreshToken) {
          throw new Error('Invalid refresh response')
        }
        const { accessToken: newAccess, refreshToken: newRefresh } = body.data
        await storeToken('accessToken', newAccess)
        await storeToken('refreshToken', newRefresh)
        useAuthStore.setState({ accessToken: newAccess })
        const user = await getMe()
        const tokenAfterMe = useAuthStore.getState().accessToken ?? newAccess
        setAuth(user, tokenAfterMe)
        return
      } catch {
        logout()
      }
    }

    setLoading(false)
  } catch {
    setLoading(false)
  }
}
