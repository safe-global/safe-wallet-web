import type { RenderHookOptions } from '@testing-library/react'
import { render, renderHook } from '@testing-library/react'
import type { NextRouter } from 'next/router'
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime'
import type { Theme } from '@mui/material/styles'
import { ThemeProvider } from '@mui/material/styles'
import SafeThemeProvider from '@/components/theme/SafeThemeProvider'
import type { RootState } from '@/store'
import * as web3 from '@/hooks/wallets/web3'
import { defaultAbiCoder } from 'ethers/lib/utils'
import { ethers } from 'ethers'
import type { Web3Provider } from '@ethersproject/providers'

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
  forward: () => void 0,
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

type MockCallImplementation = {
  signature: string
  returnType: string
  returnValue: unknown
}

/**
 * Creates a getWeb3 spy which returns a Web3Provider with a mocked `call` and `resolveName` function.
 *
 * @param callImplementations list of supported function calls and the mocked return value. i.e.
 * ```
 * [{
 *   signature: "balanceOf(address)",
 *   returnType: "uint256",
 *   returnValue: "200"
 * }]
 * ```
 * @param resolveName mock ens resolveName implementation
 * @returns web3provider jest spy
 */
const mockWeb3Provider = (
  callImplementations: MockCallImplementation[],
  resolveName?: (name: string) => string,
): jest.SpyInstance<any, unknown[]> => {
  return jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(
    () =>
      ({
        call: (tx: { data: string; to: string }) => {
          {
            const matchedImplementation = callImplementations.find((implementation) => {
              return tx.data.startsWith(ethers.utils.id(implementation.signature).slice(0, 10))
            })

            if (!matchedImplementation) {
              throw new Error(`No matcher for call data: ${tx.data}`)
            }

            return defaultAbiCoder.encode([matchedImplementation.returnType], [matchedImplementation.returnValue])
          }
        },
        _isProvider: true,
        resolveName: resolveName,
      } as unknown as Web3Provider),
  )
}

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
export { customRenderHook as renderHook }
export { mockWeb3Provider }
