export const IS_PRODUCTION = process.env.NEXT_PUBLIC_IS_PRODUCTION

export const STAGING_GATEWAY_URL = 'https://safe-client.staging.gnosisdev.com'
export const SAFE_REACT_URL = IS_PRODUCTION ? 'https://gnosis-safe.io/app' : 'https://safe-team.dev.gnosisdev.com/app'

// Magin numbers
export const POLLING_INTERVAL = 15_000
export const BASE_TX_GAS = 21_000
export const LS_NAMESPACE = 'SAFE_v2__'
export const LATEST_SAFE_VERSION = process.env.NEXT_PUBLIC_SAFE_VERSION || '1.3.0'

// Access keys
export const INFURA_TOKEN = process.env.NEXT_PUBLIC_INFURA_TOKEN || ''
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || ''
export const BEAMER_ID = process.env.NEXT_PUBLIC_BEAMER_ID || ''

// Wallets
export const WC_BRIDGE = process.env.NEXT_PUBLIC_WC_BRIDGE || 'https://safe-walletconnect.gnosis.io/'
export const FORTMATIC_KEY = process.env.NEXT_PUBLIC_FORTMATIC_KEY || ''
export const PORTIS_KEY = process.env.NEXT_PUBLIC_PORTIS_KEY || ''
export const TREZOR_APP_URL = 'gnosis-safe.io'
export const TREZOR_EMAIL = 'safe@gnosis.io'
