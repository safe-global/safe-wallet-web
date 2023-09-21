import { createContext, useEffect, useState } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import WalletConnectWallet from './WalletConnectWallet'

const walletConnect = new WalletConnectWallet()

export const WalletConnectContext = createContext<{
  walletConnect: WalletConnectWallet
  initError: Error | null
}>({
  walletConnect,
  initError: null,
})

export const WalletConnectProvider = ({ children }: { children: JSX.Element }) => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()
  const [initError, setInitError] = useState<Error | null>(null)

  useEffect(() => {
    walletConnect.init().catch(setInitError)
  }, [])

  useEffect(() => {
    if (chainId) {
      walletConnect.chainChanged(chainId)
    }
  }, [chainId])

  useEffect(() => {
    if (safeAddress && chainId) {
      walletConnect.accountsChanged(chainId, safeAddress)
    }
  }, [chainId, safeAddress])

  return <WalletConnectContext.Provider value={{ walletConnect, initError }}>{children}</WalletConnectContext.Provider>
}
