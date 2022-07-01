import React from 'react'
import * as safeAppsGatewaySDK from '@gnosis.pm/safe-react-gateway-sdk'
import { render, screen, waitFor } from '../test-utils'
import AppsPage from '@/pages/safe/apps'

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
