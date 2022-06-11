import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAppSelector } from '@/store'
import { selectSession } from '@/store/sessionSlice'
import type { NextPage } from 'next'
import chains from '@/config/chains'

const IndexPage: NextPage = () => {
  const router = useRouter()
  const { lastSafeAddress, lastChainId } = useAppSelector(selectSession)
  const lastChain = Object.entries(chains).find(([, chainId]) => chainId === lastChainId)
  const fullSafeAddress = lastChain && lastSafeAddress ? `${lastChain[0]}:${lastSafeAddress}` : ''

  useEffect(() => {
    router.push(fullSafeAddress ? `/${fullSafeAddress}` : '/welcome')
  }, [router, fullSafeAddress])

  return <></>
}

export default IndexPage
