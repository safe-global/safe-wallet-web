import type { RenderHookOptions } from '@testing-library/react'
import { render, renderHook } from '@testing-library/react'
import type { NextRouter } from 'next/router'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import type { Theme } from '@mui/material/styles'
import { ThemeProvider } from '@mui/material/styles'
import { SafeThemeProvider } from '@safe-global/safe-react-components'
import type { RootState } from '@/store'

const mockRouter = (props: Partial<NextRouter> = {}): NextRouter => ({
  asPath: '/',
  basePath: '/',
  back: jest.fn(() => Promise.resolve(true)),
  beforePopState: jest.fn(() => Promise.resolve(true)),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: true,
  isPreview: true,
  isReady: true,
  pathname: '/',
  push: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  reload: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  route: '/',
  query: {},
  ...props,
})

// Add in any providers here if necessary:
// (ReduxProvider, ThemeProvider, etc)
const getProviders: (options: {
  routerProps?: Partial<NextRouter>
  initialReduxState?: Partial<RootState>
}) => React.FC<{ children: React.ReactElement }> = ({ routerProps, initialReduxState }) =>
  function ProviderComponent({ children }) {
    const { StoreHydrator } = require('@/store') // require dynamically to reset the store

    return (
      <StoreHydrator initialState={initialReduxState}>
        <RouterContext.Provider value={mockRouter(routerProps)}>
          <SafeThemeProvider mode="light">
            {(safeTheme: Theme) => <ThemeProvider theme={safeTheme}>{children}</ThemeProvider>}
          </SafeThemeProvider>
        </RouterContext.Provider>
      </StoreHydrator>
    )
  }

const customRender = (
  ui: React.ReactElement,
  options?: { routerProps?: Partial<NextRouter>; initialReduxState?: Partial<RootState> },
) => {
  const wrapper = getProviders({
    routerProps: options?.routerProps || {},
    initialReduxState: options?.initialReduxState,
  })

  return render(ui, { wrapper, ...options })
}

function customRenderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props> & { routerProps?: Partial<NextRouter>; initialReduxState?: Partial<RootState> },
) {
  const wrapper = getProviders({
    routerProps: options?.routerProps || {},
    initialReduxState: options?.initialReduxState,
  })

  return renderHook(render, { wrapper, ...options })
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
export { customRenderHook as renderHook }
