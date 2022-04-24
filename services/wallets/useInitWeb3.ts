import Web3 from 'web3'
import { useEffect } from 'react'
import { getWeb3ReadOnly, setWeb3, setWeb3ReadOnly } from '@/services/wallets/web3'
import { useCurrentChain } from '@/services/useChains'
import useWallet from './useWallet'

export const useInitWeb3 = (): Web3 => {
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
