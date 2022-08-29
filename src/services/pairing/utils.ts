import WalletConnect from '@walletconnect/client'

export const formatPairingUri = (wcUri: string) => {
  const PAIRING_MODULE_URI_PREFIX = 'safe-'

  // A disconnected session returns URI with an empty `key`
  if (!wcUri || !/key=.+/.test(wcUri)) {
    return
  }

  return `${PAIRING_MODULE_URI_PREFIX}${wcUri}`
}

export const killPairingSession = (connector: InstanceType<typeof WalletConnect>) => {
  // WalletConnect throws if no `peerId` is sett when attempting to `killSession`
  // We therefore manually set it in order to `killSession` without throwing
  if (!connector.peerId) {
    connector.peerId = '_willKill'
  }

  return connector.killSession()
}
