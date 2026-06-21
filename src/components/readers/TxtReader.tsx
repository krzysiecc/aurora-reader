import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { ReaderHandle, ReaderViewProps } from './types'

/**
 * Plain-text reader. Progress and saved location are the vertical scroll ratio
 * (0..1) of the reading column.
 */
const TxtReader = forwardRef<ReaderHandle, ReaderViewProps>(function TxtReader(
  { blob, initialLocation, prefs, onProgress },
  ref,
) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')
  const [loaded, setLoaded] = useState(false)
  const rafRef = useRef(0)

  useImperativeHandle(ref, () => ({
    goTo: (location) => {
      const el = scrollRef.current
      if (!el) return
      const ratio = parseFloat(location)
      if (Number.isFinite(ratio)) el.scrollTop = ratio * (el.scrollHeight - el.clientHeight)
    },
  }))

  useEffect(() => {
    let cancelled = false
    blob.text().then((t) => {
      if (!cancelled) {
        setText(t)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [blob])

  // Restore the saved scroll position once the text is laid out.
  useEffect(() => {
    if (!loaded) return
    const el = scrollRef.current
    if (!el || !initialLocation) return
    const ratio = parseFloat(initialLocation)
    if (Number.isFinite(ratio)) {
      requestAnimationFrame(() => {
        el.scrollTop = ratio * (el.scrollHeight - el.clientHeight)
      })
    }
    // Only on first layout of this blob.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  const onScroll = () => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = scrollRef.current
      if (!el) return
      const max = el.scrollHeight - el.clientHeight
      const ratio = max > 0 ? el.scrollTop / max : 0
      onProgress(Math.min(1, Math.max(0, ratio)), ratio.toFixed(4))
    })
  }

  return (
    <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto px-6 py-10">
      <article
        className="mx-auto whitespace-pre-wrap"
        style={{
          maxWidth: prefs.width,
          fontFamily: prefs.fontFamily === 'serif' ? 'Georgia, serif' : 'Inter, system-ui, sans-serif',
          fontSize: prefs.fontSize,
          lineHeight: prefs.lineHeight,
        }}
      >
        {loaded ? text : 'Loading…'}
      </article>
    </div>
  )
})

export default TxtReader
