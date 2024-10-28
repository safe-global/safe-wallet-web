import { useRouter } from 'next/router'
import { sanitizeUrl } from '@/utils/url'
import { useEffect, useMemo, useState } from 'react'
import DOMPurify from 'dompurify'

const AUTHORIZED_URLS = [
  'https://trustedapp1.com',
  'https://trustedapp2.com',
  // Add more authorized URLs here
]

const useSafeAppUrl = (): string | undefined => {
  const router = useRouter()
  const [appUrl, setAppUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!router.isReady) return
    const url = router.query.appUrl?.toString()
    if (url && AUTHORIZED_URLS.includes(sanitizeUrl(url))) {
      setAppUrl(url)
    } else {
      setAppUrl(undefined)
    }
  }, [router])

  return useMemo(() => (appUrl ? DOMPurify.sanitize(sanitizeUrl(appUrl)) : undefined), [appUrl])
}

export { useSafeAppUrl }
