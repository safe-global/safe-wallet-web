import Constants from 'expo-constants'
import { Platform } from 'react-native'

export const isProduction = process.env.NODE_ENV !== 'production'
export const isAndroid = Platform.OS === 'android'
export const isTestingEnv = process.env.NODE_ENV === 'test'
export const isStorybookEnv = Constants?.expoConfig?.extra?.storybookEnabled === 'true'

export const GATEWAY_URL_PRODUCTION =
  process.env.NEXT_PUBLIC_GATEWAY_URL_PRODUCTION || 'https://safe-client.safe.global'
export const GATEWAY_URL_STAGING = process.env.NEXT_PUBLIC_GATEWAY_URL_STAGING || 'https://safe-client.staging.5afe.dev'
export const GATEWAY_URL = process.env.NODE_ENV !== 'production' ? GATEWAY_URL_STAGING : GATEWAY_URL_PRODUCTION
