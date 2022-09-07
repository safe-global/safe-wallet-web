export const formatPairingUri = (wcUri?: string) => {
  const PAIRING_MODULE_URI_PREFIX = 'safe-'

  // A disconnected session returns URI with an empty `key`
  if (!wcUri || !/key=.+/.test(wcUri)) {
    return
  }

  return `${PAIRING_MODULE_URI_PREFIX}${wcUri}`
}
