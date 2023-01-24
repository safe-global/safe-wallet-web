import { _getSupportedSigningMethods } from '@/services/tx/tx-sender/sdk'
import type { ConnectedWallet } from '@/services/onboard'

describe('getSupportedSigningMethods', () => {
  it('should return `eth_signTypedData_v4` for older Safes', () => {
    const result = _getSupportedSigningMethods('1.0.0', {
      label: 'Ledger', // Would use `eth_sign` on newer Safes
    } as ConnectedWallet)

    expect(result).toEqual(['eth_signTypedData_v4'])
  })

  it('should return `eth_sign` for hardware wallets/Safe mobile', () => {
    const ledger = _getSupportedSigningMethods('1.3.0', {
      label: 'Ledger',
    } as ConnectedWallet)
    expect(ledger).toEqual(['eth_sign'])

    const trezor = _getSupportedSigningMethods('1.3.0', {
      label: 'Trezor',
    } as ConnectedWallet)
    expect(trezor).toEqual(['eth_sign'])
  })

  it('should return `eth_sign` for the Safe mobile app', () => {
    const result = _getSupportedSigningMethods('1.3.0', {
      label: 'Safe Mobile',
    } as ConnectedWallet)

    expect(result).toEqual(['eth_sign'])
  })

  it('should generally return `eth_signTypedData_v4` and `eth_sign` for newer Safes', () => {
    const result = _getSupportedSigningMethods('1.3.0', {
      label: 'MetaMask', // Could be connected to a hardware wallet
    } as ConnectedWallet)

    expect(result).toEqual(['eth_signTypedData_v4', 'eth_sign'])
  })
})
