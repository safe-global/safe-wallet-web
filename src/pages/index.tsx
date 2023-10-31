import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'

const IndexPage: NextPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (router.pathname === AppRoutes.index) {
      router.replace({
        pathname: AppRoutes.welcome,
        query: router.query,
      })
    }
  }, [router])

  return <></>
}

export default IndexPage
