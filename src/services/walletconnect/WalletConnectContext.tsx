import { type ReactNode, createContext, useEffect, useState } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import WalletConnectWallet from './WalletConnectWallet'
import { asError } from '../exceptions/utils'
import { stripEip155Prefix } from './utils'

const walletConnectSingleton = WalletConnectWallet

export const WalletConnectContext = createContext<{
  walletConnect: typeof WalletConnectWallet | null
  error: Error | null
}>({
  walletConnect: null,
  error: null,
})

export const WalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()
  const [walletConnect, setWalletConnect] = useState<typeof WalletConnectWallet | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const safeWalletProvider = useSafeWalletProvider()

  // Init WalletConnect
  useEffect(() => {
    walletConnectSingleton
      .init()
      .then(() => setWalletConnect(walletConnectSingleton))
      .catch(setError)
  }, [])

  // Update chainId/safeAddress
  useEffect(() => {
    if (!walletConnect || !chainId || !safeAddress) return

    walletConnect.updateSessions(chainId, safeAddress).catch(setError)
  }, [walletConnect, chainId, safeAddress])

  // Subscribe to requests
  useEffect(() => {
    if (!walletConnect || !safeWalletProvider || !chainId) return

    return walletConnect.onRequest(async (event) => {
      const { topic } = event
      const session = walletConnect.getActiveSessions().find((s) => s.topic === topic)
      const requestChainId = stripEip155Prefix(event.params.chainId)

      if (!session || requestChainId !== chainId) return

      try {
        // Get response from the Safe Wallet Provider
        const response = await safeWalletProvider.request(event.id, event.params.request, {
          name: session.peer.metadata.name,
          description: session.peer.metadata.description,
          url: session.peer.metadata.url,
          iconUrl: session.peer.metadata.icons[0],
        })

        console.log('============', response)

        // Send response to WalletConnect
        await walletConnect.sendSessionResponse(topic, response)
      } catch (e) {
        setError(asError(e))
      }
    })
  }, [walletConnect, chainId, safeWalletProvider])

  return <WalletConnectContext.Provider value={{ walletConnect, error }}>{children}</WalletConnectContext.Provider>
}
