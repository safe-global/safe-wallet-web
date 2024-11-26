import { Stack } from 'expo-router'
import 'react-native-reanimated'
import { SafeThemeProvider } from '@/src/theme/provider/safeTheme'
import { Provider } from 'react-redux'
import { persistor, store } from '@/src/store'
import { PersistGate } from 'redux-persist/integration/react'
import { isStorybookEnv } from '@/src/config/constants'
import { apiSliceWithChainsConfig } from '@/src/store/gateway/chains/index'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { PortalProvider } from 'tamagui'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

function RootLayout() {
  store.dispatch(apiSliceWithChainsConfig.endpoints.getChainsConfig.initiate())

  return (
    <PortalProvider shouldAddRootHost>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <SafeThemeProvider>
                <Stack
                  screenOptions={{
                    headerBackButtonDisplayMode: 'minimal',
                    headerShadowVisible: false,
                  }}
                >
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="pending-transactions" options={{ headerShown: true, title: '' }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </SafeThemeProvider>
            </PersistGate>
          </Provider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </PortalProvider>
  )
}

let AppEntryPoint = RootLayout

if (isStorybookEnv) {
  AppEntryPoint = require('../.storybook').default
}

export default AppEntryPoint
