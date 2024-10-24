import Constants from 'expo-constants'
import { Platform } from 'react-native'

export const isProduction = process.env.NODE_ENV !== 'production'
export const isAndroid = Platform.OS === 'android'
export const isTestingEnv = process.env.NODE_ENV === 'test' || process.env.VITEST
export const isStorybookEnv = Constants?.expoConfig?.extra?.storybookEnabled === 'true'
