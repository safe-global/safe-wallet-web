import { type ReactNode, createContext, useEffect, useState } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import WalletConnectWallet from './WalletConnectWallet'
import { asError } from '../exceptions/utils'

const walletConnect = new WalletConnectWallet()

export const WalletConnectContext = createContext<{
  walletConnect: WalletConnectWallet
  error: Error | null
}>({
  walletConnect,
  error: null,
})

export const WalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()
  const [error, setError] = useState<Error | null>(null)
  const safeWalletProvider = useSafeWalletProvider()

  // Init WalletConnect
  useEffect(() => {
    walletConnect.init().catch(setError)
  }, [])

  // Update chainId
  useEffect(() => {
    if (chainId) {
      walletConnect.chainChanged(chainId).catch(setError)
    }
  }, [chainId])

  // Update accounts
  useEffect(() => {
    if (safeAddress && chainId) {
      walletConnect.accountsChanged(chainId, safeAddress).catch(setError)
    }
  }, [chainId, safeAddress])

  // Subscribe to requests
  useEffect(() => {
    if (!safeWalletProvider || !chainId) return

    return walletConnect.onSessionRequest(async (event) => {
      const { topic } = event // TODO: use session topic to filter requests
      const requestChainId = event.params.chainId.split(':').pop()

      if (requestChainId !== chainId) return

      try {
        // Get response from the Safe Wallet Provider
        const response = await safeWalletProvider.request(event.id, event.params.request)

        // Send response to WalletConnect
        await walletConnect.sendSessionResponse(topic, response)
      } catch (e) {
        setError(asError(e))
      }
    })
  }, [chainId, safeWalletProvider])

  return <WalletConnectContext.Provider value={{ walletConnect, error }}>{children}</WalletConnectContext.Provider>
}
