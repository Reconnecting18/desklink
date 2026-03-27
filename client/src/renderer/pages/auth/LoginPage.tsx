import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { login } from '@/api/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
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
      await window.api.storeToken('refreshToken', result.refreshToken)
      setAuth(result.user, result.accessToken)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Minimal titlebar for auth pages */}
      <div className="drag-region flex h-9 shrink-0 items-center border-b border-notion-border bg-notion-sidebar px-3">
        <span className="text-xs font-semibold text-notion-text-secondary tracking-wide">
          DeskLink
        </span>
        <div className="no-drag ml-auto flex h-full">
          <button
            onClick={() => window.api.minimize()}
            className="flex h-full w-11 items-center justify-center text-notion-text-secondary hover:bg-notion-sidebar-hover"
          >
            <span className="text-xs">&#x2014;</span>
          </button>
          <button
            onClick={() => window.api.maximize()}
            className="flex h-full w-11 items-center justify-center text-notion-text-secondary hover:bg-notion-sidebar-hover"
          >
            <span className="text-xs">&#x25A1;</span>
          </button>
          <button
            onClick={() => window.api.close()}
            className="flex h-full w-11 items-center justify-center text-notion-text-secondary hover:bg-notion-red hover:text-white"
          >
            <span className="text-xs">&#x2715;</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-notion-sidebar">
        <div className="w-full max-w-sm rounded-lg border border-notion-border bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-notion-text">Welcome back</h1>
            <p className="mt-1 text-sm text-notion-text-secondary">
              Log in to your DeskLink workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
