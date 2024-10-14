import { ThemeProvider } from '@react-navigation/native'
import React from 'react'
import { PaperProvider } from 'react-native-paper'
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react'
import { useColorScheme } from 'react-native'
import createSafeTheme from '@/src/theme'

interface SafeThemeProviderProps {
  children: React.ReactNode
}

function SafeThemeProvider({ children }: SafeThemeProviderProps) {
  const colorScheme = useColorScheme()
  const theme = createSafeTheme(colorScheme)

  return (
    <ThemeProvider value={theme}>
      <PaperProvider theme={theme}>
        <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>
      </PaperProvider>
    </ThemeProvider>
  )
}

export default SafeThemeProvider
