import { useEffect } from 'react'

import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { createWeb3, createWeb3ReadOnly, setWeb3, setWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useAppSelector } from '@/store'
import { selectRpc } from '@/store/settingsSlice'

export const useInitWeb3 = () => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const customRpc = useAppSelector(selectRpc)
  const customRpcUrl = chain ? customRpc?.[chain.chainId] : undefined

  useEffect(() => {
    if (!chain) return

    let web3
    if (wallet) {
      web3 = createWeb3(wallet.provider)
      setWeb3(web3)
    }

    let web3ReadOnly
    if (wallet && wallet.chainId === chain.chainId) {
      web3ReadOnly = web3
    } else {
      web3ReadOnly = createWeb3ReadOnly(chain.rpcUri, customRpcUrl)
    }
    setWeb3ReadOnly(web3ReadOnly)
  }, [wallet, chain, customRpcUrl])
}
