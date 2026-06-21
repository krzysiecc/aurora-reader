import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import PasswordInput from '@/components/PasswordInput'
import { useAuth } from '@/lib/auth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/library')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-6">
        <form onSubmit={onSubmit} className="glass animate-fade-up space-y-4 rounded-2xl p-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">
              new to aurora?{' '}
              <Link to="/register" className="font-medium text-accent hover:underline">
                create an account
              </Link>
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@gmail.com"
            autoComplete="email"
            aria-label="Email"
            required
            className="glass-input"
          />

          <PasswordInput
            name="password"
            value={password}
            onChange={setPassword}
            placeholder="password"
            autoComplete="current-password"
          />

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </main>
    </>
  )
}
