/**
 * Persists auth tokens: Electron secure storage when `window.api` exists,
 * otherwise sessionStorage so login works in a plain browser (e.g. Vite dev without preload).
 */
export type TokenKey = 'accessToken' | 'refreshToken'

const SESSION_PREFIX = 'desklink:token:'

function getApi() {
  return typeof window !== 'undefined' ? window.api : undefined
}

export async function getStoredToken(key: TokenKey): Promise<string | null> {
  const api = getApi()
  if (api?.getToken) {
    return (await api.getToken(key)) ?? null
  }
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(SESSION_PREFIX + key)
  }
  return null
}

export async function storeToken(key: TokenKey, value: string): Promise<void> {
  const api = getApi()
  if (api?.storeToken) {
    await api.storeToken(key, value)
    return
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(SESSION_PREFIX + key, value)
  }
}

export async function clearStoredTokens(): Promise<void> {
  const api = getApi()
  if (api?.clearTokens) {
    await api.clearTokens()
    return
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SESSION_PREFIX + 'accessToken')
    sessionStorage.removeItem(SESSION_PREFIX + 'refreshToken')
  }
}
