import { useState, useEffect, useCallback } from 'react'

import { useCurrentChain } from '@/hooks/useChains'
import useOnboard, { getConnectedWallet } from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'
import { initializeNewPairingConnector, usePairingConnector, WalletConnectEvents } from '@/services/pairing/connector'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import { formatPairingUri } from '@/services/pairing/utils'
import { getSupportedWallets, isPairingSupported } from '@/hooks/wallets/wallets'

/**
 * `useInitPairing` is responsible for WC session management, creating a session when
 * - no wallet is connected to onboard, deemed "intializing" pairing (disconnecting wallets via the UI)
 * - on WC 'disconnect' event (rejecting the QR code via the app)
 */

let isConnecting = false

export const useInitPairing = () => {
  const onboard = useOnboard()
  const chain = useCurrentChain()
  const connector = usePairingConnector()

  const isSupported = isPairingSupported(chain?.disabledWallets)

  const createSession = useCallback(() => {
    if (!isConnecting && !connector?.connected && chain?.chainId) {
      isConnecting = true

      connector
        ?.createSession({ chainId: +chain?.chainId })
        .then(() => {
          isConnecting = false
        })
        .catch((e) => logError(Errors._303, (e as Error).message))
    }
  }, [connector, chain?.chainId])

  // Create a session on mount
  useEffect(() => {
    if (connector) {
      return
    }

    initializeNewPairingConnector()
  }, [connector])

  // Load pairing module with new connector
  useEffect(() => {
    if (onboard && isSupported && chain?.disabledWallets) {
      onboard.state.actions.setWalletModules(getSupportedWallets(chain.disabledWallets))
    }
  }, [
    onboard,
    isSupported,
    chain?.disabledWallets,
    // Wallet modules depend on connector intialization
    connector,
  ])

  // Manage sesssions
  useEffect(() => {
    if (!connector || !onboard || !isSupported) {
      return
    }

    // Link onboard to connector on successful WC connection
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

    // Create session when mobile rejects QR code
    connector.on(WalletConnectEvents.DISCONNECT, () => {
      createSession()
    })

    // Create session when no wallet is connected to onboard
    const subscription = onboard.state.select('wallets').subscribe((wallets) => {
      if (!getConnectedWallet(wallets)) {
        createSession()
      }
    })

    // Note: if the subscription above doesn't work, creating a session directly does

    return () => {
      subscription.unsubscribe()
    }
  }, [connector, onboard, isSupported, createSession])

  // TODO:
  // // Kill session when changing chain in order to create a new one on new chain
  // useEffect(() => {
  //   if (!chain?.chainId || !connector) {
  //     return
  //   }

  //   const shouldKillSession =
  //     !isSupported || (!isOnboardPaired && +chain.chainId !== connector.chainId && !connector.connected)

  //   if (shouldKillSession) {
  //     console.log('kill session')
  //     // killPairingSession(connector)
  //   }
  // }, [chain, connector, isSupported])
}

/**
 * `usePairingUri` is responsible for returning to pairing URI
 * @returns uri - "safe-" prefixed WC connection URI
 */
const usePairingUri = () => {
  const connector = usePairingConnector()
  const [uri, setUri] = useState(formatPairingUri(connector?.uri))

  useEffect(() => {
    connector?.on(WalletConnectEvents.DISPLAY_URI, (_, { params }) => {
      setUri(formatPairingUri(params[0]))
    })

    // Prevent the `connector` from setting state when not mounted.
    // Note: `off` clears _all_ listeners associated with that event
    return () => {
      connector?.off(WalletConnectEvents.DISPLAY_URI)
    }
  }, [connector])

  return uri
}

export default usePairingUri
