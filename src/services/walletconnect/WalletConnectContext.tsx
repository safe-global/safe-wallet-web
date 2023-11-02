import { getSdkError } from '@walletconnect/utils'
import { formatJsonRpcError } from '@walletconnect/jsonrpc-utils'
import { type ReactNode, createContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import useSafeWalletProvider from '@/services/safe-wallet-provider/useSafeWalletProvider'
import WalletConnectWallet from './WalletConnectWallet'
import { asError } from '../exceptions/utils'
import { getPeerName, stripEip155Prefix } from './utils'
import { IS_PRODUCTION } from '@/config/constants'
import { SafeAppsTag } from '@/config/constants'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { trackRequest } from './tracking'

enum Errors {
  WRONG_CHAIN = '%%dappName%% made a request on a different chain than the one you are connected to',
}

const getWrongChainError = (dappName: string): Error => {
  const message = Errors.WRONG_CHAIN.replace('%%dappName%%', dappName)
  return new Error(message)
}

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

const useWalletConnectApp = () => {
  const [matchingApps] = useRemoteSafeApps(SafeAppsTag.WALLET_CONNECT)
  return matchingApps?.[0]
}

export const WalletConnectProvider = ({ children }: { children: ReactNode }) => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()
  const [walletConnect, setWalletConnect] = useState<WalletConnectWallet | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const safeWalletProvider = useSafeWalletProvider()
  const wcApp = useWalletConnectApp()

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

      // Track requests
      if (session) {
        trackRequest(session.peer.metadata.url, event.params.request.method)
      }

      const getResponse = () => {
        // Get error if wrong chain
        if (!session || requestChainId !== chainId) {
          if (session) {
            setError(getWrongChainError(getPeerName(session.peer)))
          }

          const error = getSdkError('UNSUPPORTED_CHAINS')
          return formatJsonRpcError(event.id, error)
        }

        // Get response from Safe Wallet Provider
        return safeWalletProvider.request(event.id, event.params.request, {
          id: wcApp?.id || -1,
          url: wcApp?.url || '',
          name: getPeerName(session.peer) || 'Unknown dApp',
          description: session.peer.metadata.description,
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
  }, [walletConnect, chainId, safeWalletProvider, wcApp])

  return (
    <WalletConnectContext.Provider value={{ walletConnect, error, setError, open, setOpen }}>
      {children}
    </WalletConnectContext.Provider>
  )
}
