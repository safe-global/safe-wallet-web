import { faker } from '@faker-js/faker'
import { useContext } from 'react'

import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { chainBuilder } from '@/tests/builders/chains'
import { addressExBuilder, safeInfoBuilder } from '@/tests/builders/safe'
import { act, fireEvent, render, renderHook, waitFor } from '@/tests/test-utils'
import { RecoveryLoaderContext, RecoveryLoaderProvider, _useDelayModifiers, _useRecoveryState } from '.'

jest.mock('@/services/recovery/delay-modifier')
jest.mock('@/services/recovery/recovery-state')

const mockGetDelayModifiers = getDelayModifiers as jest.MockedFunction<typeof getDelayModifiers>
const mockGetRecoveryState = getRecoveryState as jest.MockedFunction<typeof getRecoveryState>

jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useChains')

const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseCurrentChain = useCurrentChain as jest.MockedFunction<typeof useCurrentChain>
const mockUseHasFeature = useHasFeature as jest.MockedFunction<typeof useHasFeature>

describe('RecoveryLoaderContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('RecoveryLoaderProvider', () => {
    it('should refetch manually calling it', async () => {
      mockUseHasFeature.mockReturnValue(true)
      const provider = {}
      mockUseWeb3ReadOnly.mockReturnValue(provider as any)
      const chainId = '5'
      const safe = safeInfoBuilder()
        .with({ chainId, modules: [addressExBuilder().build()] })
        .build()
      const safeInfo = { safe, safeAddress: safe.address.value }
      mockUseSafeInfo.mockReturnValue(safeInfo as any)
      const chain = chainBuilder().build()
      mockUseCurrentChain.mockReturnValue(chain)
      const delayModifiers = [{}]
      mockGetDelayModifiers.mockResolvedValue(delayModifiers as any)

      function Test() {
        const { refetch } = useContext(RecoveryLoaderContext)

        return <button onClick={refetch}>Refetch</button>
      }

      const { queryByText } = render(
        <RecoveryLoaderProvider>
          <Test />
        </RecoveryLoaderProvider>,
      )

      await waitFor(() => {
        expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)
        expect(mockGetRecoveryState).toHaveBeenCalledTimes(1)
      })

      act(() => {
        fireEvent.click(queryByText('Refetch')!)
      })

      await waitFor(() => {
        expect(mockGetRecoveryState).toHaveBeenCalledTimes(2)
      })

      expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)
    })

    it('should refetch when interacting with a Delay Modifier', async () => {
      mockUseHasFeature.mockReturnValue(true)
      const provider = {}
      mockUseWeb3ReadOnly.mockReturnValue(provider as any)
      const chainId = '5'
      const safe = safeInfoBuilder()
        .with({ chainId, modules: [addressExBuilder().build()] })
        .build()
      const safeInfo = { safe, safeAddress: safe.address.value }
      mockUseSafeInfo.mockReturnValue(safeInfo as any)
      const chain = chainBuilder().build()
      mockUseCurrentChain.mockReturnValue(chain)
      const delayModifierAddress = faker.finance.ethereumAddress()
      mockGetDelayModifiers.mockResolvedValue([{ address: delayModifierAddress } as any])

      render(
        <RecoveryLoaderProvider>
          <></>
        </RecoveryLoaderProvider>,
      )

      await waitFor(() => {
        expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)
        expect(mockGetRecoveryState).toHaveBeenCalledTimes(1)
      })

      act(() => {
        txDispatch(TxEvent.PROCESSED, {
          txId: faker.string.alphanumeric(),
          safeAddress: faker.finance.ethereumAddress(),
          to: delayModifierAddress,
        })
      })

      await waitFor(() => {
        expect(mockGetRecoveryState).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('useDelayModifiers', () => {
    it('should not fetch if the current chain does not support Delay Modifiers', async () => {
      jest.useFakeTimers()

      mockUseHasFeature.mockReturnValue(false)
      const provider = {}
      mockUseWeb3ReadOnly.mockReturnValue(provider as any)
      const safe = safeInfoBuilder().build()
      const safeInfo = { safe, safeAddress: safe.address.value }
      mockUseSafeInfo.mockReturnValue(safeInfo as any)

      const { result } = renderHook(() => _useDelayModifiers())

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

      const { result } = renderHook(() => _useDelayModifiers())

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

      const { result } = renderHook(() => _useDelayModifiers())

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

      const { result } = renderHook(() => _useDelayModifiers())

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

      renderHook(() => _useDelayModifiers())

      expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)
    })
  })

  describe('useRecoveryState', () => {
    it('should not fetch if there are no Delay Modifiers', async () => {
      jest.useFakeTimers()

      const provider = {}
      mockUseWeb3ReadOnly.mockReturnValue(provider as any)
      const chain = chainBuilder().build()
      mockUseCurrentChain.mockReturnValue(chain)
      const safe = safeInfoBuilder().build()
      const safeInfo = { safe, safeAddress: safe.address.value }
      mockUseSafeInfo.mockReturnValue(safeInfo as any)

      const { result } = renderHook(() => _useRecoveryState())

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

      const { result } = renderHook(() => _useRecoveryState(delayModifiers as any))

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

      const { result } = renderHook(() => _useRecoveryState([{} as any]))

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

      renderHook(() => _useRecoveryState(delayModifiers as any))

      await waitFor(() => {
        expect(mockGetRecoveryState).toHaveBeenCalledTimes(1)
      })
    })
  })
})
