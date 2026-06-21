import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { StoredUser, User } from '@/types'
import { read, write } from './storage'
import { hashPassword, uid } from './crypto'

/**
 * Client-only auth. Users live in localStorage and the "session" is just the
 * id of the logged-in user. The surface (register / login / logout) is shaped
 * like a real async API so swapping in Supabase/Firebase later is a matter of
 * re-implementing these three methods — nothing else in the app changes.
 */

interface AuthContextValue {
  user: User | null
  /** True until the persisted session has been resolved on first mount. */
  loading: boolean
  register: (input: { name: string; email: string; password: string }) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USERS_KEY = 'users'
const SESSION_KEY = 'session'

function publicUser({ passwordHash: _passwordHash, ...rest }: StoredUser): User {
  return rest
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Resolve the persisted session once, on mount.
  useEffect(() => {
    const sessionId = read<string | null>(SESSION_KEY, null)
    if (sessionId) {
      const found = read<StoredUser[]>(USERS_KEY, []).find((u) => u.id === sessionId)
      if (found) setUser(publicUser(found))
    }
    setLoading(false)
  }, [])

  const register = useCallback<AuthContextValue['register']>(async ({ name, email, password }) => {
    const cleanEmail = email.trim().toLowerCase()
    if (!name.trim()) throw new Error('Please enter a username.')
    if (!cleanEmail) throw new Error('Please enter an email.')
    if (password.length < 6) throw new Error('Password must be at least 6 characters.')

    const users = read<StoredUser[]>(USERS_KEY, [])
    if (users.some((u) => u.email === cleanEmail)) {
      throw new Error('An account with that email already exists.')
    }

    const newUser: StoredUser = {
      id: uid(),
      name: name.trim(),
      email: cleanEmail,
      passwordHash: await hashPassword(password),
      createdAt: Date.now(),
    }
    write(USERS_KEY, [...users, newUser])
    write(SESSION_KEY, newUser.id)
    setUser(publicUser(newUser))
  }, [])

  const login = useCallback<AuthContextValue['login']>(async (email, password) => {
    const cleanEmail = email.trim().toLowerCase()
    const users = read<StoredUser[]>(USERS_KEY, [])
    const found = users.find((u) => u.email === cleanEmail)
    if (!found || found.passwordHash !== (await hashPassword(password))) {
      throw new Error('Invalid email or password.')
    }
    write(SESSION_KEY, found.id)
    setUser(publicUser(found))
  }, [])

  const logout = useCallback(() => {
    write<string | null>(SESSION_KEY, null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, register, login, logout }),
    [user, loading, register, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
