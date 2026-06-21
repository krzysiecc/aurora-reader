import { Link, Navigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import { useAuth } from '@/lib/auth'

export default function Landing() {
  const { user, loading } = useAuth()
  if (!loading && user) return <Navigate to="/library" replace />

  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <h1 className="animate-fade-up">
          <span className="block text-6xl font-black tracking-tight sm:text-8xl">aurora</span>
          <span className="mt-1 block text-2xl font-light tracking-wide text-ink/70 dark:text-paper/70 sm:text-3xl">
            e-book reader
          </span>
        </h1>

        <p className="animate-fade-up mt-6 text-3xl font-light">
          read <span className="animate-shimmer font-semibold">easier</span>
        </p>

        <p className="mt-4 max-w-md text-ink/60 dark:text-paper/60">
          For everyone who loves reading e-books. Build your library, then open EPUB, PDF and TXT
          right in your browser.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn-primary">
            Create an account
          </Link>
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
        </div>
      </main>
    </>
  )
}
