import { useState, useEffect, useCallback } from 'react'

import { useCurrentChain } from '@/hooks/useChains'
import useOnboard, { getConnectedWallet } from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'
import { getPairingConnector, WalletConnectEvents } from '@/services/pairing/connector'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import { formatPairingUri, isPairingSupported, killPairingSession } from '@/services/pairing/utils'

const connector = getPairingConnector()

/**
 * `useInitPairing` is responsible for WC session management, creating a session when:
 *
 * - no wallet is connected to onboard, deemed "intializing" pairing (disconnecting wallets via the UI)
 * - on WC 'disconnect' event (disconnecting via the app)
 */

// First session will be created by onboard's state subscription, only
// when there is no connected wallet
let hasInitialized = false

// WC has no flag to determine if a session is currently being created
let isConnecting = false

const canConnect = !connector.connected && !isConnecting

export const useInitPairing = () => {
  const onboard = useOnboard()
  const chain = useCurrentChain()

  const isSupported = isPairingSupported(chain?.disabledWallets)

  const createSession = useCallback(() => {
    if (!canConnect || !chain || !isSupported) {
      return
    }

    isConnecting = true
    connector
      .createSession({ chainId: +chain.chainId })
      .then(() => {
        isConnecting = false
      })
      .catch((e) => logError(Errors._303, (e as Error).message))
  }, [chain, isSupported])

  useEffect(() => {
    if (!onboard || !isSupported) {
      return
    }

    // Upon successful WC connection, connect it to onboard
    connector.on(WalletConnectEvents.CONNECT, () => {
      onboard
        .connectWallet({
          autoSelect: {
            label: PAIRING_MODULE_LABEL,
            disableModals: true,
          },
        })
        .catch((e) => logError(Errors._302, (e as Error).message))
    })

    connector.on(WalletConnectEvents.DISCONNECT, () => {
      createSession()
    })

    // Create new session when no wallet is connected to onboard
    const subscription = onboard.state.select('wallets').subscribe((wallets) => {
      if (!getConnectedWallet(wallets)) {
        createSession()
        hasInitialized = true
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [onboard, createSession, isSupported])

  /**
   * It's not possible to update the `chainId` of the current WC session
   * We therefore kill the current session when switching chain to trigger
   * a new `createSession` above
   */
  useEffect(() => {
    const isConnected = !!chain?.chainId && +chain.chainId === connector.chainId
    const shouldKillSession = !isSupported || (!isConnected && hasInitialized && canConnect)

    if (!shouldKillSession) {
      return
    }

    killPairingSession(connector)
  }, [chain?.chainId])
}

/**
 * `usePairingUri` is responsible for returning to pairing URI
 * @returns uri - "safe-" prefixed WC connection URI
 */
const usePairingUri = () => {
  const [uri, setUri] = useState(formatPairingUri(connector.uri))

  useEffect(() => {
    connector.on(WalletConnectEvents.DISPLAY_URI, (_, { params }) => {
      setUri(formatPairingUri(params[0]))
    })

    // Prevent the `connector` from setting state when not mounted.
    // Note: `off` clears _all_ listeners associated with that event
    return () => {
      connector.off(WalletConnectEvents.DISPLAY_URI)
    }
  }, [])

  return uri
}

export default usePairingUri
