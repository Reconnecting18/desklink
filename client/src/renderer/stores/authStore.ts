import { create } from 'zustand'
import { storeToken, clearStoredTokens } from '@/lib/tokenStorage'

export interface User {
  id: string
  email: string
  displayName: string
  avatarUrl?: string | null
  role: string
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, accessToken: string) => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, accessToken) => {
    set({ user, accessToken, isAuthenticated: true, isLoading: false })
    void storeToken('accessToken', accessToken)
  },

  setUser: (user) => set({ user }),

  setToken: (accessToken) => {
    set({ accessToken })
    void storeToken('accessToken', accessToken)
  },

  logout: () => {
    set({ user: null, accessToken: null, isAuthenticated: false })
    void clearStoredTokens()
  },

  setLoading: (isLoading) => set({ isLoading })
}))
