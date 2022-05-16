import { JsonRpcProvider } from '@ethersproject/providers'
import { useEffect } from 'react'
import { getWeb3ReadOnly, setWeb3, setWeb3ReadOnly } from '@/services/wallets/web3'
import { useCurrentChain } from '@/services/useChains'
import useWallet from './useWallet'

export const useInitWeb3 = (): JsonRpcProvider => {
  const chain = useCurrentChain()
  const wallet = useWallet()

  useEffect(() => {
    if (!chain) {
      return
    }
    setWeb3ReadOnly(chain)
  }, [chain])

  useEffect(() => {
    if (!chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }
    setWeb3(wallet.provider)
  }, [chain, wallet])

  return getWeb3ReadOnly()
}
