import Web3 from 'web3'

import { getWeb3ReadOnly, setWeb3ReadOnly } from '@/services/web3'
import { useEffect } from 'react'
import { useCurrentChain } from '@/services/useChains'

export const useInitWeb3ReadOnly = (): Web3 => {
  const chain = useCurrentChain()

  useEffect(() => {
    if (!chain) {
      return
    }
    setWeb3ReadOnly(chain)
  }, [chain])

  return getWeb3ReadOnly()
}
