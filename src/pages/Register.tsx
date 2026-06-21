import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import PasswordInput from '@/components/PasswordInput'
import { useAuth } from '@/lib/auth'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await register({ name, email, password })
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
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">
              already have an account?{' '}
              <Link to="/login" className="font-medium text-accent hover:underline">
                log in
              </Link>
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="username"
            autoComplete="username"
            aria-label="Username"
            required
            className="glass-input"
          />

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
            autoComplete="new-password"
          />

          <PasswordInput
            name="confirm"
            value={confirm}
            onChange={setConfirm}
            placeholder="confirm password"
            autoComplete="new-password"
          />

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating…' : 'Register'}
          </button>
        </form>
      </main>
    </>
  )
}
