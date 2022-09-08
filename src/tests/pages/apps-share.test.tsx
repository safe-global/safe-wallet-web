import React from 'react'
import { render, screen, waitFor } from '../test-utils'
import ShareSafeApp from '@/pages/share/safe-app'
import { CONFIG_SERVICE_CHAINS } from '@/tests/mocks'

describe('Share Safe App Page', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    window.localStorage.clear()
  })

  it('Should show the app name, description and URL', async () => {
    render(<ShareSafeApp />, {
      routerProps: {
        query: {
          appUrl: 'https://apps.gnosis-safe.io/tx-builder/',
          chainId: '1',
        },
      },
      initialReduxState: {
        chains: {
          data: CONFIG_SERVICE_CHAINS,
          error: undefined,
          loading: false,
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Transaction Builder')).toBeInTheDocument()
      expect(
        screen.getByText('Compose custom contract interactions and batch them into a single transaction'),
      ).toBeInTheDocument()
      expect(screen.getByText('https://apps.gnosis-safe.io/tx-builder')).toBeInTheDocument()
    })
  })

  it("Should suggest to connect a wallet when user hasn't connected one", async () => {
    render(<ShareSafeApp />, {
      routerProps: {
        query: {
          appUrl: 'https://apps.gnosis-safe.io/tx-builder/',
          chainId: '1',
        },
      },
      initialReduxState: {
        chains: {
          data: CONFIG_SERVICE_CHAINS,
          error: undefined,
          loading: false,
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Connect wallet')).toBeInTheDocument()
    })
  })

  it('Should show a link to the demo on mainnet', async () => {
    render(<ShareSafeApp />, {
      routerProps: {
        query: {
          appUrl: 'https://apps.gnosis-safe.io/tx-builder/',
          chainId: '1',
        },
      },
      initialReduxState: {
        chains: {
          data: CONFIG_SERVICE_CHAINS,
          error: undefined,
          loading: false,
        },
      },
    })

    await waitFor(() => {
      expect(screen.getByText('Try demo')).toBeInTheDocument()
    })
  })
})
