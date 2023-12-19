import { useEffect } from 'react'

import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { createWeb3, createWeb3ReadOnly, setWeb3, setWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useAppSelector } from '@/store'
import { selectRpc } from '@/store/settingsSlice'

const READONLY_WAIT = 3000

export const useInitWeb3 = () => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const customRpc = useAppSelector(selectRpc)
  const customRpcUrl = chain ? customRpc?.[chain.chainId] : undefined

  useEffect(() => {
    if (!chain) return

    if (wallet) {
      const web3 = createWeb3(wallet.provider)
      setWeb3(web3)

      if (wallet.chainId === chain.chainId) {
        setWeb3ReadOnly(web3)
        return
      }
    }

    // Wait for wallet to be connected
    const timeout = setTimeout(() => {
      const web3ReadOnly = createWeb3ReadOnly(chain.rpcUri, customRpcUrl)
      setWeb3ReadOnly(web3ReadOnly)
    }, READONLY_WAIT)

    return () => clearTimeout(timeout)
  }, [wallet, chain, customRpcUrl])
}
