import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

const ADDED_SAFES_KEY = 'SAFE_v2__addedSafes'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain } = router.query

  useEffect(() => {
    if (!router.isReady || router.pathname !== AppRoutes.index) {
      return
    }

    // read directly from localstorage so we have value on first render
    const localSafes = localStorage.getItem(ADDED_SAFES_KEY)
    const pathname = localSafes ? AppRoutes.welcome.accounts : AppRoutes.welcome.index

    router.replace({
      pathname,
      query: chain ? { chain } : undefined,
    })
  }, [router, chain])

  return <></>
}

export default IndexPage
