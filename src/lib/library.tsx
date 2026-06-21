import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Book, Bookmark, FileType, Shelf } from '@/types'
import { read, write } from './storage'
import { deleteBlob, putBlob } from './blobStore'
import { uid } from './crypto'
import { useAuth } from './auth'

/**
 * The user's book library. Metadata is kept in localStorage (per user); cover
 * images and book files are kept in IndexedDB and referenced by key. As with
 * auth, the method surface is async and storage-agnostic so a future backend
 * can drop in behind it.
 */

export interface BookInput {
  title: string
  author: string
  description: string
  shelf: Shelf
}

export interface BookFiles {
  cover?: File | null
  file?: File | null
}

interface LibraryContextValue {
  books: Book[]
  getBook: (id: string) => Book | undefined
  addBook: (input: BookInput, files: BookFiles) => Promise<Book>
  updateBook: (id: string, input: BookInput, files: BookFiles) => Promise<void>
  deleteBook: (id: string) => Promise<void>
  saveProgress: (id: string, progress: number, location: string) => void
  addBookmark: (id: string, bm: Omit<Bookmark, 'id' | 'createdAt'>) => void
  removeBookmark: (id: string, bookmarkId: string) => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

const booksKey = (userId: string) => `books:${userId}`

function detectFileType(file: File): FileType {
  const name = file.name.toLowerCase()
  if (name.endsWith('.epub') || file.type === 'application/epub+zip') return 'epub'
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf'
  return 'txt'
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [books, setBooks] = useState<Book[]>([])

  // Load (and reload) the active user's library whenever the user changes.
  useEffect(() => {
    setBooks(userId ? read<Book[]>(booksKey(userId), []) : [])
  }, [userId])

  // Single source of truth for persistence: update state + localStorage together.
  const persist = useCallback(
    (updater: (prev: Book[]) => Book[]) => {
      setBooks((prev) => {
        const next = updater(prev)
        if (userId) write(booksKey(userId), next)
        return next
      })
    },
    [userId],
  )

  const getBook = useCallback((id: string) => books.find((b) => b.id === id), [books])

  const addBook = useCallback<LibraryContextValue['addBook']>(
    async (input, files) => {
      if (!userId) throw new Error('You must be logged in to add a book.')

      const id = uid()
      let coverKey: string | undefined
      let fileKey: string | undefined
      let fileType: FileType = 'txt'

      if (files.cover) {
        coverKey = `cover:${id}`
        await putBlob(coverKey, files.cover)
      }
      if (files.file) {
        fileKey = `file:${id}`
        fileType = detectFileType(files.file)
        await putBlob(fileKey, files.file)
      }

      const now = Date.now()
      const book: Book = {
        id,
        ownerId: userId,
        title: input.title.trim(),
        author: input.author.trim(),
        description: input.description.trim(),
        fileType,
        coverKey,
        fileKey,
        shelf: input.shelf,
        progress: 0,
        bookmarks: [],
        createdAt: now,
        updatedAt: now,
      }
      persist((prev) => [book, ...prev])
      return book
    },
    [persist, userId],
  )

  const updateBook = useCallback<LibraryContextValue['updateBook']>(
    async (id, input, files) => {
      const existing = books.find((b) => b.id === id)
      if (!existing) return

      const patch: Partial<Book> = {
        title: input.title.trim(),
        author: input.author.trim(),
        description: input.description.trim(),
        shelf: input.shelf,
        updatedAt: Date.now(),
      }

      if (files.cover) {
        const coverKey = existing.coverKey ?? `cover:${id}`
        await putBlob(coverKey, files.cover)
        patch.coverKey = coverKey
      }
      if (files.file) {
        const fileKey = existing.fileKey ?? `file:${id}`
        await putBlob(fileKey, files.file)
        patch.fileKey = fileKey
        patch.fileType = detectFileType(files.file)
        // A new file invalidates the old reading position.
        patch.location = undefined
        patch.progress = 0
      }

      persist((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
    },
    [books, persist],
  )

  const deleteBook = useCallback<LibraryContextValue['deleteBook']>(
    async (id) => {
      const existing = books.find((b) => b.id === id)
      if (existing?.coverKey) await deleteBlob(existing.coverKey)
      if (existing?.fileKey) await deleteBlob(existing.fileKey)
      persist((prev) => prev.filter((b) => b.id !== id))
    },
    [books, persist],
  )

  const saveProgress = useCallback<LibraryContextValue['saveProgress']>(
    (id, progress, location) => {
      persist((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b
          const shelf: Shelf =
            progress >= 0.999 ? 'finished' : progress > 0 ? 'reading' : b.shelf
          return { ...b, progress, location, shelf, updatedAt: Date.now() }
        }),
      )
    },
    [persist],
  )

  const addBookmark = useCallback<LibraryContextValue['addBookmark']>(
    (id, bm) => {
      const bookmark: Bookmark = { ...bm, id: uid(), createdAt: Date.now() }
      persist((prev) =>
        prev.map((b) => (b.id === id ? { ...b, bookmarks: [...b.bookmarks, bookmark] } : b)),
      )
    },
    [persist],
  )

  const removeBookmark = useCallback<LibraryContextValue['removeBookmark']>(
    (id, bookmarkId) => {
      persist((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, bookmarks: b.bookmarks.filter((m) => m.id !== bookmarkId) } : b,
        ),
      )
    },
    [persist],
  )

  const value = useMemo(
    () => ({
      books,
      getBook,
      addBook,
      updateBook,
      deleteBook,
      saveProgress,
      addBookmark,
      removeBookmark,
    }),
    [books, getBook, addBook, updateBook, deleteBook, saveProgress, addBookmark, removeBookmark],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within a <LibraryProvider>')
  return ctx
}
