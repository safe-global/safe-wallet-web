import { useRouter } from 'next/router'
import { resolveHref } from 'next/dist/shared/lib/router/router'
import { useEffect, useState } from 'react'
import type { UrlObject } from 'url'

import { AppRoutes } from '@/config/routes'
import { useCurrentChain } from '@/hooks/useChains'

export const useShareSafeAppUrl = (appUrl: string): string => {
  const router = useRouter()
  const chain = useCurrentChain()
  const [shareSafeAppUrl, setShareSafeAppUrl] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const shareUrlObj: UrlObject = {
      protocol: window.location.protocol,
      host: window.location.host,
      pathname: AppRoutes.share.safeApp,
      query: { appUrl, chain: chain?.shortName },
    }

    setShareSafeAppUrl(resolveHref(router, shareUrlObj))
  }, [appUrl, chain?.shortName, router])

  return shareSafeAppUrl
}
