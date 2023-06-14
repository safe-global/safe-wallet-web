import { getSupportedSigningMethods } from '@/services/tx/tx-sender/sdk'

describe('getSupportedSigningMethods', () => {
  it('should return `eth_signTypedData` for older Safes', () => {
    const result = getSupportedSigningMethods('1.0.0')

    expect(result).toEqual(['eth_signTypedData'])
  })

  it("should return `eth_signTypedData` for unsupported contracts (backend returns `SafeInfo['version']` as `null`)", () => {
    const result = getSupportedSigningMethods(null)

    expect(result).toEqual(['eth_signTypedData'])
  })

  it('should generally return `eth_signTypedData` and `eth_sign` for newer Safes', () => {
    const result = getSupportedSigningMethods('1.3.0')

    expect(result).toEqual(['eth_signTypedData', 'eth_sign'])
  })
})
