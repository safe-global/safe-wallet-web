import { shouldUseEthSignMethod } from '@/hooks/wallets/wallets'
import type { ConnectedWallet } from '@/services/onboard'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import type { EIP1193Provider } from '@web3-onboard/core'

describe('shouldUseEthSignMethod', () => {
  it('returns true for Ledger wallets', () => {
    const mockWallet: ConnectedWallet = {
      address: ZERO_ADDRESS,
      chainId: '4',
      label: 'Ledger',
      provider: null as unknown as EIP1193Provider,
    }

    const result = shouldUseEthSignMethod(mockWallet)

    expect(result).toBe(true)
  })

  it('returns true for Trezor wallets', () => {
    const mockWallet: ConnectedWallet = {
      address: ZERO_ADDRESS,
      chainId: '4',
      label: 'Trezor',
      provider: null as unknown as EIP1193Provider,
    }

    const result = shouldUseEthSignMethod(mockWallet)

    expect(result).toBe(true)
  })

  it('returns true for Safe mobile pairing', () => {
    const mockWallet: ConnectedWallet = {
      address: ZERO_ADDRESS,
      chainId: '4',
      label: 'Safe Mobile',
      provider: null as unknown as EIP1193Provider,
    }

    const result = shouldUseEthSignMethod(mockWallet)

    expect(result).toBe(true)
  })

  it('returns true for WalletConnect', () => {
    const mockWallet: ConnectedWallet = {
      address: ZERO_ADDRESS,
      chainId: '4',
      label: 'WalletConnect',
      provider: null as unknown as EIP1193Provider,
    }

    const result = shouldUseEthSignMethod(mockWallet)

    expect(result).toBe(true)
  })

  it('returns false for MetaMask', () => {
    const mockWallet: ConnectedWallet = {
      address: ZERO_ADDRESS,
      chainId: '4',
      label: 'MetaMask',
      provider: null as unknown as EIP1193Provider,
    }

    const result = shouldUseEthSignMethod(mockWallet)

    expect(result).toBe(false)
  })
})
