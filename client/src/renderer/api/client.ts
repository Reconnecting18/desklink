import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

/** API origin for REST calls (refresh uses raw axios to avoid interceptor loops). */
export const API_BASE = 'http://localhost:3000/api'

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Unwrap { success, data } / { success, error } envelope + handle 401 refresh
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token!)
    }
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body && typeof body === 'object' && 'success' in body) {
      if (body.success) {
        return body.data
      }
      const err = new Error(body.error?.message || 'Request failed')
      ;(err as any).statusCode = body.error?.statusCode || response.status
      throw err
    }
    return body
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = await window.api.getToken('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken })
        const body = response.data as { success?: boolean; data?: { accessToken: string; refreshToken: string } }
        if (!body?.success || !body.data?.accessToken || !body.data?.refreshToken) {
          throw new Error('Invalid refresh response')
        }
        const { accessToken: newToken, refreshToken: newRefresh } = body.data

        useAuthStore.getState().setToken(newToken)
        await window.api.storeToken('refreshToken', newRefresh)

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Extract error message from response
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    const apiError = new Error(message)
    ;(apiError as any).statusCode = error.response?.status
    return Promise.reject(apiError)
  }
)

export default apiClient
