import { safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'

/** Only these keys may be stored — renderer input is untrusted. */
const ALLOWED_KEYS = new Set(['accessToken', 'refreshToken'])

const tokenMap = new Map<string, Buffer>()
let persistPath = ''

interface PersistedFile {
  v: 1
  entries: Record<string, string>
}

function encryptValue(value: string): Buffer {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.encryptString(value)
  }
  return Buffer.from(value, 'utf-8')
}

function decryptValue(buf: Buffer): string {
  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.decryptString(buf)
  }
  return buf.toString('utf-8')
}

function loadFromDisk(): void {
  if (!persistPath || !existsSync(persistPath)) return
  try {
    const raw = readFileSync(persistPath, 'utf-8')
    const parsed = JSON.parse(raw) as PersistedFile
    if (parsed.v !== 1 || !parsed.entries || typeof parsed.entries !== 'object') return
    tokenMap.clear()
    for (const [key, b64] of Object.entries(parsed.entries)) {
      if (!ALLOWED_KEYS.has(key) || typeof b64 !== 'string') continue
      tokenMap.set(key, Buffer.from(b64, 'base64'))
    }
  } catch {
    tokenMap.clear()
  }
}

function saveToDisk(): void {
  if (!persistPath) return
  try {
    mkdirSync(dirname(persistPath), { recursive: true })
    const entries: Record<string, string> = {}
    for (const [key, buf] of tokenMap.entries()) {
      entries[key] = buf.toString('base64')
    }
    writeFileSync(persistPath, JSON.stringify({ v: 1, entries } satisfies PersistedFile), {
      encoding: 'utf-8',
      mode: 0o600
    })
  } catch {
    // Non-fatal: session still works for this process
  }
}

export function initTokenStorage(userDataPath: string): void {
  persistPath = join(userDataPath, 'desklink-tokens.json')
  loadFromDisk()
}

export function storeToken(key: string, value: string): boolean {
  if (!ALLOWED_KEYS.has(key) || typeof value !== 'string' || value.length === 0) {
    return false
  }
  tokenMap.set(key, encryptValue(value))
  saveToDisk()
  return true
}

export function getToken(key: string): string | null {
  if (!ALLOWED_KEYS.has(key)) return null
  const encrypted = tokenMap.get(key)
  if (!encrypted) return null
  try {
    return decryptValue(encrypted)
  } catch {
    tokenMap.delete(key)
    saveToDisk()
    return null
  }
}

export function deleteToken(key: string): boolean {
  if (!ALLOWED_KEYS.has(key)) return false
  tokenMap.delete(key)
  saveToDisk()
  return true
}

export function clearTokens(): void {
  tokenMap.clear()
  saveToDisk()
}
