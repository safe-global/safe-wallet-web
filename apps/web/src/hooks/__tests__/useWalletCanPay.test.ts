import useWalletCanPay from '@/hooks/useWalletCanPay'
import * as walletBalance from '@/hooks/wallets/useWalletBalance'
import { renderHook } from '@/tests/test-utils'

describe('useWalletCanPay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true if gasLimit is missing', () => {
    const { result } = renderHook(() => useWalletCanPay({ maxFeePerGas: BigInt(1) }))

    expect(result.current).toEqual(true)
  })

  it('should return true if maxFeePerGas is missing', () => {
    const { result } = renderHook(() => useWalletCanPay({ gasLimit: BigInt(21000) }))

    expect(result.current).toEqual(true)
  })

  it('should return true if wallet balance is missing', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([undefined, undefined, false])

    const { result } = renderHook(() => useWalletCanPay({ gasLimit: BigInt(21000), maxFeePerGas: BigInt(1) }))

    expect(result.current).toEqual(true)
  })

  it('should return false if wallet balance is zero', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigInt(0), undefined, false])

    const { result } = renderHook(() => useWalletCanPay({ gasLimit: BigInt(21000), maxFeePerGas: BigInt(1) }))

    expect(result.current).toEqual(false)
  })

  it('should return false if wallet balance is smaller than gas costs', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigInt(20999), undefined, false])

    const { result } = renderHook(() => useWalletCanPay({ gasLimit: BigInt(21000), maxFeePerGas: BigInt(1) }))

    expect(result.current).toEqual(false)
  })

  it('should return true if wallet balance is larger or equal than gas costs', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigInt(21000), undefined, false])

    const { result } = renderHook(() => useWalletCanPay({ gasLimit: BigInt(21000), maxFeePerGas: BigInt(1) }))

    expect(result.current).toEqual(true)
  })

  it('should return true if wallet balance is larger or equal than gas costs', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigInt(21001), undefined, false])

    const { result } = renderHook(() => useWalletCanPay({ gasLimit: BigInt(21000), maxFeePerGas: BigInt(1) }))

    expect(result.current).toEqual(true)
  })

  it('should take maxPriorityFeePerGas into account', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigInt(42000), undefined, false])

    const { result } = renderHook(() =>
      useWalletCanPay({
        gasLimit: BigInt(21000),
        maxFeePerGas: BigInt(1),
      }),
    )

    expect(result.current).toEqual(true)
  })
})
