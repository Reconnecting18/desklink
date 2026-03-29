import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { useThemeStore } from '@/stores/themeStore'

const PREFERS_DARK = '(prefers-color-scheme: dark)'

function systemPrefersDark() {
  return window.matchMedia(PREFERS_DARK).matches
}

function effectiveDark(preference: 'light' | 'dark' | 'system') {
  if (preference === 'dark') return true
  if (preference === 'light') return false
  return systemPrefersDark()
}

function applyDarkClass(preference: 'light' | 'dark' | 'system') {
  document.documentElement.classList.toggle('dark', effectiveDark(preference))
}

export function ThemeSync({ children }: { children: ReactNode }) {
  const themePreference = useThemeStore((s) => s.themePreference)

  useLayoutEffect(() => {
    if (!useThemeStore.persist.hasHydrated()) return
    applyDarkClass(themePreference)
  }, [themePreference])

  useEffect(() => {
    const unsub = useThemeStore.persist.onFinishHydration((state) => {
      applyDarkClass(state.themePreference)
    })
    if (useThemeStore.persist.hasHydrated()) {
      applyDarkClass(useThemeStore.getState().themePreference)
    }
    return unsub
  }, [])

  useEffect(() => {
    if (themePreference !== 'system') return
    const mq = window.matchMedia(PREFERS_DARK)
    const onChange = () => {
      if (useThemeStore.getState().themePreference === 'system') {
        document.documentElement.classList.toggle('dark', systemPrefersDark())
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [themePreference])

  return children
}
