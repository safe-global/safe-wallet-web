import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import 'react-native-reanimated'
import SafeThemeProvider from '@/src/providers/SafeThemeProvider'
import SpaceMono from '../assets/fonts/SpaceMono-Regular.ttf'
import { Provider } from 'react-redux'
import { persistor, store } from '@/src/store'
import { PersistGate } from 'redux-persist/integration/react'
import { isStorybookEnv } from '@/src/config/constants'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono,
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeThemeProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </SafeThemeProvider>
      </PersistGate>
    </Provider>
  )
}

let AppEntryPoint = RootLayout

if (isStorybookEnv) {
  AppEntryPoint = require('../.storybook').default
}

export default AppEntryPoint
