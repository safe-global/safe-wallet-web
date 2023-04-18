import { useEffect, useLayoutEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import useLastSafe from '@/hooks/useLastSafe'
import { AppRoutes } from '@/config/routes'

const useIsomorphicEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { safe, chain } = router.query
  const lastSafe = useLastSafe()
  const safeAddress = safe || lastSafe

  useIsomorphicEffect(() => {
    if (router.pathname !== AppRoutes.index) {
      return
    }

    router.replace(
      safeAddress
        ? `${AppRoutes.home}?safe=${safeAddress}`
        : chain
        ? `${AppRoutes.welcome}?chain=${chain}`
        : AppRoutes.welcome,
    )
  }, [router, safeAddress, chain])

  return <></>
}

export default IndexPage
