import { getSupportedSigningMethods, shouldUseEthSignMethod } from '@/hooks/wallets/wallets'
import type { ConnectedWallet } from '@/services/onboard'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import type { EIP1193Provider } from '@web3-onboard/core'

describe('wallets', () => {
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

    it('returns false for WalletConnect', () => {
      const mockWallet: ConnectedWallet = {
        address: ZERO_ADDRESS,
        chainId: '4',
        label: 'WalletConnect',
        provider: null as unknown as EIP1193Provider,
      }

      const result = shouldUseEthSignMethod(mockWallet)

      expect(result).toBe(false)
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

  describe('getSupportedSigningMethods', () => {
    it('should return EIP-712 methods for older Safes', () => {
      const result = getSupportedSigningMethods('1.0.0', {
        label: 'Ledger', // Would use `eth_sign` on newer Safes
      } as ConnectedWallet)

      expect(result).toEqual(['eth_signTypedData_v4', 'eth_signTypedData_v3', 'eth_signTypedData'])
    })

    it('should return `eth_sign` for hardware wallets/Safe mobile', () => {
      const ledger = getSupportedSigningMethods('1.3.0', {
        label: 'Ledger',
      } as ConnectedWallet)
      expect(ledger).toEqual(['eth_sign'])

      const trezor = getSupportedSigningMethods('1.3.0', {
        label: 'Trezor',
      } as ConnectedWallet)
      expect(trezor).toEqual(['eth_sign'])
    })

    it('should return `eth_sign` for the Safe mobile app', () => {
      const result = getSupportedSigningMethods('1.3.0', {
        label: 'Safe Mobile',
      } as ConnectedWallet)

      expect(result).toEqual(['eth_sign'])
    })

    it('should generally return EIP-712 methods and `eth_sign` for newer Safes', () => {
      const result = getSupportedSigningMethods('1.3.0', {
        label: 'MetaMask', // Could be connected to a hardware wallet
      } as ConnectedWallet)

      expect(result).toEqual(['eth_signTypedData_v4', 'eth_signTypedData_v3', 'eth_signTypedData', 'eth_sign'])
    })
  })
})
