import { useRouter } from 'next/router'
import { useCallback } from 'react'

import { isPairingUri } from './utils'

const WC_URI_SEARCH_PARAM = 'wc'

export function useWalletConnectSearchParamUri(): [string | null, (wcUri: string | null) => void] {
  const router = useRouter()

  const wcUriQuery = router.query[WC_URI_SEARCH_PARAM]
  const value = wcUriQuery ? (Array.isArray(wcUriQuery) ? wcUriQuery[0] : wcUriQuery) : null
  const wcUri = value && isPairingUri(value) ? value : null

  const setWcUri = useCallback(
    (wcUri: string | null) => {
      const newQuery = { ...router.query }

      if (!wcUri) {
        delete newQuery[WC_URI_SEARCH_PARAM]
      } else {
        newQuery[WC_URI_SEARCH_PARAM] = wcUri
      }

      router.replace({
        pathname: router.pathname,
        query: newQuery,
      })
    },
    [router],
  )

  return [wcUri, setWcUri]
}
