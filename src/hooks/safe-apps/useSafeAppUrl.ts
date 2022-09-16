import { useRouter } from 'next/router'
import { sanitizeUrl } from '@/utils/url'
import { useMemo } from 'react'

const useSafeAppUrl = (): [string | undefined, boolean] => {
  const router = useRouter()
  const { appUrl } = router.query

  return useMemo(
    () => [typeof appUrl === 'string' ? sanitizeUrl(appUrl) : undefined, router.isReady],
    [appUrl, router.isReady],
  )
}

export { useSafeAppUrl }
