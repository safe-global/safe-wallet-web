import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import { chainBuilder } from '@/tests/builders/chains'
import { safeInfoBuilder } from '@/tests/builders/safe'
import { act, renderHook, waitFor } from '@/tests/test-utils'
import { useRecoveryState } from '../useRecoveryState'

jest.mock('@/services/recovery/recovery-state')

const mockGetRecoveryState = getRecoveryState as jest.MockedFunction<typeof getRecoveryState>

jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useChains')

const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseCurrentChain = useCurrentChain as jest.MockedFunction<typeof useCurrentChain>

describe('useRecoveryState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not fetch if there are no Delay Modifiers', async () => {
    jest.useFakeTimers()

    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    const chain = chainBuilder().build()
    mockUseCurrentChain.mockReturnValue(chain)
    const safe = safeInfoBuilder().build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)

    const { result } = renderHook(() => useRecoveryState())

    // Give enough time for loading to occur, if it will
    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(result.current.data).toEqual([undefined, undefined, false])
    expect(mockGetRecoveryState).not.toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should not fetch if there is no Transaction Service', async () => {
    jest.useFakeTimers()

    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    mockUseCurrentChain.mockReturnValue(undefined)
    const safe = safeInfoBuilder().build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)
    const delayModifiers = [{}]

    const { result } = renderHook(() => useRecoveryState(delayModifiers as any))

    // Give enough time for loading to occur, if it will
    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(result.current.data).toEqual([undefined, undefined, false])
    expect(mockGetRecoveryState).not.toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should not fetch is there is no provider', async () => {
    jest.useFakeTimers()

    mockUseWeb3ReadOnly.mockReturnValue(undefined)
    const chain = chainBuilder().build()
    mockUseCurrentChain.mockReturnValue(chain)
    const safe = safeInfoBuilder().build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)

    const { result } = renderHook(() => useRecoveryState([{} as any]))

    // Give enough time for loading to occur, if it will
    await act(async () => {
      jest.advanceTimersByTime(10)
    })

    expect(result.current.data).toEqual([undefined, undefined, false])
    expect(mockGetRecoveryState).not.toHaveBeenCalledTimes(1)

    jest.useRealTimers()
  })

  it('should otherwise fetch', async () => {
    const provider = {}
    mockUseWeb3ReadOnly.mockReturnValue(provider as any)
    const chain = chainBuilder().build()
    mockUseCurrentChain.mockReturnValue(chain)
    const safe = safeInfoBuilder().build()
    const safeInfo = { safe, safeAddress: safe.address.value }
    mockUseSafeInfo.mockReturnValue(safeInfo as any)
    const delayModifiers = [{}]

    renderHook(() => useRecoveryState(delayModifiers as any))

    await waitFor(() => {
      expect(mockGetRecoveryState).toHaveBeenCalledTimes(1)
    })
  })
})
