import { Stack } from 'expo-router'
import 'react-native-reanimated'
import SafeThemeProvider from '@/src/providers/SafeThemeProvider'
import { Provider } from 'react-redux'
import { persistor, store } from '@/src/store'
import { PersistGate } from 'redux-persist/integration/react'
import { isStorybookEnv } from '@/src/config/constants'
import { apiSliceWithChainsConfig } from '@/src/store/gateway/chains'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

function RootLayout() {
  store.dispatch(apiSliceWithChainsConfig.endpoints.getChainsConfig.initiate({}))

  return (
    <GestureHandlerRootView>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeThemeProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="pending-transactions" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </SafeThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  )
}

let AppEntryPoint = RootLayout

if (isStorybookEnv) {
  AppEntryPoint = require('../.storybook').default
}

export default AppEntryPoint
