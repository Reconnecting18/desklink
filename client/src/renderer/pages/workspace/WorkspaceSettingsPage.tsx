import { useNavigate } from 'react-router-dom'
import { Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore, type ThemePreference } from '@/stores/themeStore'
import { cn } from '@/lib/cn'

const THEME_OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Always use light appearance.' },
  { value: 'dark', label: 'Dark', description: 'Always use dark appearance.' },
  {
    value: 'system',
    label: 'Match system',
    description: 'Follow your operating system setting.'
  }
]

export function WorkspaceSettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const themePreference = useThemeStore((s) => s.themePreference)
  const setThemePreference = useThemeStore((s) => s.setThemePreference)

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-2xl px-10 pb-12 pt-6 md:px-16 md:pb-14 md:pt-8">
      <div className="mb-10 flex items-center gap-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-notion-sidebar">
          <Settings className="h-5 w-5 text-notion-text-secondary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-notion-text">Settings</h1>
          <p className="mt-1 text-sm text-notion-text-secondary">
            Appearance and your account.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-notion-text">Appearance</h2>
          <p className="text-sm text-notion-text-secondary">
            Choose how DeskLink looks. You can match your device or pick light or dark mode.
          </p>
          <div className="flex flex-col gap-2">
            {THEME_OPTIONS.map(({ value, label, description }) => {
              const selected = themePreference === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setThemePreference(value)}
                  className={cn(
                    'flex w-full flex-col items-start gap-1.5 rounded-lg border px-5 py-4 text-left transition-colors',
                    selected
                      ? 'border-notion-accent bg-notion-sidebar ring-1 ring-notion-accent'
                      : 'border-notion-border bg-notion-bg hover:bg-notion-sidebar'
                  )}
                >
                  <span className="text-sm font-medium text-notion-text">{label}</span>
                  <span className="text-xs text-notion-text-secondary">{description}</span>
                </button>
              )
            })}
          </div>
        </section>

        <div className="border-t border-notion-border pt-10">
          <section className="flex flex-col gap-5">
            <h2 className="text-sm font-semibold text-notion-text">Account</h2>
            <p className="text-sm leading-relaxed text-notion-text-secondary">
              Signed in as{' '}
              <span className="font-medium text-notion-text">{user?.displayName ?? '—'}</span>
              {user?.email ? (
                <>
                  {' '}
                  <span className="text-notion-text-tertiary">({user.email})</span>
                </>
              ) : null}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
              <button
                type="button"
                className="text-sm font-medium text-notion-accent hover:underline"
                onClick={handleSignOut}
              >
                Switch account
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
