import React, { useEffect } from 'react'
import { useFonts } from 'expo-font'
import DmSansSemiBold from '@tamagui/font-dm-sans/fonts/static/DMSans-SemiBold.ttf'
import DmSansRegular from '@tamagui/font-dm-sans/fonts/static/DMSans-Regular.ttf'
import DmSansMedium from '@tamagui/font-dm-sans/fonts/static/DMSans-Medium.ttf'
import { SplashScreen } from 'expo-router'

interface SafeThemeProviderProps {
  children: React.ReactNode
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export const FontProvider = ({ children }: SafeThemeProviderProps) => {
  const [loaded] = useFonts({
    'DmSans-SemiBold': DmSansSemiBold,
    'DmSans-Regular': DmSansRegular,
    'DmSans-Medium': DmSansMedium,
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return children
}
