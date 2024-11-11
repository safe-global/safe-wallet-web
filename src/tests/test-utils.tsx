import { render as nativeRender, renderHook } from '@testing-library/react-native'
import SafeThemeProvider from '../theme/provider'
import { Provider } from 'react-redux'
import { makeStore } from '../store'

const getProviders: () => React.FC<{ children: React.ReactElement }> = () =>
  function ProviderComponent({ children }: { children: React.ReactNode }) {
    const store = makeStore()

    return (
      <Provider store={store}>
        <SafeThemeProvider>{children}</SafeThemeProvider>
      </Provider>
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
