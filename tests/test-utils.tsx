import { render, renderHook, RenderHookOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { NextRouter } from 'next/router'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import { ThemeProvider } from '@mui/material'
import initTheme from '@/styles/theme'

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
const getProviders: (routerProps: Partial<NextRouter>) => React.FC<{ children: React.ReactElement }> = (routerProps) =>
  function ProviderComponent({ children }) {
    const { store } = require('@/store') // require dynamically to reset the store

    return (
      <RouterContext.Provider value={mockRouter(routerProps)}>
        <ThemeProvider theme={initTheme(false)}>
          <Provider store={store}>{children}</Provider>
        </ThemeProvider>
      </RouterContext.Provider>
    )
  }

const customRender = (ui: React.ReactElement, options?: { routerProps: Partial<NextRouter> }) => {
  const wrapper = getProviders(options?.routerProps || {})

  return render(ui, { wrapper, ...options })
}

function customRenderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options?: RenderHookOptions<Props> & { routerProps: Partial<NextRouter> },
) {
  const wrapper = getProviders(options?.routerProps || {})

  return renderHook(render, { wrapper, ...options })
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
export { customRenderHook as renderHook }
