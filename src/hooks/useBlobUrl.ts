import { useEffect, useState } from 'react'
import { getBlob } from '@/lib/blobStore'

/**
 * Resolve an IndexedDB blob key to an object URL, revoking it on cleanup so we
 * never leak. Returns `null` while loading or when there is no key.
 */
export function useBlobUrl(key: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let revoked = false
    let objectUrl: string | null = null

    if (!key) {
      setUrl(null)
      return
    }

    getBlob(key).then((blob) => {
      if (revoked || !blob) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    })

    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [key])

  return url
}
