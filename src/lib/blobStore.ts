import { get, set, del, createStore } from 'idb-keyval'

/**
 * Binary asset store backed by IndexedDB (localStorage is far too small for
 * book files). Covers and book files are saved as Blobs under generated keys;
 * the keys are persisted alongside the book metadata in localStorage.
 */
const store = createStore('aurora-blobs', 'files')

export function putBlob(key: string, blob: Blob): Promise<void> {
  return set(key, blob, store)
}

export function getBlob(key: string): Promise<Blob | undefined> {
  return get<Blob>(key, store)
}

export function deleteBlob(key: string): Promise<void> {
  return del(key, store)
}
