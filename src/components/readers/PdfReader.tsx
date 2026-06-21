import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import type { ReaderHandle, ReaderViewProps } from './types'

// Bundle the pdf.js worker locally (Vite resolves this to an asset URL).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/**
 * PDF reader powered by react-pdf / pdf.js. Location is the page number;
 * progress is page / total. Font controls don't apply to fixed-layout PDFs.
 */
const PdfReader = forwardRef<ReaderHandle, ReaderViewProps>(function PdfReader(
  { blob, initialLocation, onProgress },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(() => {
    const p = parseInt(initialLocation ?? '1', 10)
    return Number.isFinite(p) && p > 0 ? p : 1
  })
  const [width, setWidth] = useState(720)

  const fileUrl = useMemo(() => URL.createObjectURL(blob), [blob])
  useEffect(() => () => URL.revokeObjectURL(fileUrl), [fileUrl])

  // Fit page width to the container.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.min(900, entry.contentRect.width - 32))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const goToPage = (next: number) => {
    if (!numPages) return
    const clamped = Math.min(numPages, Math.max(1, next))
    setPage(clamped)
    onProgress(clamped / numPages, String(clamped))
  }

  useImperativeHandle(ref, () => ({
    goTo: (location) => goToPage(parseInt(location, 10) || 1),
    next: () => goToPage(page + 1),
    prev: () => goToPage(page - 1),
  }))

  return (
    <div ref={containerRef} className="flex h-full flex-col items-center overflow-y-auto py-6">
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n)
          onProgress(page / n, String(page))
        }}
        loading={<p className="mt-10 text-ink/60 dark:text-paper/60">Loading PDF…</p>}
        error={<p className="mt-10 text-red-500">Could not open this PDF.</p>}
      >
        <Page
          pageNumber={page}
          width={width}
          renderAnnotationLayer={false}
          className="overflow-hidden rounded-lg shadow-lg"
        />
      </Document>

      {numPages > 0 && (
        <div className="glass sticky bottom-4 mt-4 flex items-center gap-3 rounded-full px-4 py-2 text-sm">
          <button
            type="button"
            className="rounded px-2 disabled:opacity-40"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >
            ‹ Prev
          </button>
          <span>
            Page {page} / {numPages}
          </span>
          <button
            type="button"
            className="rounded px-2 disabled:opacity-40"
            onClick={() => goToPage(page + 1)}
            disabled={page >= numPages}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  )
})

export default PdfReader
