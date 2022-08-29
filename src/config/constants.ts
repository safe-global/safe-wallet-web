export const IS_PRODUCTION = process.env.NEXT_PUBLIC_IS_PRODUCTION

export const GATEWAY_URL = IS_PRODUCTION ? 'https://safe-client.gnosis.io' : 'https://safe-client.staging.gnosisdev.com'
export const SAFE_REACT_URL = IS_PRODUCTION ? 'https://gnosis-safe.io/app' : 'https://safe-team.dev.gnosisdev.com/app'

// Magic numbers
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

// Safe Token
export const SAFE_TOKEN_ADDRESSES: { [chainId: string]: string } = {
  '1': '0x5aFE3855358E112B5647B952709E6165e1c1eEEe',
  '4': '0xCFf1b0FdE85C102552D1D96084AF148f478F964A',
}

// Safe Apps
export const SAFE_APPS_POLLING_INTERVAL = process.env.NODE_ENV === 'test' ? 4500 : 15000
export const SAFE_APPS_THIRD_PARTY_COOKIES_CHECK_URL = 'https://third-party-cookies-check.gnosis-safe.com'
export const SAFE_APPS_SUPPORT_CHAT_URL = 'https://chat.gnosis-safe.io'
export const SAFE_APPS_INFURA_TOKEN = process.env.NEXT_PUBLIC_SAFE_APPS_INFURA_TOKEN || ''

// Google Tag Manager
export const GOOGLE_TAG_MANAGER_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID || ''
export const GOOGLE_TAG_MANAGER_AUTH_LIVE = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_LIVE_AUTH || ''
export const GOOGLE_TAG_MANAGER_AUTH_LATEST = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_LATEST_AUTH || ''
export const GOOGLE_TAG_MANAGER_DEVELOPMENT_AUTH = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_DEVELOPMENT_AUTH || ''

// Tenderly - API docs: https://www.notion.so/Simulate-API-Documentation-6f7009fe6d1a48c999ffeb7941efc104
export const TENDERLY_SIMULATE_ENDPOINT_URL = process.env.NEXT_PUBLIC_TENDERLY_SIMULATE_ENDPOINT_URL || ''
export const TENDERLY_PROJECT_NAME = process.env.NEXT_PUBLIC_TENDERLY_PROJECT_NAME || ''
export const TENDERLY_ORG_NAME = process.env.NEXT_PUBLIC_TENDERLY_ORG_NAME || ''
