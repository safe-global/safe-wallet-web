import React from 'react'
import * as safeAppsGatewaySDK from '@safe-global/safe-gateway-typescript-sdk'
import { render, screen, waitFor, fireEvent, act } from '../test-utils'
import AppsPage from '@/pages/apps'
import * as safeAppsService from '@/services/safe-apps/manifest'

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  ...jest.requireActual('@safe-global/safe-gateway-typescript-sdk'),
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
    window.localStorage.clear()
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
        name: 'Custom Compound',
        description: 'Custom markets on the Ethereum blockchain',
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
        chainIds: ['1', '4'],
        iconUrl: '',
        safeAppsPermissions: [],
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

      await waitFor(() => expect(screen.getByLabelText(/App URL/)).toBeInTheDocument())

      const appURLInput = screen.getByLabelText(/App URL/)

      fireEvent.change(appURLInput, { target: { value: APP_URL } })

      const riskCheckbox = await screen.findByRole('checkbox')

      fireEvent.click(riskCheckbox)

      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: /custom compound/i,
          }),
        ).toBeInTheDocument(),
      )

      await act(() => {
        fireEvent.click(screen.getByText('Add'))
      })

      await waitFor(() => expect(screen.getAllByText(/Custom markets on the Ethereum blockchain/).length).toBe(2))
    })

    it('Shows an error message if the app doesnt support Safe App functionality', async () => {
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

      fireEvent.change(appURLInput, { target: { value: APP_URL } })

      await screen.findByText(/the app doesn't support safe app functionality/i)
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
        safeAppsPermissions: [],
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

      fireEvent.change(appURLInput, { target: { value: APP_URL } })

      const riskCheckbox = await screen.findByText(
        /This app is not part of Safe and I agree to use it at my own risk\./,
      )
      await act(() => {
        fireEvent.click(riskCheckbox)
      })
      await act(() => {
        fireEvent.click(riskCheckbox)
      })
      fireEvent.click(screen.getByText('Add'))

      await waitFor(() => expect(screen.getByText('Accepting the disclaimer is mandatory')).toBeInTheDocument())
    })

    it('allows removing custom apps', async () => {
      const APP_URL = 'https://apps.gnosis-safe.io/compound'
      jest.spyOn(safeAppsService, 'fetchSafeAppFromManifest').mockResolvedValueOnce({
        id: Math.random(),
        url: APP_URL,
        name: 'Custom Compound',
        description: 'Custom markets on the Ethereum blockchain',
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
        chainIds: ['1', '4'],
        iconUrl: '',
        safeAppsPermissions: [],
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

      fireEvent.change(appURLInput, { target: { value: APP_URL } })

      const riskCheckbox = await screen.findByText(/This app is not part of Safe and I agree to use it at my own risk./)

      fireEvent.click(riskCheckbox)

      await waitFor(() => expect(screen.getByRole('heading', { name: 'Custom Compound' })).toBeInTheDocument())

      await act(() => {
        fireEvent.click(screen.getByText('Add'))
      })
      await waitFor(() => expect(screen.getAllByText(/Custom markets on the Ethereum blockchain/).length).toBe(2))

      const removeButton = screen.getByLabelText('Delete Custom Compound')
      await act(() => {
        fireEvent.click(removeButton)
      })
      await waitFor(() => expect(screen.getByText('Remove')).toBeInTheDocument())
      const confirmRemovalButton = screen.getByText('Remove')
      fireEvent.click(confirmRemovalButton)

      await waitFor(() =>
        expect(screen.queryByText('Custom markets on the Ethereum blockchain')).not.toBeInTheDocument(),
      )
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

      await waitFor(() => expect(screen.getByPlaceholderText('Search')).toBeInTheDocument())

      const input = screen.getByPlaceholderText('Search')
      act(() => {
        fireEvent.change(input, { target: { value: 'gibberish gibberish' } })
      })

      await waitFor(() => expect(screen.getByText('No apps found', { exact: false })).toBeInTheDocument())
    })

    it('shows apps matching the query', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByPlaceholderText('Search')).toBeInTheDocument())

      const input = screen.getByPlaceholderText('Search')
      act(() => {
        fireEvent.change(input, { target: { value: 'Compound' } })
      })

      await waitFor(() => expect(screen.getByText('Compound')).toBeInTheDocument())
      await waitFor(() => expect(screen.queryByText('ENS App')).toBeNull())
    })
  })

  describe('Pinning', () => {
    it('allows pinning and unpinning apps', async () => {
      render(<AppsPage />, {
        routerProps: {
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => expect(screen.getByText('ENS App')).toBeInTheDocument())

      const button = screen.getByTitle('Pin ENS App')
      await act(() => {
        fireEvent.click(button)
      })

      await waitFor(() => expect(screen.getAllByTitle(/ENS App logo/i).length).toBe(2))

      await act(() => {
        fireEvent.click(button)
      })
      await waitFor(() => expect(screen.getAllByTitle(/ENS App logo/i).length).toBe(1))
    })
  })
})
