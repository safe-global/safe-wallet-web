import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { parse } from 'querystring'
import useLastSafe from '@/hooks/useLastSafe'
import { AppRoutes } from '@/config/routes'

const WcPage: NextPage = () => {
  const router = useRouter()
  const lastSafe = useLastSafe()

  useEffect(() => {
    if (!router.isReady || router.pathname !== AppRoutes.wc) {
      return
    }

    // Don't use router.query because it cuts off internal paramters of the WC URI (e.g. symKey)
    const { uri } = parse(window.location.search.slice(1))

    router.replace(
      lastSafe
        ? {
            pathname: AppRoutes.home,
            query: {
              safe: lastSafe,
              wc: uri,
            },
          }
        : {
            pathname: AppRoutes.welcome,
            query: {
              wc: uri,
            },
          },
    )
  }, [router, lastSafe])

  return <></>
}

export default WcPage
