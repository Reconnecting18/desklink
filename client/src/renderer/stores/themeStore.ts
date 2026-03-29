import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark' | 'system'

export const THEME_STORAGE_KEY = 'desklink-theme'

interface ThemeState {
  themePreference: ThemePreference
  setThemePreference: (p: ThemePreference) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      setThemePreference: (themePreference) => set({ themePreference })
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ themePreference: state.themePreference })
    }
  )
)
