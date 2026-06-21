import type { ReaderPrefs } from '@/types'

/** Imperative handle every reader exposes to the Reader page / controls. */
export interface ReaderHandle {
  /** Jump to a saved location (CFI / page number / scroll ratio as a string). */
  goTo: (location: string) => void
  next?: () => void
  prev?: () => void
}

export interface ReaderViewProps {
  blob: Blob
  initialLocation?: string
  prefs: ReaderPrefs
  /** Called as the reader moves: progress is 0..1, location is reader-specific. */
  onProgress: (progress: number, location: string) => void
}
