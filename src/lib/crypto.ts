/**
 * Browser-side helpers. NOTE: `hashPassword` uses SHA-256 purely so that a
 * plaintext password is never written to localStorage in this client-only
 * prototype. It is NOT a substitute for real, salted, server-side password
 * hashing — when you wire up a backend (see README → "Going real"), delete this
 * and let the server own credentials.
 */

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function uid(): string {
  // crypto.randomUUID is available in all modern browsers over HTTPS/localhost.
  return crypto.randomUUID()
}
