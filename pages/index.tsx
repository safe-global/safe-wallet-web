import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { selectLastSafeAddress } from '@/store/sessionSlice'
import { useAppSelector } from '@/store'
import useChainId from '@/hooks/useChainId'
import chains from '@/config/chains'
import { AppRoutes } from '@/config/routes'

const useLastSafe = (): string | undefined => {
  const chainId = useChainId()
  const lastSafeAddress = useAppSelector((state) => selectLastSafeAddress(state, chainId))
  const prefix = Object.keys(chains).find((prefix) => chains[prefix] === chainId)
  return prefix && lastSafeAddress ? `${prefix}:${lastSafeAddress}` : undefined
}

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { chain } = router.query
  const lastSafe = useLastSafe()

  useEffect(() => {
    const loadLastSafe = ![AppRoutes.welcome, AppRoutes.load, AppRoutes.open].includes(router.pathname)

    router.push(
      loadLastSafe && lastSafe ? `/safe/home?safe=${lastSafe}` : chain ? `/welcome?chain=${chain}` : `/welcome`,
    )
  }, [router, lastSafe, chain])

  return <></>
}

export default IndexPage
