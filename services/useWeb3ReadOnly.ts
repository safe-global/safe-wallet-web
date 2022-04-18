import { useEffect } from 'react'
import { getRpcServiceUrl, setWeb3ReadOnly } from '@/services/web3'
import Web3 from 'web3'
import { useCurrentChain } from './useChains'

export const useInitWeb3ReadOnly = () => {
  const chainConfig = useCurrentChain()

  useEffect(() => {
    if (!chainConfig) return

    const provider = new Web3.providers.HttpProvider(getRpcServiceUrl(chainConfig.rpcUri))
    setWeb3ReadOnly(provider)
  }, [chainConfig])
}
