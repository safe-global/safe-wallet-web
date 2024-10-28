import { useRouter } from 'next/router'
import { sanitizeUrl } from '@/utils/url'
import { useEffect, useMemo, useState } from 'react'
import DOMPurify from 'dompurify'

const useSafeAppUrl = (): string | undefined => {
  const router = useRouter()
  const [appUrl, setAppUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!router.isReady) return
    setAppUrl(router.query.appUrl?.toString())
  }, [router])

  return useMemo(() => (appUrl ? DOMPurify.sanitize(sanitizeUrl(appUrl)) : undefined), [appUrl])
}

export { useSafeAppUrl }
