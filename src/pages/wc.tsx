import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import useLastSafe from '@/hooks/useLastSafe'
import { AppRoutes } from '@/config/routes'

const WcPage: NextPage = () => {
  const router = useRouter()
  const lastSafe = useLastSafe()

  useEffect(() => {
    if (!router.isReady || router.pathname !== AppRoutes.wc) {
      return
    }
    const { uri = '' } = router.query
    router.replace(lastSafe ? `${AppRoutes.home}?safe=${lastSafe}&wc=${uri}` : `${AppRoutes.welcome}?wc=${uri}`)
  }, [router, lastSafe])

  return <></>
}

export default WcPage
