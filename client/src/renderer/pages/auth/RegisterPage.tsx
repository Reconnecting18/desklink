import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Titlebar } from '@/components/layout/Titlebar'
import { useAuthStore } from '@/stores/authStore'
import { register } from '@/api/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth, isAuthenticated } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await register(name, email, password)
      await window.api.storeToken('refreshToken', result.refreshToken)
      setAuth(result.user, result.accessToken)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
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
        <div className="w-full max-w-sm rounded-xl border border-notion-border/80 bg-notion-bg/95 p-8 shadow-lg shadow-neutral-900/[0.06] ring-1 ring-black/[0.03] backdrop-blur-sm">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-notion-text">Create your account</h1>
            <p className="mt-1 text-sm text-notion-text-secondary">
              Get started with DeskLink
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="name"
              label="Name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            {error && (
              <p className="rounded bg-red-50 px-3 py-2 text-xs text-notion-red">{error}</p>
            )}

            <Button type="submit" size="lg" disabled={loading} className="mt-2 w-full">
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-notion-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-notion-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
