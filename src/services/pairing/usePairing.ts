import { useState, useEffect } from 'react'

import useChainId from '@/hooks/useChainId'
import useOnboard, { getConnectedWallet } from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'
import { getPairingConnector, WalletConnectEvents } from '@/services/pairing/connector'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'

const connector = getPairingConnector()

export const useInitPairing = () => {
  const onboard = useOnboard()
  const chainId = useChainId()

  useEffect(() => {
    if (!onboard) {
      return
    }

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

    const subscription = onboard.state.select('wallets').subscribe((wallets) => {
      const wallet = getConnectedWallet(wallets)

      if (!wallet && !connector.connected) {
        connector.createSession({ chainId: +chainId })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [onboard, chainId])

  useEffect(() => {
    // TODO: `updateSession`?
    connector.chainId = +chainId
  }, [chainId])
}

const PAIRING_MODULE_URI_PREFIX = 'safe-'

const usePairing = () => {
  const [uri, setUri] = useState(connector.uri)

  useEffect(() => {
    connector.on(WalletConnectEvents.DISPLAY_URI, (_, { params }) => {
      setUri(`${PAIRING_MODULE_URI_PREFIX}${params[0]}`)
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
