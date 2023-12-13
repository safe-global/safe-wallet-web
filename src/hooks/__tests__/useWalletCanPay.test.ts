import useWalletCanPay from '@/hooks/useWalletCanPay'
import * as walletBalance from '@/hooks/wallets/useWalletBalance'
import { renderHook } from '@/tests/test-utils'
import { BigNumber } from 'ethers'

describe('useWalletCanPay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true if gasLimit is missing', () => {
    const { result } = renderHook(() =>
      useWalletCanPay({ maxFeePerGas: BigNumber.from(1), maxPriorityFeePerGas: BigNumber.from(1) }),
    )

    expect(result.current).toEqual(true)
  })

  it('should return true if maxFeePerGas is missing', () => {
    const { result } = renderHook(() =>
      useWalletCanPay({ gasLimit: BigNumber.from(21000), maxPriorityFeePerGas: BigNumber.from(1) }),
    )

    expect(result.current).toEqual(true)
  })

  it('should return true if wallet balance is missing', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([undefined, undefined, false])

    const { result } = renderHook(() =>
      useWalletCanPay({ gasLimit: BigNumber.from(21000), maxFeePerGas: BigNumber.from(1) }),
    )

    expect(result.current).toEqual(true)
  })

  it('should return false if wallet balance is smaller than gas costs', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigNumber.from(20999), undefined, false])

    const { result } = renderHook(() =>
      useWalletCanPay({ gasLimit: BigNumber.from(21000), maxFeePerGas: BigNumber.from(1) }),
    )

    expect(result.current).toEqual(false)
  })

  it('should return true if wallet balance is larger or equal than gas costs', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigNumber.from(21000), undefined, false])

    const { result } = renderHook(() =>
      useWalletCanPay({ gasLimit: BigNumber.from(21000), maxFeePerGas: BigNumber.from(1) }),
    )

    expect(result.current).toEqual(true)
  })

  it('should return true if wallet balance is larger or equal than gas costs', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigNumber.from(21001), undefined, false])

    const { result } = renderHook(() =>
      useWalletCanPay({ gasLimit: BigNumber.from(21000), maxFeePerGas: BigNumber.from(1) }),
    )

    expect(result.current).toEqual(true)
  })

  it('should take maxPriorityFeePerGas into account', () => {
    jest.spyOn(walletBalance, 'default').mockReturnValue([BigNumber.from(42000), undefined, false])

    const { result } = renderHook(() =>
      useWalletCanPay({
        gasLimit: BigNumber.from(21000),
        maxFeePerGas: BigNumber.from(1),
        maxPriorityFeePerGas: BigNumber.from(1),
      }),
    )

    expect(result.current).toEqual(true)
  })
})
