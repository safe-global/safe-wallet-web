import type { EIP1193Provider, WalletState } from '@web3-onboard/core'
import { getConnectedWallet } from './useOnboard'

// mock wallets
jest.mock('@/hooks/wallets/wallets', () => ({
  getDefaultWallets: jest.fn(() => []),
  getRecommendedInjectedWallets: jest.fn(() => []),
}))

describe('getConnectedWallet', () => {
  it('returns the connected wallet', () => {
    const wallets = [
      {
        label: 'Wallet 1',
        icon: 'wallet1.svg',
        provider: null as unknown as EIP1193Provider,
        chains: [{ id: '0x4' }],
        accounts: [
          {
            address: '0x1234567890123456789012345678901234567890',
            ens: null,
            balance: null,
          },
        ],
      },
      {
        label: 'Wallet 2',
        icon: 'wallet2.svg',
        provider: null as unknown as EIP1193Provider,
        chains: [{ id: '0x100' }],
        accounts: [
          {
            address: '0x2',
            ens: null,
            balance: null,
          },
        ],
      },
    ] as WalletState[]

    expect(getConnectedWallet(wallets)).toEqual({
      label: 'Wallet 1',
      icon: 'wallet1.svg',
      address: '0x1234567890123456789012345678901234567890',
      provider: wallets[0].provider,
      chainId: '4',
    })
  })

  it('should return null if the address is invalid', () => {
    const wallets = [
      {
        label: 'Wallet 1',
        icon: 'wallet1.svg',
        provider: null as unknown as EIP1193Provider,
        chains: [{ id: '0x4' }],
        accounts: [
          {
            address: '0xinvalid',
            ens: null,
            balance: null,
          },
        ],
      },
    ] as WalletState[]

    expect(getConnectedWallet(wallets)).toBeNull()
  })
})
