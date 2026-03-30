import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Titlebar } from '@/components/layout/Titlebar'
import { useAuthStore } from '@/stores/authStore'
import { login } from '@/api/auth'
import { storeToken } from '@/lib/tokenStorage'

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      await storeToken('refreshToken', result.refreshToken)
      setAuth(result.user, result.accessToken)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex h-screen flex-col">
      <Titlebar />

      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-notion-sidebar to-notion-bg px-4">
        <div className="w-full max-w-sm rounded-xl border border-notion-border/80 bg-notion-bg/95 p-10 shadow-lg shadow-neutral-900/[0.06] ring-1 ring-black/[0.03] backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-notion-text">Welcome back</h1>
            <p className="mt-1 text-sm text-notion-text-secondary">
              Log in to your DeskLink workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="rounded bg-red-50 px-3 py-2 text-xs text-notion-red">{error}</p>
            )}

            <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-notion-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-notion-accent hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
