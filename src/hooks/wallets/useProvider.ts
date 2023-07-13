import { useMemo } from 'react'
import type { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { createSafeAppsWeb3Provider, createWeb3, createWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useAppSelector } from '@/store'
import { selectRpc } from '@/store/settingsSlice'

export const useProvider = (isSafeApp = false): JsonRpcProvider | Web3Provider | undefined => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const rpcMap = useAppSelector(selectRpc)

  return useMemo(() => {
    if (!chain) {
      return
    }

    const isReadOnly = !wallet || wallet.chainId !== chain.chainId

    if (!isReadOnly) {
      return createWeb3(wallet.provider)
    }

    const customRpc = rpcMap[chain.chainId]

    if (!isSafeApp) {
      return createWeb3ReadOnly(chain.rpcUri, customRpc)
    } else {
      return createSafeAppsWeb3Provider(chain.safeAppsRpcUri, customRpc)
    }
  }, [chain, wallet, isSafeApp, rpcMap])
}
