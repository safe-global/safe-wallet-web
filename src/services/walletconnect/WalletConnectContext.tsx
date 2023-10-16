import { getSdkError } from '@walletconnect/utils'
import { formatJsonRpcError } from '@walletconnect/jsonrpc-utils'
import { type ReactNode, createContext, useEffect, useState } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import WalletConnectWallet from './WalletConnectWallet'
import { asError } from '../exceptions/utils'
import { stripEip155Prefix } from './utils'
import { useWalletConnectSearchParamUri } from './useWalletConnectSearchParamUri'
import { useWalletConnectClipboardUri } from './useWalletConnectClipboardUri'

const walletConnectSingleton = new WalletConnectWallet()

const isWcUri = (uri: string) => uri.startsWith('wc:')

export const WalletConnectContext = createContext<{
  walletConnect: WalletConnectWallet | null
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
  const [walletConnect, setWalletConnect] = useState<WalletConnectWallet | null>(null)
  const [searchParamWcUri, setSearchParamWcUri] = useWalletConnectSearchParamUri()
  const [clipboardWcUri, setClipboardWcUri] = useWalletConnectClipboardUri()
  const [error, setError] = useState<Error | null>(null)
  const safeWalletProvider = useSafeWalletProvider()

  // Init WalletConnect
  useEffect(() => {
    walletConnectSingleton
      .init()
      .then(() => setWalletConnect(walletConnectSingleton))
      .catch(setError)
  }, [])

  // Connect to session present in URL
  useEffect(() => {
    if (!walletConnect || !searchParamWcUri || !isWcUri(searchParamWcUri)) return

    walletConnect.connect(searchParamWcUri).catch(setError)

    return walletConnect.onSessionAdd(() => {
      setSearchParamWcUri(null)
    })
  }, [setSearchParamWcUri, walletConnect, searchParamWcUri])

  // Connect to session present in clipboard on focus
  useEffect(() => {
    if (!walletConnect || !clipboardWcUri || !isWcUri(clipboardWcUri)) return

    walletConnect.connect(clipboardWcUri).catch(setError)

    return walletConnect.onSessionAdd(() => {
      setClipboardWcUri('')
    })
  }, [setClipboardWcUri, walletConnect, clipboardWcUri])

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

      const getResponse = () => {
        // Get error if wrong chain
        if (!session || requestChainId !== chainId) {
          const error = getSdkError('UNSUPPORTED_CHAINS')
          return formatJsonRpcError(event.id, error)
        }

        // Get response from Safe Wallet Provider
        return safeWalletProvider.request(event.id, event.params.request, {
          name: session.peer.metadata.name,
          description: session.peer.metadata.description,
          url: session.peer.metadata.url,
          iconUrl: session.peer.metadata.icons[0],
        })
      }

      try {
        const response = await getResponse()

        // Send response to WalletConnect
        await walletConnect.sendSessionResponse(topic, response)
      } catch (e) {
        setError(asError(e))
      }
    })
  }, [walletConnect, chainId, safeWalletProvider])

  return <WalletConnectContext.Provider value={{ walletConnect, error }}>{children}</WalletConnectContext.Provider>
}
