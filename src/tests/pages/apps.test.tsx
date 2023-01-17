import React from 'react'
import * as safeAppsGatewaySDK from '@safe-global/safe-gateway-typescript-sdk'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  getByRole,
  getByText,
  waitForElementToBeRemoved,
  within,
} from '../test-utils'
import AppsPage from '@/pages/apps'
import BookmarkedSafeAppsPage from '@/pages/apps/bookmarked'
import CustomSafeAppsPage from '@/pages/apps/custom'
import * as safeAppsService from '@/services/safe-apps/manifest'
import { LS_NAMESPACE } from '@/config/constants'

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  ...jest.requireActual('@safe-global/safe-gateway-typescript-sdk'),
  getSafeApps: (chainId: string) => Promise.resolve(mockedSafeApps),
}))

describe('AppsPage', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    window.localStorage.clear()
  })

  describe('Safe Apps List Page', () => {
    it('shows safe apps list section', async () => {
      render(<AppsPage />, {
        routerProps: {
          pathname: '/apps',
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => {
        expect(screen.getByText('Compound')).toBeInTheDocument()
        expect(screen.getByText('ENS App')).toBeInTheDocument()
        expect(screen.getByText('Transaction Builder')).toBeInTheDocument()
        expect(screen.getByText('Synthetix')).toBeInTheDocument()
      })
    })

    it('shows Safe app details when you click on the Safe app card', async () => {
      render(<AppsPage />, {
        routerProps: {
          pathname: '/apps',
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      // drawer is not present
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()

      // clicks on Transaction Builder Safe App
      await waitFor(() => {
        fireEvent.click(screen.getByRole('heading', { level: 5, name: 'Transaction Builder' }))
      })

      await waitFor(() => {
        const safeAppPreviewDrawer = screen.getByRole('presentation')
        expect(safeAppPreviewDrawer).toBeInTheDocument()
        // Transaction Builder Safe App title
        expect(getByRole(safeAppPreviewDrawer, 'heading', { level: 4, name: 'Transaction Builder' }))
        // open app button should be present
        expect(getByText(safeAppPreviewDrawer, 'Open App'))
      })
    })
  })

  describe('Bookmarked Safe apps Page', () => {
    it('shows Bookmarked safe apps section', async () => {
      // mock 2 Bookmarked Safe Apps
      const mockedBookmarkedSafeApps = {
        137: { pinned: [compopundSafeAppMock.id, transactionBuilderSafeAppMock.id] },
      }

      window.localStorage.setItem(`${LS_NAMESPACE}safeApps`, JSON.stringify(mockedBookmarkedSafeApps))

      render(<BookmarkedSafeAppsPage />, {
        routerProps: {
          pathname: '/apps/bookmarked',
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      // show Bookmarked Safe Apps only
      await waitFor(() => {
        expect(screen.queryByText('Compound')).toBeInTheDocument()
        expect(screen.queryByText('Transaction Builder')).toBeInTheDocument()
        expect(screen.queryByText('ENS App')).not.toBeInTheDocument()
        expect(screen.queryByText('Synthetix')).not.toBeInTheDocument()
      })
    })

    it('unpin a Safe app', async () => {
      // mock 2 Bookmarked Safe Apps
      const mockedBookmarkedSafeApps = {
        137: { pinned: [compopundSafeAppMock.id, transactionBuilderSafeAppMock.id] },
      }

      window.localStorage.setItem(`${LS_NAMESPACE}safeApps`, JSON.stringify(mockedBookmarkedSafeApps))

      render(<BookmarkedSafeAppsPage />, {
        routerProps: {
          pathname: '/apps/bookmarked',
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      // show Bookmarked Safe Apps only
      await waitFor(() => {
        expect(screen.queryByText('Compound')).toBeInTheDocument()
        expect(screen.queryByText('Transaction Builder')).toBeInTheDocument()
      })

      // unpin Transaction Builder Safe App
      fireEvent.click(screen.getByLabelText('Unpin Transaction Builder'))

      // show Bookmarked Safe Apps only
      await waitFor(() => {
        expect(screen.queryByText('Compound')).toBeInTheDocument()
        expect(screen.queryByText('Transaction Builder')).not.toBeInTheDocument()
      })
    })

    it('shows Safe app details when you click on the Safe app card', async () => {
      // mock 2 Bookmarked Safe Apps
      const mockedBookmarkedSafeApps = {
        137: { pinned: [compopundSafeAppMock.id, transactionBuilderSafeAppMock.id] },
      }

      window.localStorage.setItem(`${LS_NAMESPACE}safeApps`, JSON.stringify(mockedBookmarkedSafeApps))

      render(<BookmarkedSafeAppsPage />, {
        routerProps: {
          pathname: '/apps/bookmarked',
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      // drawer is not present
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()

      // clicks on Transaction Builder Safe App
      await waitFor(() => {
        fireEvent.click(screen.getByRole('heading', { level: 5, name: 'Transaction Builder' }))
      })

      await waitFor(() => {
        const safeAppPreviewDrawer = screen.getByRole('presentation')
        expect(safeAppPreviewDrawer).toBeInTheDocument()
        // Transaction Builder Safe App title
        expect(getByRole(safeAppPreviewDrawer, 'heading', { level: 4, name: 'Transaction Builder' }))
        // open app button should be present
        expect(getByText(safeAppPreviewDrawer, 'Open App'))
      })
    })
  })

  describe('Custom Safe apps Page', () => {
    it('shows Custom safe apps section', async () => {
      render(<CustomSafeAppsPage />, {
        routerProps: {
          pathname: '/apps/custom',
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      await waitFor(() => {
        // show add custom app card
        expect(screen.getByRole('button', { name: 'Add custom app' }))
      })

      // Add custom app modal is not present
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()

      await act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Add custom app' }))
      })

      // shows Add custom app modal
      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 2, name: 'Add custom app' })).toBeInTheDocument()

        // shows custom safe App App Url input
        const customSafeAppURLInput = screen.getByLabelText(/App URL/)
        expect(customSafeAppURLInput).toBeInTheDocument()
      })
    })

    it('adds a Custom Safe App', async () => {
      const APP_URL = 'https://apps.safe.global/test-custom-app'

      jest.spyOn(safeAppsService, 'fetchSafeAppFromManifest').mockResolvedValueOnce({
        id: 12345,
        url: APP_URL,
        name: 'Custom test Safe app',
        description: 'Custom Safe app description',
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
        chainIds: ['1', '4', '137'],
        iconUrl: '',
        safeAppsPermissions: [],
      })

      render(<CustomSafeAppsPage />, {
        routerProps: {
          pathname: '/apps/custom',
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      fireEvent.click(screen.getByRole('button', { name: 'Add custom app' }))

      await waitFor(() => expect(screen.getByLabelText(/App URL/)).toBeInTheDocument())
      const appURLInput = screen.getByLabelText(/App URL/)
      fireEvent.change(appURLInput, { target: { value: APP_URL } })
      const riskCheckbox = await screen.findByRole('checkbox')
      fireEvent.click(riskCheckbox)
      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: /Custom test Safe app/i,
          }),
        ).toBeInTheDocument(),
      )
      await act(() => {
        fireEvent.click(screen.getByText('Add'))
      })

      // modal is closed
      await waitForElementToBeRemoved(() => screen.queryByLabelText(/App URL/))

      // custom safe app is present in the list
      expect(screen.queryByText('Custom test Safe app')).toBeInTheDocument()

      // shows safe app description drawer is not present
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()

      // clicks on Custom test Safe app Safe App
      await waitFor(() => {
        fireEvent.click(screen.getByRole('heading', { level: 5, name: 'Custom test Safe app' }))
      })

      await waitFor(() => {
        const safeAppPreviewDrawer = screen.getByRole('presentation')
        expect(safeAppPreviewDrawer).toBeInTheDocument()
        // Custom test Safe app Safe App title
        expect(getByRole(safeAppPreviewDrawer, 'heading', { level: 4, name: 'Custom test Safe app' }))
        // open app button should be present
        expect(getByText(safeAppPreviewDrawer, 'Open App'))
      })
    })

    it('Shows an error label if the app doesnt support Safe App functionality', async () => {
      const APP_URL = 'https://google.com'
      render(<CustomSafeAppsPage />, {
        routerProps: {
          pathname: '/apps/custom',
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
      const APP_URL = 'https://apps.safe.global/test-custom-app'

      jest.spyOn(safeAppsService, 'fetchSafeAppFromManifest').mockResolvedValueOnce({
        id: 12345,
        url: APP_URL,
        name: 'Custom test Safe app',
        description: 'Custom Safe app description',
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
        chainIds: ['1', '4', '137'],
        iconUrl: '',
        safeAppsPermissions: [],
      })

      render(<CustomSafeAppsPage />, {
        routerProps: {
          pathname: '/apps/custom',
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
      const APP_URL = 'https://apps.safe.global/test-custom-app'

      jest.spyOn(safeAppsService, 'fetchSafeAppFromManifest').mockResolvedValueOnce({
        id: 12345,
        url: APP_URL,
        name: 'Custom test Safe app',
        description: 'Custom Safe app description',
        accessControl: {
          type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
        },
        tags: [],
        chainIds: ['1', '4', '137'],
        iconUrl: '',
        safeAppsPermissions: [],
      })

      render(<CustomSafeAppsPage />, {
        routerProps: {
          pathname: '/apps/custom',
          query: {
            safe: 'matic:0x0000000000000000000000000000000000000000',
          },
        },
      })

      fireEvent.click(screen.getByRole('button', { name: 'Add custom app' }))

      await waitFor(() => expect(screen.getByLabelText(/App URL/)).toBeInTheDocument())
      const appURLInput = screen.getByLabelText(/App URL/)
      fireEvent.change(appURLInput, { target: { value: APP_URL } })
      const riskCheckbox = await screen.findByRole('checkbox')
      fireEvent.click(riskCheckbox)
      await waitFor(() =>
        expect(
          screen.getByRole('heading', {
            name: /Custom test Safe app/i,
          }),
        ).toBeInTheDocument(),
      )
      await act(() => {
        fireEvent.click(screen.getByText('Add'))
      })

      // modal is closed
      await waitForElementToBeRemoved(() => screen.queryByLabelText(/App URL/))

      const removeCustomSafeAppButton = screen.getByLabelText('Delete Custom test Safe app')

      await act(() => {
        fireEvent.click(removeCustomSafeAppButton)
      })

      await waitFor(() => expect(screen.getByText('Confirm app removal')).toBeInTheDocument())

      const confirmRemovalButton = screen.getByRole('button', { name: 'Remove' })
      await act(() => {
        fireEvent.click(confirmRemovalButton)
      })

      await waitForElementToBeRemoved(() => screen.getByRole('button', { name: 'Remove' }))

      await waitFor(() =>
        // custom safe app is not present in the list
        expect(screen.queryByText('Custom test Safe app')).not.toBeInTheDocument(),
      )
    })
  })

  describe('Safe Apps Filters', () => {
    describe('search by Safe App name and description', () => {
      it('search by Safe App name', async () => {
        render(<AppsPage />, {
          routerProps: {
            pathname: '/apps',
            query: {
              safe: 'matic:0x0000000000000000000000000000000000000000',
            },
          },
        })

        await waitFor(() => {
          expect(screen.getByText('Compound')).toBeInTheDocument()
          expect(screen.getByText('ENS App')).toBeInTheDocument()
          expect(screen.getByText('Transaction Builder')).toBeInTheDocument()
          expect(screen.getByText('Synthetix')).toBeInTheDocument()
        })

        const query = 'Transaction'

        const searchInput = screen.getByPlaceholderText('Search by name or category')
        fireEvent.change(searchInput, { target: { value: query } })

        await waitFor(() => {
          expect(screen.queryByText('Compound')).not.toBeInTheDocument()
          expect(screen.queryByText('ENS App')).not.toBeInTheDocument()
          expect(screen.queryByText('Transaction Builder')).toBeInTheDocument()
          expect(screen.queryByText('Synthetix')).not.toBeInTheDocument()
        })
      })

      it('search by Safe App description', async () => {
        render(<AppsPage />, {
          routerProps: {
            pathname: '/apps',
            query: {
              safe: 'matic:0x0000000000000000000000000000000000000000',
            },
          },
        })

        await waitFor(() => {
          expect(screen.getByText('Compound')).toBeInTheDocument()
          expect(screen.getByText('ENS App')).toBeInTheDocument()
          expect(screen.getByText('Transaction Builder')).toBeInTheDocument()
          expect(screen.getByText('Synthetix')).toBeInTheDocument()
        })

        const query = transactionBuilderSafeAppMock.description

        const searchInput = screen.getByPlaceholderText('Search by name or category')
        fireEvent.change(searchInput, { target: { value: query } })

        await waitFor(() => {
          expect(screen.queryByText('Compound')).not.toBeInTheDocument()
          expect(screen.queryByText('ENS App')).not.toBeInTheDocument()
          expect(screen.queryByText('Transaction Builder')).toBeInTheDocument()
          expect(screen.queryByText('Synthetix')).not.toBeInTheDocument()
        })
      })

      it('show zero results component', async () => {
        render(<AppsPage />, {
          routerProps: {
            pathname: '/apps',
            query: {
              safe: 'matic:0x0000000000000000000000000000000000000000',
            },
          },
        })

        await waitFor(() => {
          expect(screen.getByText('Compound')).toBeInTheDocument()
          expect(screen.getByText('ENS App')).toBeInTheDocument()
          expect(screen.getByText('Transaction Builder')).toBeInTheDocument()
          expect(screen.getByText('Synthetix')).toBeInTheDocument()
        })

        const query = 'zero results'

        const searchInput = screen.getByPlaceholderText('Search by name or category')

        await act(() => fireEvent.change(searchInput, { target: { value: query } }))

        await waitFor(() => {
          expect(screen.queryByText('Compound')).not.toBeInTheDocument()
          expect(screen.queryByText('ENS App')).not.toBeInTheDocument()
          expect(screen.queryByText('Transaction Builder')).not.toBeInTheDocument()
          expect(screen.queryByText('Synthetix')).not.toBeInTheDocument()

          // zero results component
          expect(screen.getByText('No apps found', { exact: false })).toBeInTheDocument()
          expect(screen.queryByText('Use WalletConnect')).toBeInTheDocument()
        })
      })

      describe('filter by category', () => {
        it('filters by Safe App category', async () => {
          render(<AppsPage />, {
            routerProps: {
              pathname: '/apps',
              query: {
                safe: 'matic:0x0000000000000000000000000000000000000000',
              },
            },
          })

          await waitFor(() => {
            expect(screen.getByText('Compound')).toBeInTheDocument()
            expect(screen.getByText('ENS App')).toBeInTheDocument()
            expect(screen.getByText('Transaction Builder')).toBeInTheDocument()
            expect(screen.getByText('Synthetix')).toBeInTheDocument()
          })

          const categorySelector = screen.getByRole('button', { name: 'Category Select category' })

          await act(() => fireEvent.mouseDown(categorySelector))

          const categoriesDropdown = within(screen.getByRole('listbox'))

          // show some options in the categories dropdown
          await waitFor(() => expect(categoriesDropdown.getByText('NFT')).toBeInTheDocument())
          await waitFor(() => expect(categoriesDropdown.getByText('Transaction Builder')).toBeInTheDocument())
          await waitFor(() => expect(categoriesDropdown.getByText('Dashboard')).toBeInTheDocument())

          // filter by category
          await act(() => fireEvent.click(categoriesDropdown.getByText('Transaction Builder')))

          await waitFor(() => {
            expect(screen.queryByText('Compound')).not.toBeInTheDocument()
            expect(screen.queryByText('ENS App')).not.toBeInTheDocument()
            expect(screen.queryByText('Transaction Builder')).toBeInTheDocument()
            expect(screen.queryByText('Synthetix')).not.toBeInTheDocument()
          })
        })
      })
    })
  })
})

const transactionBuilderSafeAppMock = {
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
}

const compopundSafeAppMock = {
  id: 13,
  url: 'https://cloudflare-ipfs.com/ipfs/QmX31xCdhFDmJzoVG33Y6kJtJ5Ujw8r5EJJBrsp8Fbjm7k',
  name: 'Compound',
  iconUrl: 'https://cloudflare-ipfs.com/ipfs/QmX31xCdhFDmJzoVG33Y6kJtJ5Ujw8r5EJJBrsp8Fbjm7k/Compound.png',
  description: 'Money markets on the Ethereum blockchain',
  chainIds: ['1', '4', '137'],
  provider: undefined,
  accessControl: {
    type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
  },
  tags: [],
}

const ensSafeAppMock = {
  id: 3,
  url: 'https://app.ens.domains',
  name: 'ENS App',
  iconUrl: 'https://app.ens.domains/android-chrome-144x144.png',
  description: 'Decentralised naming for wallets, websites, & more.',
  chainIds: ['1', '4', '137'],
  provider: undefined,
  accessControl: {
    type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.DomainAllowlist,
    value: ['https://gnosis-safe.io'],
  },
  tags: [],
}

const synthetixSafeAppMock = {
  id: 14,
  url: 'https://cloudflare-ipfs.com/ipfs/QmXLxxczMH4MBEYDeeN9zoiHDzVkeBmB5rBjA3UniPEFcA',
  name: 'Synthetix',
  iconUrl: 'https://cloudflare-ipfs.com/ipfs/QmXLxxczMH4MBEYDeeN9zoiHDzVkeBmB5rBjA3UniPEFcA/Synthetix.png',
  description: 'Trade synthetic assets on Ethereum',
  chainIds: ['1', '4', '137'],
  provider: undefined,
  accessControl: {
    type: safeAppsGatewaySDK.SafeAppAccessPolicyTypes.NoRestrictions,
  },
  tags: [],
}

const mockedSafeApps = [compopundSafeAppMock, ensSafeAppMock, synthetixSafeAppMock, transactionBuilderSafeAppMock]
