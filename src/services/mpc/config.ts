enum SocialWalletOptionsKeys {
  web3AuthClientId = 'web3AuthClientId',
  web3AuthAggregateVerifierId = 'web3AuthAggregateVerifierId',
  web3AuthSubverifierId = 'web3AuthSubverifierId',
  googleClientId = 'googleClientId',
}

export type SocialWalletOptions = {
  [SocialWalletOptionsKeys.web3AuthClientId]: string
  [SocialWalletOptionsKeys.web3AuthAggregateVerifierId]: string
  [SocialWalletOptionsKeys.web3AuthSubverifierId]: string
  [SocialWalletOptionsKeys.googleClientId]: string
}

export const isSocialWalletOptions = (options: unknown): options is SocialWalletOptions => {
  if (typeof options !== 'object' || options === null) {
    return false
  }
  const keys = Object.keys(options)

  const hasRequiredKeys =
    keys.length === 4 &&
    keys.includes(SocialWalletOptionsKeys.web3AuthClientId) &&
    keys.includes(SocialWalletOptionsKeys.web3AuthAggregateVerifierId) &&
    keys.includes(SocialWalletOptionsKeys.web3AuthSubverifierId) &&
    keys.includes(SocialWalletOptionsKeys.googleClientId)

  const hasValues = Object.values(options).every(Boolean)
  return hasRequiredKeys && hasValues
}

/** env variables */
const SOCIAL_WALLET_IS_PRODUCTION = process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true'

export const SOCIAL_WALLET_OPTIONS: any = (() => {
  const SOCIAL_WALLET_OPTIONS_PRODUCTION = process.env.NEXT_PUBLIC_SOCIAL_WALLET_OPTIONS_PRODUCTION || ''
  const SOCIAL_WALLET_OPTIONS_STAGING = process.env.NEXT_PUBLIC_SOCIAL_WALLET_OPTIONS_STAGING || ''

  try {
    return JSON.parse(SOCIAL_WALLET_IS_PRODUCTION ? SOCIAL_WALLET_OPTIONS_PRODUCTION : SOCIAL_WALLET_OPTIONS_STAGING)
  } catch (error) {
    console.error(error)
    return {}
  }
})()
