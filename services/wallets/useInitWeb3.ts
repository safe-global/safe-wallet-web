import { useState, useEffect } from 'react'
import type { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

import { useCurrentChain } from '@/services/useChains'
import useWallet from '@/services/wallets/useWallet'
import { createWeb3, createWeb3ReadOnly } from '@/services/wallets/web3'
import ExternalStore from '@/services/ExternalStore'

export const { getStore: getWeb3, setStore: setWeb3, useStore: useWeb3 } = new ExternalStore<Web3Provider>()

export const {
  getStore: getWeb3ReadOnly,
  setStore: setWeb3ReadOnly,
  useStore: useWeb3ReadOnly,
} = new ExternalStore<JsonRpcProvider>()

export const useInitWeb3 = () => {
  const [readOnlyChainId, setReadOnlyChainId] = useState<string>()

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
    if (!chain || readOnlyChainId === chain.chainId) {
      return
    }
    const web3ReadOnly = createWeb3ReadOnly(chain)
    setWeb3ReadOnly(web3ReadOnly)

    // We cache the `chainId` to avoid calling `web3ReadOnly.getNetwork()` above
    setReadOnlyChainId(chain.chainId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain])
}
