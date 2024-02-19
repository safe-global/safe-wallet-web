import { IS_PRODUCTION } from '@/config/constants'

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

  const requiredKeys = Object.values(SocialWalletOptionsKeys)
  const hasRequiredKeys = requiredKeys.every((key) => key in options)
  const hasValues = Object.values(options).every(Boolean)

  return hasRequiredKeys && hasValues
}

/** env variables */
export const SOCIAL_WALLET_OPTIONS: any = (() => {
  const SOCIAL_WALLET_OPTIONS_PRODUCTION = process.env.NEXT_PUBLIC_SOCIAL_WALLET_OPTIONS_PRODUCTION || '{}'
  const SOCIAL_WALLET_OPTIONS_STAGING = process.env.NEXT_PUBLIC_SOCIAL_WALLET_OPTIONS_STAGING || '{}'

  try {
    return JSON.parse(IS_PRODUCTION ? SOCIAL_WALLET_OPTIONS_PRODUCTION : SOCIAL_WALLET_OPTIONS_STAGING)
  } catch (error) {
    console.error('Error parsing SOCIAL_WALLET_OPTIONS', error)
    return {}
  }
})()
