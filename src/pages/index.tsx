import { useLayoutEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import useLastSafe from '@/hooks/useLastSafe'
import { AppRoutes } from '@/config/routes'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { safe, chain } = router.query
  const lastSafe = useLastSafe()
  const safeAddress = safe || lastSafe

  useLayoutEffect(() => {
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
