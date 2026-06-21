import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getBlob } from '@/lib/blobStore'
import { useLibrary } from '@/lib/library'
import { useReaderPrefs } from '@/hooks/useReaderPrefs'
import ReaderControls from '@/components/readers/ReaderControls'
import type { ReaderHandle } from '@/components/readers/types'

// Each reader pulls in a heavy parser (epub.js / pdf.js), so load on demand —
// keeps them out of the initial bundle.
const TxtReader = lazy(() => import('@/components/readers/TxtReader'))
const EpubReader = lazy(() => import('@/components/readers/EpubReader'))
const PdfReader = lazy(() => import('@/components/readers/PdfReader'))

export default function Reader() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { getBook, saveProgress, addBookmark, removeBookmark } = useLibrary()
  const [prefs, updatePrefs] = useReaderPrefs()

  const book = getBook(id)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [missing, setMissing] = useState(false)
  const [progress, setProgress] = useState(book?.progress ?? 0)

  const handleRef = useRef<ReaderHandle>(null)
  const locationRef = useRef(book?.location ?? '')
  const progressRef = useRef(book?.progress ?? 0)
  const saveTimer = useRef<number | undefined>(undefined)

  // Load the book file from IndexedDB.
  useEffect(() => {
    if (!book?.fileKey) {
      if (book) setMissing(true)
      return
    }
    let cancelled = false
    getBlob(book.fileKey).then((b) => {
      if (cancelled) return
      if (b) setBlob(b)
      else setMissing(true)
    })
    return () => {
      cancelled = true
    }
  }, [book?.fileKey, book])

  // Persist progress (debounced) and flush on unmount.
  const flushSave = () => {
    if (book) saveProgress(book.id, progressRef.current, locationRef.current)
  }
  useEffect(() => {
    return () => {
      window.clearTimeout(saveTimer.current)
      flushSave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onProgress = (p: number, location: string) => {
    progressRef.current = p
    locationRef.current = location
    setProgress(p)
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(flushSave, 600)
  }

  // Keyboard paging for epub/pdf.
  const supportsPaging = book?.fileType === 'epub' || book?.fileType === 'pdf'
  useEffect(() => {
    if (!supportsPaging) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleRef.current?.next?.()
      if (e.key === 'ArrowLeft') handleRef.current?.prev?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [supportsPaging])

  if (!book) return <Navigate to="/library" replace />

  const onAddBookmark = () => {
    const label =
      book.fileType === 'pdf'
        ? `Page ${locationRef.current || '1'}`
        : `${Math.round(progressRef.current * 100)}%`
    addBookmark(book.id, { label, location: locationRef.current })
  }

  const readerProps = {
    blob: blob!,
    initialLocation: book.location,
    prefs,
    onProgress,
  }

  return (
    <div className="flex h-screen flex-col">
      <ReaderControls
        title={book.title}
        author={book.author}
        progress={progress}
        prefs={prefs}
        updatePrefs={updatePrefs}
        supportsTypography={book.fileType !== 'pdf'}
        supportsPaging={!!supportsPaging}
        bookmarks={book.bookmarks}
        onBack={() => {
          flushSave()
          navigate('/library')
        }}
        onPrev={() => handleRef.current?.prev?.()}
        onNext={() => handleRef.current?.next?.()}
        onAddBookmark={onAddBookmark}
        onGoBookmark={(loc) => handleRef.current?.goTo(loc)}
        onRemoveBookmark={(bmId) => removeBookmark(book.id, bmId)}
      />

      <div className="relative flex-1 overflow-hidden bg-paper/95 dark:bg-night/95">
        {missing ? (
          <Centered>This book has no readable file attached. Edit it to upload one.</Centered>
        ) : !blob ? (
          <Centered>Opening book…</Centered>
        ) : (
          <Suspense fallback={<Centered>Opening book…</Centered>}>
            {book.fileType === 'epub' ? (
              <EpubReader ref={handleRef} {...readerProps} />
            ) : book.fileType === 'pdf' ? (
              <PdfReader ref={handleRef} {...readerProps} />
            ) : (
              <TxtReader ref={handleRef} {...readerProps} />
            )}
          </Suspense>
        )}
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center px-6 text-center text-ink/60 dark:text-paper/60">
      {children}
    </div>
  )
}
