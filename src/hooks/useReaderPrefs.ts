import { useCallback, useState } from 'react'
import { DEFAULT_READER_PREFS } from '@/types'
import type { ReaderPrefs } from '@/types'
import { read, write } from '@/lib/storage'

const KEY = 'reader-prefs'

/** Reading preferences (font, size, spacing, width) shared across all books. */
export function useReaderPrefs() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(() =>
    read<ReaderPrefs>(KEY, DEFAULT_READER_PREFS),
  )

  const update = useCallback((patch: Partial<ReaderPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      write(KEY, next)
      return next
    })
  }, [])

  return [prefs, update] as const
}
