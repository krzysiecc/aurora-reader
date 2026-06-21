/**
 * Tiny typed wrapper around localStorage. All keys are namespaced under
 * `aurora:` so the app never collides with anything else on the origin.
 *
 * This is the structured-metadata half of the persistence layer; large binary
 * blobs (covers, book files) live in IndexedDB — see `blobStore.ts`.
 */

const PREFIX = 'aurora:'

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function write<T>(key: string, value: T): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function remove(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
