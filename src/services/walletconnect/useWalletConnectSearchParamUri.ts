import { useRouter } from 'next/router'
import { useCallback } from 'react'

const WC_URI_SEARCH_PARAM = 'wc'

export function useWalletConnectSearchParamUri(): [string | null, (wcUri: string | null) => void] {
  const router = useRouter()

  const wcUriQuery = router.query[WC_URI_SEARCH_PARAM]
  const wcUri = wcUriQuery ? (Array.isArray(wcUriQuery) ? wcUriQuery[0] : wcUriQuery) : null

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
