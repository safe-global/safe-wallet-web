import { useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { selectLastSafeAddress } from '@/store/sessionSlice'
import { useAppSelector } from '@/store'
import useChainId from '@/hooks/useChainId'
import chains from '@/config/chains'

const useLastSafe = (chainId: string): string | undefined => {
  const lastSafeAddress = useAppSelector((state) => selectLastSafeAddress(state, chainId))
  const prefix = Object.keys(chains).find((prefix) => chains[prefix] === chainId)
  return prefix && lastSafeAddress ? `${prefix}:${lastSafeAddress}` : undefined
}

const IndexPage: NextPage = () => {
  const router = useRouter()
  const chainId = useChainId()
  const { chain } = router.query
  const lastSafe = useLastSafe(typeof chain === 'string' ? chains[chain] : chainId)

  useEffect(() => {
    router.push(lastSafe ? `/safe/home?safe=${lastSafe}` : chain ? `/welcome?chain=${chain}` : `/welcome`)
  }, [router, lastSafe, chain])

  return <></>
}

export default IndexPage
