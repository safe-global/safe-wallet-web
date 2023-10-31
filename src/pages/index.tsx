import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain } = router.query

  useEffect(() => {
    if (router.pathname === AppRoutes.index) {
      router.replace(chain ? `${AppRoutes.welcome}?chain=${chain}` : AppRoutes.welcome)
    }
  }, [router, chain])

  return <></>
}

export default IndexPage
