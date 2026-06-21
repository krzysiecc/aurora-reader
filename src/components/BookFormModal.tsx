import { useEffect, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import Modal from './Modal'
import { useLibrary } from '@/lib/library'
import { SHELVES } from '@/types'
import type { Book, Shelf } from '@/types'

interface BookFormModalProps {
  open: boolean
  onClose: () => void
  /** Provide a book to edit; omit/null to add a new one. */
  book?: Book | null
}

const EMPTY = { title: '', author: '', description: '', shelf: 'unread' as Shelf }

export default function BookFormModal({ open, onClose, book }: BookFormModalProps) {
  const { addBook, updateBook } = useLibrary()
  const [fields, setFields] = useState(EMPTY)
  const [cover, setCover] = useState<File | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Reset/seed the form whenever it opens.
  useEffect(() => {
    if (!open) return
    setFields(
      book
        ? { title: book.title, author: book.author, description: book.description, shelf: book.shelf }
        : EMPTY,
    )
    setCover(null)
    setFile(null)
    setError(null)
  }, [open, book])

  const set = (key: keyof typeof fields, value: string) =>
    setFields((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fields.title.trim() || !fields.author.trim()) {
      setError('Title and author are required.')
      return
    }
    if (!book && !file) {
      setError('Please attach a book file (.txt, .epub or .pdf).')
      return
    }
    setSubmitting(true)
    try {
      if (book) {
        await updateBook(book.id, fields, { cover, file })
      } else {
        await addBook(fields, { cover, file })
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the book.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={book ? 'Edit book' : 'Add a new book'}>
      <form onSubmit={onSubmit} className="space-y-3">
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <input
          className="glass-input"
          placeholder="title *"
          aria-label="Title"
          value={fields.title}
          onChange={(e) => set('title', e.target.value)}
        />
        <input
          className="glass-input"
          placeholder="author *"
          aria-label="Author"
          value={fields.author}
          onChange={(e) => set('author', e.target.value)}
        />
        <textarea
          className="glass-input resize-none"
          placeholder="description (max 250)"
          aria-label="Description"
          rows={3}
          maxLength={250}
          value={fields.description}
          onChange={(e) => set('description', e.target.value)}
        />

        <label className="block">
          <span className="mb-1 block text-sm text-ink/70 dark:text-paper/70">Shelf</span>
          <select
            className="glass-input"
            aria-label="Shelf"
            value={fields.shelf}
            onChange={(e) => set('shelf', e.target.value)}
          >
            {SHELVES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <FileField
            label={file ? file.name : 'Book file (.txt .epub .pdf)'}
            accept=".txt,.epub,.pdf,text/plain,application/epub+zip,application/pdf"
            onSelect={setFile}
          />
          <FileField
            label={cover ? cover.name : 'Cover image (.jpg .png)'}
            accept="image/*"
            onSelect={setCover}
          />
        </div>

        {book && (
          <p className="text-xs text-ink/50 dark:text-paper/50">
            Leave the file fields empty to keep the existing ones.
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Saving…' : book ? 'Save changes' : 'Add book'}
        </button>
      </form>
    </Modal>
  )
}

function FileField({
  label,
  accept,
  onSelect,
}: {
  label: string
  accept: string
  onSelect: (file: File | null) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 truncate rounded-lg border-2 border-dashed border-graphite/60 px-3 py-2.5 text-sm transition-colors hover:border-accent">
      <UploadCloud size={16} className="shrink-0" />
      <span className="truncate">{label}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />
    </label>
  )
}
