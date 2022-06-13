import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useLastSafeAddress } from '@/store/sessionSlice'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain } = router.query
  const lastSafeAddress = useLastSafeAddress()

  useEffect(() => {
    router.push(lastSafeAddress ? `/${lastSafeAddress}` : chain ? `/welcome?chain=${chain}` : `/welcome`)
  }, [router, lastSafeAddress])

  return <></>
}

export default IndexPage
