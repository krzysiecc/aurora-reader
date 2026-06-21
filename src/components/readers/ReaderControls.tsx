import { useState } from 'react'
import { ArrowLeft, Bookmark, BookmarkPlus, ChevronLeft, ChevronRight, Minus, Plus, Type } from 'lucide-react'
import type { Bookmark as BookmarkType, ReaderPrefs } from '@/types'

interface ReaderControlsProps {
  title: string
  author: string
  progress: number
  prefs: ReaderPrefs
  updatePrefs: (patch: Partial<ReaderPrefs>) => void
  supportsTypography: boolean
  supportsPaging: boolean
  bookmarks: BookmarkType[]
  onBack: () => void
  onPrev: () => void
  onNext: () => void
  onAddBookmark: () => void
  onGoBookmark: (location: string) => void
  onRemoveBookmark: (id: string) => void
}

type Panel = 'none' | 'font' | 'marks'

export default function ReaderControls(props: ReaderControlsProps) {
  const {
    title,
    author,
    progress,
    prefs,
    updatePrefs,
    supportsTypography,
    supportsPaging,
    bookmarks,
    onBack,
    onPrev,
    onNext,
    onAddBookmark,
    onGoBookmark,
    onRemoveBookmark,
  } = props
  const [panel, setPanel] = useState<Panel>('none')
  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? 'none' : p))

  return (
    <div className="glass relative z-20 flex items-center gap-3 px-4 py-2">
      <button type="button" onClick={onBack} className="btn-ghost !px-3 !py-1.5" aria-label="Back to library">
        <ArrowLeft size={16} /> <span className="hidden sm:inline">Library</span>
      </button>

      <div className="min-w-0 flex-1 text-center">
        <p className="truncate font-semibold leading-tight">{title}</p>
        <p className="truncate text-xs text-ink/60 dark:text-paper/60">
          {author} · {Math.round(progress * 100)}%
        </p>
      </div>

      {supportsPaging && (
        <div className="flex items-center gap-1">
          <button type="button" onClick={onPrev} className="icon-btn !h-9 !w-9" aria-label="Previous page">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={onNext} className="icon-btn !h-9 !w-9" aria-label="Next page">
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      <button type="button" onClick={onAddBookmark} className="icon-btn !h-9 !w-9" aria-label="Add bookmark here">
        <BookmarkPlus size={18} />
      </button>

      <div className="relative">
        <button
          type="button"
          onClick={() => toggle('marks')}
          className="icon-btn !h-9 !w-9"
          aria-label="Bookmarks"
          aria-expanded={panel === 'marks'}
        >
          <Bookmark size={18} />
        </button>
        {panel === 'marks' && (
          <Panel>
            <h3 className="mb-2 text-sm font-semibold">Bookmarks</h3>
            {bookmarks.length === 0 ? (
              <p className="text-sm text-ink/60 dark:text-paper/60">No bookmarks yet.</p>
            ) : (
              <ul className="space-y-1">
                {bookmarks.map((b) => (
                  <li key={b.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onGoBookmark(b.location)
                        setPanel('none')
                      }}
                      className="flex-1 truncate rounded px-2 py-1 text-left text-sm hover:bg-accent/15"
                    >
                      {b.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(b.id)}
                      className="px-1 text-xs text-red-500 hover:underline"
                      aria-label={`Remove ${b.label}`}
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}
      </div>

      {supportsTypography && (
        <div className="relative">
          <button
            type="button"
            onClick={() => toggle('font')}
            className="icon-btn !h-9 !w-9"
            aria-label="Typography settings"
            aria-expanded={panel === 'font'}
          >
            <Type size={18} />
          </button>
          {panel === 'font' && (
            <Panel>
              <Row label="Font">
                <div className="flex gap-1">
                  {(['serif', 'sans'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => updatePrefs({ fontFamily: f })}
                      className={
                        'rounded px-3 py-1 text-sm capitalize ' +
                        (prefs.fontFamily === f ? 'bg-accent text-white' : 'bg-black/5 dark:bg-white/10')
                      }
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </Row>
              <Stepper
                label="Size"
                value={`${prefs.fontSize}px`}
                onDec={() => updatePrefs({ fontSize: Math.max(12, prefs.fontSize - 1) })}
                onInc={() => updatePrefs({ fontSize: Math.min(40, prefs.fontSize + 1) })}
              />
              <Stepper
                label="Spacing"
                value={prefs.lineHeight.toFixed(1)}
                onDec={() => updatePrefs({ lineHeight: Math.max(1, +(prefs.lineHeight - 0.1).toFixed(1)) })}
                onInc={() => updatePrefs({ lineHeight: Math.min(2.4, +(prefs.lineHeight + 0.1).toFixed(1)) })}
              />
              <Stepper
                label="Width"
                value={`${prefs.width}px`}
                onDec={() => updatePrefs({ width: Math.max(480, prefs.width - 40) })}
                onInc={() => updatePrefs({ width: Math.min(1000, prefs.width + 40) })}
              />
            </Panel>
          )}
        </div>
      )}

      {/* progress bar */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/10 dark:bg-white/10">
        <div className="h-full bg-accent transition-all" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass animate-fade-up absolute right-0 top-12 w-64 rounded-xl p-3 shadow-xl">
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <span className="text-sm text-ink/70 dark:text-paper/70">{label}</span>
      {children}
    </div>
  )
}

function Stepper({
  label,
  value,
  onDec,
  onInc,
}: {
  label: string
  value: string
  onDec: () => void
  onInc: () => void
}) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onDec} className="icon-btn !h-7 !w-7" aria-label={`Decrease ${label}`}>
          <Minus size={14} />
        </button>
        <span className="w-12 text-center text-sm tabular-nums">{value}</span>
        <button type="button" onClick={onInc} className="icon-btn !h-7 !w-7" aria-label={`Increase ${label}`}>
          <Plus size={14} />
        </button>
      </div>
    </Row>
  )
}
