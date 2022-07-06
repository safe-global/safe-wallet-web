export const IS_PRODUCTION = process.env.NEXT_PUBLIC_IS_PRODUCTION
export const PROD_GATEWAY_URL = 'https://safe-client.gnosis.io'
export const STAGING_GATEWAY_URL = 'https://safe-client.staging.gnosisdev.com'
export const GATEWAY_URL = IS_PRODUCTION ? PROD_GATEWAY_URL : STAGING_GATEWAY_URL
export const POLLING_INTERVAL = 15_000
export const LS_NAMESPACE = 'SAFE_v2__'
export const INFURA_TOKEN = process.env.NEXT_PUBLIC_INFURA_TOKEN || '0ebf4dd05d6740f482938b8a80860d13'
export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || ''
export const WC_BRIDGE = process.env.NEXT_PUBLIC_WC_BRIDGE || 'https://safe-walletconnect.gnosis.io/'
export const FORTMATIC_KEY = process.env.NEXT_PUBLIC_FORTMATIC_KEY || 'pk_test_CAD437AA29BE0A40'
export const PORTIS_KEY = process.env.NEXT_PUBLIC_PORTIS_KEY || '852b763d-f28b-4463-80cb-846d7ec5806b'
export const TREZOR_APP_URL = 'gnosis-safe.io'
export const TREZOR_EMAIL = 'safe@gnosis.io'
export const LATEST_SAFE_VERSION = process.env.NEXT_PUBLIC_SAFE_VERSION || '1.3.0'
export const BEAMER_ID = process.env.NEXT_PUBLIC_BEAMER_ID
