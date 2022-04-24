import type { EIP1193Provider, WalletState } from '@web3-onboard/core'
import { getConnectedWallet, getConnectedWalletAddress } from '../wallets/useOnboard'

describe('getConnectedWallet', () => {
  it('returns the first wallet', () => {
    const wallets: WalletState[] = [
      {
        label: 'Wallet 1',
        icon: '',
        provider: null as unknown as EIP1193Provider,
        chains: [],
        accounts: [
          {
            address: '0x1',
            ens: null,
            balance: null,
          },
        ],
      },
      {
        label: 'Wallet 2',
        icon: '',
        provider: null as unknown as EIP1193Provider,
        chains: [],
        accounts: [
          {
            address: '0x2',
            ens: null,
            balance: null,
          },
        ],
      },
    ]
    expect(getConnectedWallet(wallets)).toEqual(wallets[0])
  })
})

describe('getConnectedWalletAddress', () => {
  it('returns an empty string if wallets is undefined', () => {
    expect(getConnectedWalletAddress(undefined)).toEqual('')
  })

  it('returns an empty string if wallets is empty', () => {
    expect(getConnectedWalletAddress([])).toEqual('')
  })

  it('returns the first wallet address', () => {
    const wallets: WalletState[] = [
      {
        label: 'Wallet 1',
        icon: '',
        provider: null as unknown as EIP1193Provider,
        chains: [],
        accounts: [
          {
            address: '0x1',
            ens: null,
            balance: null,
          },
        ],
      },
      {
        label: 'Wallet 2',
        icon: '',
        provider: null as unknown as EIP1193Provider,
        chains: [],
        accounts: [
          {
            address: '0x2',
            ens: null,
            balance: null,
          },
        ],
      },
    ]
    expect(getConnectedWalletAddress(wallets)).toEqual(wallets[0].accounts[0].address)
  })
})
