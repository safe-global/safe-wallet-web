import type WalletConnect from '@walletconnect/client'

import { CGW_NAMES, WALLET_KEYS } from '@/hooks/wallets/wallets'

export const formatPairingUri = (wcUri: string) => {
  const PAIRING_MODULE_URI_PREFIX = 'safe-'

  // A disconnected session returns URI with an empty `key`
  if (!wcUri || !/key=.+/.test(wcUri)) {
    return
  }

  return `${PAIRING_MODULE_URI_PREFIX}${wcUri}`
}

export const killPairingSession = (connector: InstanceType<typeof WalletConnect>) => {
  const TEMP_PEER_ID = '_tempPeerId'

  // WalletConnect throws if no `peerId` is set when attempting to `killSession`
  // We therefore manually set it in order to `killSession` without throwing
  if (!connector.peerId) {
    connector.peerId = TEMP_PEER_ID
  }

  return connector.killSession()
}

export const isPairingSupported = (disabledWallets?: string[]) => {
  return !!disabledWallets?.length && !disabledWallets.includes(CGW_NAMES[WALLET_KEYS.PAIRING] as string)
}
