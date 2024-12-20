import { render as nativeRender, renderHook } from '@testing-library/react-native'
import { SafeThemeProvider } from '@/src/theme/provider/safeTheme'
import { Provider } from 'react-redux'
import { makeStore } from '../store'
import { PortalProvider } from 'tamagui'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

const getProviders: () => React.FC<{ children: React.ReactElement }> = () =>
  function ProviderComponent({ children }: { children: React.ReactNode }) {
    const store = makeStore()

    return (
      <BottomSheetModalProvider>
        <PortalProvider shouldAddRootHost>
          <Provider store={store}>
            <SafeThemeProvider>{children}</SafeThemeProvider>
          </Provider>
        </PortalProvider>
      </BottomSheetModalProvider>
    )
  }

const customRender = (ui: React.ReactElement) => {
  const wrapper = getProviders()

  return nativeRender(ui, { wrapper })
}

function customRenderHook<Result, Props>(render: (initialProps: Props) => Result) {
  const wrapper = getProviders()

  return renderHook(render, { wrapper })
}

// re-export everything
export * from '@testing-library/react-native'

// override render method
export { customRender as render }
export { customRenderHook as renderHook }
