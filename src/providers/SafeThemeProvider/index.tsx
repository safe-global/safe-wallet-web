import React from 'react'
import { useColorScheme } from 'react-native'
import { ThemeProvider } from '@react-navigation/native'
import { TamaguiProvider } from '@tamagui/core'

import { config } from '@/src/theme/tamagui.config'
import { NavDarkTheme, NavLightTheme } from '@/src/theme/navigation'
import { FontProvider } from '@/src/theme/provider/font'
import { isStorybookEnv } from '@/src/config/constants'
import { View } from 'tamagui'

interface SafeThemeProviderProps {
  children: React.ReactNode
}

function SafeThemeProvider({ children }: SafeThemeProviderProps) {
  const colorScheme = useColorScheme()

  const themeProvider = isStorybookEnv ? (
    <View
      backgroundColor={colorScheme === 'dark' ? NavDarkTheme.colors.background : NavLightTheme.colors.background}
      style={{ flex: 1 }}
    >
      {children}
    </View>
  ) : (
    <ThemeProvider value={colorScheme === 'dark' ? NavDarkTheme : NavLightTheme}>{children}</ThemeProvider>
  )

  return (
    <FontProvider>
      <TamaguiProvider config={config} defaultTheme={colorScheme ? colorScheme : 'dark'}>
        {themeProvider}
      </TamaguiProvider>
    </FontProvider>
  )
}

export default SafeThemeProvider
