import { useNavigate } from 'react-router-dom'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import type { Book } from '@/types'
import { useBlobUrl } from '@/hooks/useBlobUrl'

interface BookCardProps {
  book: Book
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

const SHELF_LABEL: Record<Book['shelf'], string> = {
  unread: 'Unread',
  reading: 'Reading',
  finished: 'Finished',
}

export default function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  const navigate = useNavigate()
  const coverUrl = useBlobUrl(book.coverKey)
  const open = () => navigate(`/book/${book.id}`)
  const percent = Math.round(book.progress * 100)

  return (
    <div className="group relative flex flex-col">
      <button
        type="button"
        onClick={open}
        className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/30 bg-graphite/20 text-left outline-none transition-transform focus-visible:ring-2 focus-visible:ring-accent group-hover:-translate-y-1 dark:border-white/10"
        aria-label={`Open ${book.title}`}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-ink/50 dark:text-paper/50">
            <BookOpen size={28} />
            <span className="line-clamp-3 text-sm font-medium">{book.title}</span>
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-white">
          {SHELF_LABEL[book.shelf]}
        </span>

        {percent > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/30">
            <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
        )}
      </button>

      {/* Hover/focus actions — real buttons, keyboard reachable */}
      <div className="pointer-events-none absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => onEdit(book)}
          className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:text-accent"
          aria-label={`Edit ${book.title}`}
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(book)}
          className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:text-red-500"
          aria-label={`Delete ${book.title}`}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2 px-0.5">
        <h3 className="truncate font-semibold leading-tight" title={book.title}>
          {book.title || 'Untitled'}
        </h3>
        <p className="truncate text-sm text-ink/60 dark:text-paper/60" title={book.author}>
          {book.author || 'Unknown author'}
        </p>
      </div>
    </div>
  )
}
