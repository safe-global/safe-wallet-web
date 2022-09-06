import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useLastSafe } from '@/hooks/useLastSafe'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain } = router.query
  const lastSafe = useLastSafe()

  useEffect(() => {
    router.push(lastSafe ? `/safe/home?safe=${lastSafe}` : chain ? `/welcome?chain=${chain}` : `/welcome`)
  }, [router, lastSafe, chain])

  return <></>
}

export default IndexPage
