export const formatPairingUri = (wcUri: string) => {
  const PAIRING_MODULE_URI_PREFIX = 'safe-'

  if (!wcUri || !/key=.+/.test(wcUri)) {
    return
  }

  return `${PAIRING_MODULE_URI_PREFIX}${wcUri}`
}
