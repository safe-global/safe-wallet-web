import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { useHasSafes } from '@/components/welcome/MyAccounts/useAllSafes'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain } = router.query
  const { hasSafes } = useHasSafes()

  useEffect(() => {
    if (!router.isReady || router.pathname !== AppRoutes.index) {
      return
    }

    const pathname = hasSafes ? AppRoutes.welcome.accounts : AppRoutes.welcome.index

    router.replace({
      pathname,
      query: chain ? { chain } : undefined,
    })
  }, [router, chain, hasSafes])

  return <></>
}

export default IndexPage
