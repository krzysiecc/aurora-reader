import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import ePub from 'epubjs'
import { useTheme } from '@/lib/theme'
import type { ReaderHandle, ReaderViewProps } from './types'

/**
 * EPUB reader powered by epub.js. Location is a CFI string; progress is the
 * book percentage epub.js derives from generated locations. epub.js ships
 * loose types, so the book/rendition handles are intentionally untyped here.
 */
const EpubReader = forwardRef<ReaderHandle, ReaderViewProps>(function EpubReader(
  { blob, initialLocation, prefs, onProgress },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renditionRef = useRef<any>(null)
  const { theme } = useTheme()

  useImperativeHandle(ref, () => ({
    goTo: (location) => renditionRef.current?.display(location),
    next: () => renditionRef.current?.next(),
    prev: () => renditionRef.current?.prev(),
  }))

  // Create the book + rendition once per blob.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let destroyed = false

    blob.arrayBuffer().then((buffer) => {
      if (destroyed) return
      const book = ePub(buffer)
      bookRef.current = book
      const rendition = book.renderTo(host, {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        spread: 'none',
      })
      renditionRef.current = rendition
      rendition.display(initialLocation || undefined)

      book.ready
        .then(() => book.locations.generate(1000))
        .then(() => {
          rendition.on('relocated', (location: { start: { cfi: string } }) => {
            const cfi = location.start.cfi
            const percent = book.locations.percentageFromCfi(cfi) ?? 0
            onProgress(percent, cfi)
          })
        })
    })

    return () => {
      destroyed = true
      renditionRef.current?.destroy()
      bookRef.current?.destroy()
      renditionRef.current = null
      bookRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob])

  // Re-apply typography + dark/light styling when prefs or theme change.
  useEffect(() => {
    const rendition = renditionRef.current
    if (!rendition) return
    const fg = theme === 'dark' ? '#f6f6f6' : '#161616'
    rendition.themes.override('color', fg)
    rendition.themes.override('background', 'transparent')
    rendition.themes.override('line-height', String(prefs.lineHeight))
    rendition.themes.font(prefs.fontFamily === 'serif' ? 'Georgia, serif' : 'Inter, sans-serif')
    rendition.themes.fontSize(`${prefs.fontSize}px`)
  }, [prefs, theme])

  return (
    <div className="relative h-full">
      <div ref={hostRef} className="mx-auto h-full" style={{ maxWidth: prefs.width + 80 }} />
    </div>
  )
})

export default EpubReader
