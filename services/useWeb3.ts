import { useEffect } from 'react'
import { setWeb3 } from '@/services/web3'
import Web3 from 'web3'
import { useCurrentChain } from './useChains'

export const useInitWeb3 = () => {
  const chainConfig = useCurrentChain()

  useEffect(() => {
    if (!chainConfig) return

    // TODO: Replace with provider from onboard
    const provider = Web3.givenProvider
    setWeb3(provider)
  }, [chainConfig])
}
