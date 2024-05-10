import { renderHook } from '@/tests/test-utils'
import useDecodeTx from '../useDecodeTx'
import { waitFor } from '@testing-library/react'
import { createMockSafeTransaction } from '@/tests/transactions'
import { faker } from '@faker-js/faker'
import * as safeGatewayTypescriptSdk from '@safe-global/safe-gateway-typescript-sdk'
import { getConfirmationView } from '@safe-global/safe-gateway-typescript-sdk'
import { getNativeTransferData } from '@/services/tx/tokenTransferParams'

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  getConfirmationView: jest.fn(),
}))

jest.mock('../useChainId', () => jest.fn().mockReturnValue('5'))
jest.mock('../useSafeAddress', () => jest.fn().mockReturnValue('0x789'))

jest.mock('@/services/tx/tokenTransferParams', () => ({
  ...jest.requireActual('@/services/tx/tokenTransferParams'),
  getNativeTransferData: jest.fn(),
}))

jest.useFakeTimers()
describe('useDecodeTx', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return undefined when tx is undefined', async () => {
    const { result } = renderHook(() => useDecodeTx())

    await waitFor(async () => {
      expect(result.current[0]).toBeUndefined()
    })
  })

  it('should return undefined if safeTX has empty data', async () => {
    const safeTx = createMockSafeTransaction({
      data: '0x',
      to: faker.finance.ethereumAddress(),
    })
    const { result } = renderHook(() => useDecodeTx(safeTx))

    await waitFor(async () => {
      expect(result.current[0]).toBeUndefined()
    })
  })

  it('should do a getConfirmationView call if safeTx has data', async () => {
    const safeTx = createMockSafeTransaction({
      data: '0x123',
      to: faker.finance.ethereumAddress(),
    })

    const mockNativeTransferData = undefined
    const { result } = renderHook(() => useDecodeTx(safeTx))

    await waitFor(async () => {
      expect(getConfirmationView).toHaveBeenCalledTimes(1)
      expect(result.current[0]).toEqual(mockNativeTransferData)
    })
  })

  it('should return native transfer data when encodedData is empty and isRejection is false', async () => {
    const safeTx = createMockSafeTransaction({
      data: '0x',
      to: faker.finance.ethereumAddress(),
      value: '1',
    })
    const nativeTransfer = {
      method: 'Native token transfer',
    }
    ;(getNativeTransferData as jest.Mock).mockReturnValue(nativeTransfer)

    const { result } = renderHook(() => useDecodeTx(safeTx))

    await waitFor(async () => {
      expect(getNativeTransferData).toHaveBeenCalled()
      expect(result.current[0]).toEqual(nativeTransfer)
    })
  })

  it('should return decoded data when encodedData is not empty', async () => {
    const safeTx = createMockSafeTransaction({
      data: '0x1234567890abcdef', // non-empty data
      to: faker.finance.ethereumAddress(),
    })

    const { result } = renderHook(() => useDecodeTx(safeTx))

    await waitFor(async () => {
      expect(getConfirmationView).toHaveBeenCalledTimes(1)
      expect(getConfirmationView).toHaveBeenCalledWith('5', '0x789', '0x1234567890abcdef', safeTx.data.to)
    })
  })

  it('should return error when getConfirmationView throws an error', async () => {
    const safeTx = createMockSafeTransaction({
      data: '0x1234567890abcdef', // non-empty data
      to: faker.finance.ethereumAddress(),
    })

    // Mock getConfirmationView to throw an error
    jest.spyOn(safeGatewayTypescriptSdk, 'getConfirmationView').mockRejectedValue('Failed to fetch')

    const { result, rerender } = renderHook(() => useDecodeTx(safeTx))

    rerender()
    await waitFor(async () => {
      expect(result.current[1] && result.current[1].message).toEqual('Failed to fetch')
    })
  })
})
