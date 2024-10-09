import { Stack } from 'expo-router'
import 'react-native-reanimated'
import SafeThemeProvider from '@/src/providers/SafeThemeProvider'
import { Provider } from 'react-redux'
import { persistor, store } from '@/src/store'
import { PersistGate } from 'redux-persist/integration/react'
import { isStorybookEnv } from '@/src/config/constants'

function RootLayout() {
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
