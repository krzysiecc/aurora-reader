export type FileType = 'txt' | 'epub' | 'pdf'

export type Shelf = 'unread' | 'reading' | 'finished'

export const SHELVES: { id: Shelf; label: string }[] = [
  { id: 'unread', label: 'Unread' },
  { id: 'reading', label: 'Reading' },
  { id: 'finished', label: 'Finished' },
]

export interface Bookmark {
  id: string
  label: string
  /** Reader-specific location: EPUB CFI, PDF page number, or TXT scroll ratio. */
  location: string
  createdAt: number
}

export interface Book {
  id: string
  ownerId: string
  title: string
  author: string
  description: string
  fileType: FileType
  /** Key into the IndexedDB blob store for the cover image (optional). */
  coverKey?: string
  /** Key into the IndexedDB blob store for the book file itself. */
  fileKey?: string
  shelf: Shelf
  /** Reading progress, 0..1. */
  progress: number
  /** Last reading location (CFI / page / scroll ratio). */
  location?: string
  bookmarks: Bookmark[]
  createdAt: number
  updatedAt: number
}

/** Public-facing user (never carries the password hash). */
export interface User {
  id: string
  name: string
  email: string
  createdAt: number
}

/** Stored user record, including the (hashed) credential. */
export interface StoredUser extends User {
  passwordHash: string
}

export interface ReaderPrefs {
  fontFamily: 'serif' | 'sans'
  /** Body font size in px. */
  fontSize: number
  lineHeight: number
  /** Max reading column width in px. */
  width: number
}

export const DEFAULT_READER_PREFS: ReaderPrefs = {
  fontFamily: 'serif',
  fontSize: 20,
  lineHeight: 1.6,
  width: 720,
}
