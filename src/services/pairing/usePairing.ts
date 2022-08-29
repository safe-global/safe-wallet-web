import { useState, useEffect, useCallback } from 'react'

import useChainId from '@/hooks/useChainId'
import useOnboard, { getConnectedWallet } from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'
import { getPairingConnector, WalletConnectEvents } from '@/services/pairing/connector'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import { formatPairingUri, killPairingSession } from '@/services/pairing/utils'

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

export const useInitPairing = () => {
  const onboard = useOnboard()
  const chainId = useChainId()

  const canConnect = !connector.connected && !isConnecting

  const createSession = useCallback(() => {
    if (!canConnect) {
      return
    }

    isConnecting = true
    connector.createSession({ chainId: +chainId }).then(() => {
      isConnecting = false
    })
  }, [canConnect, chainId])

  useEffect(() => {
    if (!onboard) {
      return
    }

    // Upon successfuly WC connection, connect it to onboard
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

    // Create new session when app disconnects
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
  }, [onboard, chainId, createSession])

  // It's not possible to update the `chainId` of the current WC session
  // We therefore kill the current session when switching chain to triggerer
  // a new `createSession` above
  useEffect(() => {
    if (+chainId === connector.chainId || !hasInitialized || !canConnect) {
      return
    }

    killPairingSession(connector)
  }, [chainId, canConnect])
}

/**
 * `usePairing` is responsible for returning to pairing URI
 * @returns uri - "safe-" prefixed WC connection URI
 */
const usePairing = () => {
  const [uri, setUri] = useState(formatPairingUri(connector.uri))

  useEffect(() => {
    connector.on(WalletConnectEvents.DISPLAY_URI, (_, { params }) => {
      setUri(formatPairingUri(params[0]))
    })

    return () => {
      connector.off(WalletConnectEvents.DISPLAY_URI)
    }
  }, [])

  return {
    uri,
  }
}

export default usePairing
