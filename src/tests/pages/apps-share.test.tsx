import React from 'react'
import { render, screen, waitFor } from '../test-utils'
import ShareSafeApp from '@/pages/share/safe-app'
import { CONFIG_SERVICE_CHAINS } from '@/tests/mocks/chains'
import * as useWalletHook from '@/hooks/wallets/useWallet'
import * as useOwnedSafesHook from '@/hooks/useOwnedSafes'
import crypto from 'crypto'
import type { EIP1193Provider } from '@web3-onboard/core'

const FETCH_TIMEOUT = 5000

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
          chain: 'eth',
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

    await waitFor(
      () => {
        expect(screen.getByText('Transaction Builder')).toBeInTheDocument()
        expect(
          screen.getByText('Compose custom contract interactions and batch them into a single transaction'),
        ).toBeInTheDocument()
        expect(screen.getByText('https://apps.gnosis-safe.io/tx-builder')).toBeInTheDocument()
      },
      { timeout: FETCH_TIMEOUT },
    )
  })

  it("Should suggest to connect a wallet when user hasn't connected one", async () => {
    render(<ShareSafeApp />, {
      routerProps: {
        query: {
          appUrl: 'https://apps.gnosis-safe.io/tx-builder/',
          chain: 'eth',
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

    await waitFor(
      () => {
        expect(screen.getByText('Connect wallet')).toBeInTheDocument()
      },
      { timeout: FETCH_TIMEOUT },
    )
  })

  it('Should show a link to the demo on mainnet', async () => {
    render(<ShareSafeApp />, {
      routerProps: {
        query: {
          appUrl: 'https://apps.gnosis-safe.io/tx-builder/',
          chain: 'eth',
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

    await waitFor(
      () => {
        expect(screen.getByText('Try demo')).toBeInTheDocument()
      },
      { timeout: FETCH_TIMEOUT },
    )
  })

  it('Should link to Safe Creation flow when the connected wallet has no owned Safes', async () => {
    const address = `0x${crypto.randomBytes(20).toString('hex')}`
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({
      ens: 'craicis90.eth',
      address,
      provider: jest.fn() as unknown as EIP1193Provider,
      label: 'Metamask',
      chainId: '4',
    }))

    render(<ShareSafeApp />, {
      routerProps: {
        query: {
          appUrl: 'https://apps.gnosis-safe.io/tx-builder/',
          chain: 'rin',
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

    await waitFor(
      () => {
        expect(screen.getByText('Create new Safe')).toBeInTheDocument()
      },
      { timeout: FETCH_TIMEOUT },
    )
  })

  it('Should show a select input with owned safes when the connected wallet owns Safes', async () => {
    const address = `0x${crypto.randomBytes(20).toString('hex')}`
    const safeAddress = `0x${crypto.randomBytes(20).toString('hex')}`
    jest.spyOn(useWalletHook, 'default').mockImplementation(() => ({
      ens: 'craicis90.eth',
      address,
      provider: jest.fn() as unknown as EIP1193Provider,
      label: 'Metamask',
      chainId: '1',
    }))
    jest.spyOn(useOwnedSafesHook, 'default').mockImplementation(() => ({
      '1': [safeAddress],
    }))

    render(<ShareSafeApp />, {
      routerProps: {
        query: {
          appUrl: 'https://apps.gnosis-safe.io/tx-builder/',
          chain: 'eth',
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

    await waitFor(
      () => {
        expect(screen.getByLabelText('Select a Safe')).toBeInTheDocument()
      },
      { timeout: FETCH_TIMEOUT },
    )
  })
})
