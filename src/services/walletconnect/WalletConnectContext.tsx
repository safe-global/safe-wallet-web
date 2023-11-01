import { getSdkError } from '@walletconnect/utils'
import { formatJsonRpcError } from '@walletconnect/jsonrpc-utils'
import { type ReactNode, createContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import WalletConnectWallet from './WalletConnectWallet'
import { asError } from '../exceptions/utils'
import { getPeerName, stripEip155Prefix } from './utils'
import { IS_PRODUCTION } from '@/config/constants'
import { trackEvent } from '../analytics'
import { WALLETCONNECT_EVENTS } from '../analytics/events/walletconnect'

const walletConnectSingleton = new WalletConnectWallet()

export const WalletConnectContext = createContext<{
  walletConnect: WalletConnectWallet | null
  error: Error | null
  setError: Dispatch<SetStateAction<Error | null>>
  open: boolean
  setOpen: (open: boolean) => void
}>({
  walletConnect: null,
  error: null,
  setError: () => {},
  open: false,
  setOpen: (_open: boolean) => {},
})

export const WalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()
  const [walletConnect, setWalletConnect] = useState<WalletConnectWallet | null>(null)
  const [open, setOpen] = useState(false)
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
      if (!IS_PRODUCTION) {
        console.log('[WalletConnect] request', event)
      }

      const { topic } = event
      const session = walletConnect.getActiveSessions().find((s) => s.topic === topic)
      const requestChainId = stripEip155Prefix(event.params.chainId)

      // Track all requests
      if (session) {
        trackEvent({ ...WALLETCONNECT_EVENTS.REQUEST, label: session.peer.metadata.url })
      }

      const getResponse = () => {
        // Get error if wrong chain
        if (!session || requestChainId !== chainId) {
          const error = getSdkError('UNSUPPORTED_CHAINS')
          setError(new Error(error.message))
          return formatJsonRpcError(event.id, error)
        }

        // Get response from Safe Wallet Provider
        return safeWalletProvider.request(event.id, event.params.request, {
          name: getPeerName(session.peer) || 'Unknown dApp',
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

  return (
    <WalletConnectContext.Provider value={{ walletConnect, error, setError, open, setOpen }}>
      {children}
    </WalletConnectContext.Provider>
  )
}
