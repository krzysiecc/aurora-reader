import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import BookCard from '@/components/BookCard'
import BookFormModal from '@/components/BookFormModal'
import { useLibrary } from '@/lib/library'
import { SHELVES } from '@/types'
import type { Book, Shelf } from '@/types'

type ShelfFilter = 'all' | Shelf
type SortKey = 'recent' | 'title' | 'author' | 'progress'

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'recent', label: 'Recently updated' },
  { id: 'title', label: 'Title (A–Z)' },
  { id: 'author', label: 'Author (A–Z)' },
  { id: 'progress', label: 'Progress' },
]

export default function Library() {
  const { books, deleteBook } = useLibrary()
  const [query, setQuery] = useState('')
  const [shelf, setShelf] = useState<ShelfFilter>('all')
  const [sort, setSort] = useState<SortKey>('recent')
  const [modal, setModal] = useState<{ open: boolean; book: Book | null }>({
    open: false,
    book: null,
  })

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = books.filter((b) => {
      const matchesShelf = shelf === 'all' || b.shelf === shelf
      const matchesQuery =
        !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      return matchesShelf && matchesQuery
    })

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      switch (sort) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'progress':
          return b.progress - a.progress
        default:
          return b.updatedAt - a.updatedAt
      }
    })
    return sorted
  }, [books, query, shelf, sort])

  const onDelete = (book: Book) => {
    if (window.confirm(`Delete “${book.title}”? This cannot be undone.`)) {
      void deleteBook(book.id)
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-4xl font-black tracking-tight">
            l i b r <span className="text-accent">a r y</span>
          </h1>
          <button type="button" onClick={() => setModal({ open: true, book: null })} className="btn-primary">
            <Plus size={18} /> add <span className="font-extrabold">new one</span>
          </button>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 dark:text-paper/50"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or author…"
              aria-label="Search your library"
              className="glass-input pl-10"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort by"
            className="glass-input w-auto"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Shelf tabs */}
        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter by shelf">
          {(['all', ...SHELVES.map((s) => s.id)] as ShelfFilter[]).map((id) => {
            const label = id === 'all' ? 'All' : SHELVES.find((s) => s.id === id)!.label
            const active = shelf === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setShelf(id)}
                className={
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
                  (active
                    ? 'bg-accent text-white'
                    : 'bg-black/5 text-ink/70 hover:bg-accent/15 dark:bg-white/10 dark:text-paper/70')
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        {visible.length === 0 ? (
          <EmptyState hasBooks={books.length > 0} onAdd={() => setModal({ open: true, book: null })} />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={(b) => setModal({ open: true, book: b })}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </main>

      <BookFormModal
        open={modal.open}
        book={modal.book}
        onClose={() => setModal({ open: false, book: null })}
      />
    </>
  )
}

function EmptyState({ hasBooks, onAdd }: { hasBooks: boolean; onAdd: () => void }) {
  return (
    <div className="glass mx-auto mt-10 max-w-md rounded-2xl p-10 text-center">
      <p className="text-lg font-semibold">
        {hasBooks ? 'No books match your filters' : 'Your library is empty'}
      </p>
      <p className="mt-2 text-sm text-ink/60 dark:text-paper/60">
        {hasBooks
          ? 'Try a different shelf or search.'
          : 'Add your first e-book to start reading.'}
      </p>
      {!hasBooks && (
        <button type="button" onClick={onAdd} className="btn-primary mx-auto mt-6">
          <Plus size={18} /> Add a book
        </button>
      )}
    </div>
  )
}
