import { useEffect } from 'react'

import { useCurrentChain } from '@/services/useChains'
import useWallet from '@/services/wallets/useWallet'
import { createWeb3, createWeb3ReadOnly, setWeb3, setWeb3ReadOnly } from '@/services/wallets/web3'

export const useInitWeb3 = () => {
  const chain = useCurrentChain()
  const wallet = useWallet()

  useEffect(() => {
    if (!chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }
    const web3 = createWeb3(wallet.provider)
    setWeb3(web3)
  }, [chain, wallet])

  useEffect(() => {
    if (!chain) {
      return
    }
    const web3ReadOnly = createWeb3ReadOnly(chain)
    setWeb3ReadOnly(web3ReadOnly)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain?.chainId])
}
