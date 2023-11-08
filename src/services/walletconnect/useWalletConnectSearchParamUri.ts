import { useRouter } from 'next/router'
import { parse } from 'querystring'
import { useCallback, useEffect, useState } from 'react'

const WC_URI_SEARCH_PARAM = 'wc'

export function useWalletConnectSearchParamUri(): [string | null, (wcUri: string | null) => void] {
  const router = useRouter()
  const wcQuery = router.query[WC_URI_SEARCH_PARAM]
  const [rawUrlParam, setRawUrlParam] = useState('')

  useEffect(() => {
    // Don't use router.query because it cuts off internal paramters of the WC URI (e.g. symKey)
    const query = parse(window.location.search.slice(1))
    const wcUri = query[WC_URI_SEARCH_PARAM] || ''
    setRawUrlParam(wcUri.toString())
  }, [wcQuery])

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

  return [rawUrlParam, setWcUri]
}
