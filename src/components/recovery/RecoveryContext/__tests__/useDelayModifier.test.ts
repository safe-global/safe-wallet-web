import { useHasFeature } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import { addressExBuilder, safeInfoBuilder } from '@/tests/builders/safe'
import { act, renderHook } from '@/tests/test-utils'
import { useDelayModifiers } from '../useDelayModifiers'

jest.mock('@/services/recovery/delay-modifier')

const mockGetDelayModifiers = getDelayModifiers as jest.MockedFunction<typeof getDelayModifiers>

jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useChains')

const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseHasFeature = useHasFeature as jest.MockedFunction<typeof useHasFeature>

describe('useDelayModifiers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not fetch if the current chain does not support Delay Modifiers', async () => {
    jest.useFakeTimers()

    mockUseHasFeature.mockReturnValue(false)
    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    const safe = safeInfoBuilder().build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)

    const { result } = renderHook(() => useDelayModifiers())

    // Give enough time for loading to occur, if it will
    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(result.current).toEqual([undefined, undefined, false])
    expect(mockGetDelayModifiers).not.toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should not fetch is there is no provider', async () => {
    jest.useFakeTimers()

    mockUseHasFeature.mockReturnValue(true)
    mockUseWeb3ReadOnly.mockReturnValue(undefined)
    const safe = safeInfoBuilder().build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)

    const { result } = renderHook(() => useDelayModifiers())

    // Give enough time for loading to occur, if it will
    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(result.current).toEqual([undefined, undefined, false])
    expect(mockGetDelayModifiers).not.toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should not fetch if there is no Safe modules enabled', async () => {
    jest.useFakeTimers()

    mockUseHasFeature.mockReturnValue(true)
    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    const safe = safeInfoBuilder().with({ modules: [] }).build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)

    const { result } = renderHook(() => useDelayModifiers())

    // Give enough time for loading to occur, if it will
    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(result.current).toEqual([undefined, undefined, false])
    expect(mockGetDelayModifiers).not.toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should not fetch if only the spending limit is enabled', async () => {
    jest.useFakeTimers()

    mockUseHasFeature.mockReturnValue(true)
    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    const chainId = '5'
    const safe = safeInfoBuilder()
      .with({ chainId, modules: [{ value: getSpendingLimitModuleAddress(chainId)! }] })
      .build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)

    const { result } = renderHook(() => useDelayModifiers())

    // Give enough time for loading to occur, if it will
    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(result.current).toEqual([undefined, undefined, false])
    expect(mockGetDelayModifiers).not.toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should otherwise fetch', async () => {
    mockUseHasFeature.mockReturnValue(true)
    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    const chainId = '5'
    const safe = safeInfoBuilder()
      .with({ chainId, modules: [addressExBuilder().build()] })
      .build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)

    renderHook(() => useDelayModifiers())

    expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)
  })
})
