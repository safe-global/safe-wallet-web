import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import useLastSafe from '@/hooks/useLastSafe'
import { AppRoutes } from '@/config/routes'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain } = router.query
  const lastSafe = useLastSafe()

  useEffect(() => {
    router.replace(
      lastSafe
        ? `${AppRoutes.home}?safe=${lastSafe}`
        : chain
        ? `${AppRoutes.welcome}?chain=${chain}`
        : AppRoutes.welcome,
    )
  }, [router, lastSafe, chain])

  return <></>
}

export default IndexPage
