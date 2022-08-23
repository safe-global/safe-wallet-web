import React from 'react'
import * as safeAppsGatewaySDK from '@gnosis.pm/safe-react-gateway-sdk'
import { render, screen, waitFor, fireEvent, act } from '../test-utils'
import AppsPage from '@/pages/safe/apps'
import * as safeAppsService from '@/services/safe-apps/manifest'

jest.mock('@gnosis.pm/safe-react-gateway-sdk', () => ({
  ...jest.requireActual('@gnosis.pm/safe-react-gateway-sdk'),
  getSafeApps: (chainId: string) =>
    Promise.resolve([
      {
        id: 13,
        url: 'https://cloudflare-ipfs.com/ipfs/QmX31xCdhFDmJzoVG33Y6kJtJ5Ujw8r5EJJBrsp8Fbjm7k',
        name: 'Compound',
        iconUrl: 'https://cloudflare-ipfs.com/ipfs/QmX31xCdhFDmJzoVG33Y6kJtJ5Ujw8r5EJJBrsp8Fbjm7k/Compound.png',
        description: 'Money markets on the Ethereum blockchain',
        chainIds: ['1', '4'],
        provider: undefined,
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
      },
      {
        id: 3,
        url: 'https://app.ens.domains',
        name: 'ENS App',
        iconUrl: 'https://app.ens.domains/android-chrome-144x144.png',

        description: 'Decentralised naming for wallets, websites, & more.',
        chainIds: ['1', '4'],
        provider: undefined,
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.DomainAllowlist,
          value: ['https://gnosis-safe.io'],
        },
        tags: [],
      },
      {
        id: 14,
        url: 'https://cloudflare-ipfs.com/ipfs/QmXLxxczMH4MBEYDeeN9zoiHDzVkeBmB5rBjA3UniPEFcA',
        name: 'Synthetix',
        iconUrl: 'https://cloudflare-ipfs.com/ipfs/QmXLxxczMH4MBEYDeeN9zoiHDzVkeBmB5rBjA3UniPEFcA/Synthetix.png',
        description: 'Trade synthetic assets on Ethereum',
        chainIds: ['1', '4'],
        provider: undefined,
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
      },
      {
        id: 24,
        url: 'https://cloudflare-ipfs.com/ipfs/QmdVaZxDov4bVARScTLErQSRQoxgqtBad8anWuw3YPQHCs',
        name: 'Transaction Builder',
        iconUrl: 'https://cloudflare-ipfs.com/ipfs/QmdVaZxDov4bVARScTLErQSRQoxgqtBad8anWuw3YPQHCs/tx-builder.png',
        description: 'A Safe app to compose custom transactions',
        chainIds: ['1', '4', '56', '100', '137', '246', '73799'],
        provider: undefined,
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.DomainAllowlist,
          value: ['https://gnosis-safe.io'],
        },
        tags: [],
      },
    ]),
}))

describe('AppsPage', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  describe('Remote Safe Apps', () => {
    it('shows apps from remote app list', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Compound')).toBeInTheDocument()
        expect(screen.getByText('ENS App')).toBeInTheDocument()
      })
    })
  })

  describe('Custom Safe apps', () => {
    it('shows apps add custom app card', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Add custom app')).toBeInTheDocument()
      })
    })

    it('allows adding custom apps', async () => {
      const APP_URL = 'https://apps.gnosis-safe.io/compound'
      jest.spyOn(safeAppsService, 'fetchSafeAppFromManifest').mockResolvedValueOnce({
        id: Math.random(),
        url: APP_URL,
        name: 'Compound',
        description: 'Money markets on the Ethereum blockchain',
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
        chainIds: ['1', '4'],
        iconUrl: '',
      })

      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('Add custom app')).toBeInTheDocument())

      const addCustomAppButton = screen.getByText('Add custom app')
      await act(() => {
        fireEvent.click(addCustomAppButton)
      })

      await waitFor(() => expect(screen.getByLabelText(/App URL/)).toBeInTheDocument(), { timeout: 3000 })

      const appURLInput = screen.getByLabelText(/App URL/)
      const riskCheckbox = screen.getByLabelText(
        /This app is not a Gnosis product and I agree to use this app at my own risk./,
      )

      act(() => {
        fireEvent.change(appURLInput, { target: { value: APP_URL } })
        fireEvent.click(riskCheckbox)
      })
      expect(screen.getByText('Compound')).toBeInTheDocument()

      await act(() => {
        fireEvent.click(screen.getByText('Save'))
      })
      expect(screen.getByText('Money markets on the Ethereum blockchain')).toBeInTheDocument()
    })

    it('Shows an error message if the App doesnt support Safe App functionality', async () => {
      const APP_URL = 'https://google.com'

      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('Add custom app')).toBeInTheDocument())

      const addCustomAppButton = screen.getByText('Add custom app')
      await act(() => {
        fireEvent.click(addCustomAppButton)
      })

      await waitFor(() => expect(screen.getByLabelText(/App URL/)).toBeInTheDocument(), { timeout: 3000 })

      const appURLInput = screen.getByLabelText(/App URL/)
      const riskCheckbox = screen.getByLabelText(
        /This app is not a Gnosis product and I agree to use this app at my own risk./,
      )

      act(() => {
        fireEvent.change(appURLInput, { target: { value: APP_URL } })
        fireEvent.click(riskCheckbox)
      })

      await waitFor(
        () => expect(screen.getByText("The App doesn't support Safe App functionality")).toBeInTheDocument(),
        { timeout: 7000 },
      )
    })

    it('Requires risk acknowledgment checkbox to add the app', async () => {
      const APP_URL = 'https://apps.gnosis-safe.io/compound'
      jest.spyOn(safeAppsService, 'fetchSafeAppFromManifest').mockResolvedValueOnce({
        id: Math.random(),
        url: APP_URL,
        name: 'Compound',
        description: 'Money markets on the Ethereum blockchain',
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
        chainIds: ['1', '4'],
        iconUrl: '',
      })

      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('Add custom app')).toBeInTheDocument())

      const addCustomAppButton = screen.getByText('Add custom app')
      await act(() => {
        fireEvent.click(addCustomAppButton)
      })

      await waitFor(() => expect(screen.getByLabelText(/App URL/)).toBeInTheDocument(), { timeout: 3000 })

      const appURLInput = screen.getByLabelText(/App URL/)
      await act(() => {
        fireEvent.change(appURLInput, { target: { value: APP_URL } })
        fireEvent.click(screen.getByText('Save'))
      })

      await waitFor(() => expect(screen.getByText('Required')).toBeInTheDocument())
    })
  })

  describe('Search', () => {
    it('shows no results found text, when no results are found', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('Add custom app')).toBeInTheDocument())
    })

    it('shows apps matching the query', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('Add custom app')).toBeInTheDocument())
    })
  })

  describe('Pinning', () => {
    it('shows pinned apps', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('Add custom app')).toBeInTheDocument())
    })

    it('allows pinning apps', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('Add custom app')).toBeInTheDocument())
    })

    it('allows unpinning apps', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('Add custom app')).toBeInTheDocument())
    })
  })
})
