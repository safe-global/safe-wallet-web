import { faker } from '@faker-js/faker'
import type { Delay } from '@gnosis.pm/zodiac'

import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getRecoveryState } from '@/services/recovery/recovery-state'
import { chainBuilder } from '@/tests/builders/chains'
import { safeInfoBuilder } from '@/tests/builders/safe'
import { act, renderHook, waitFor } from '@/tests/test-utils'
import { useRecoveryState, _shouldFetchRecoveryState } from '../useRecoveryState'
import useTxHistory from '@/hooks/useTxHistory'

jest.mock('@/services/recovery/recovery-state')

const mockGetRecoveryState = getRecoveryState as jest.MockedFunction<typeof getRecoveryState>

jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useChains')
jest.mock('@/hooks/useTxHistory')

const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseCurrentChain = useCurrentChain as jest.MockedFunction<typeof useCurrentChain>
const mockUseTxHistory = useTxHistory as jest.MockedFunction<typeof useTxHistory>

describe('useRecoveryState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('shouldFetchRecoveryState', () => {
    it('should not fetch if there are no Delay Modifiers', () => {
      const shouldFetch = _shouldFetchRecoveryState()
      expect(shouldFetch).toBe(false)
    })

    it('should fetch if there is no transaction history', () => {
      const shouldFetch = _shouldFetchRecoveryState([{ address: faker.finance.ethereumAddress() } as Delay])
      expect(shouldFetch).toBe(true)
    })

    it('should not fetch if there is no latest transaction', () => {
      const shouldFetch = _shouldFetchRecoveryState([{ address: faker.finance.ethereumAddress() } as Delay], [])
      expect(shouldFetch).toBe(false)
    })

    it('should fetch if the latest transaction is of a Delay Modififer', () => {
      const delayModifierAddress = faker.finance.ethereumAddress()
      const shouldFetch = _shouldFetchRecoveryState([{ address: delayModifierAddress } as Delay], [
        { type: 'DATE_LABEL' },
        {
          type: 'TRANSACTION',
          transaction: {
            txInfo: {
              type: 'Custom',
              to: {
                value: delayModifierAddress,
              },
            },
          },
        },
      ] as any)
      expect(shouldFetch).toBe(true)
    })

    it('should fetch if the latest transaction is of a MultiSend', () => {
      const shouldFetch = _shouldFetchRecoveryState([{ address: faker.finance.ethereumAddress() } as Delay], [
        { type: 'DATE_LABEL' },
        {
          type: 'TRANSACTION',
          transaction: {
            txInfo: {
              type: 'Custom',
              methodName: 'multiSend',
              actionCount: 420,
              to: {
                value: faker.finance.ethereumAddress(),
              },
            },
          },
        },
      ] as any)
      expect(shouldFetch).toBe(true)
    })
  })

  describe('hook', () => {
    it('should not fetch if there is no Transaction Service', async () => {
      jest.useFakeTimers()

      const provider = {}
      mockUseWeb3ReadOnly.mockReturnValue(provider as any)
      mockUseCurrentChain.mockReturnValue(undefined)
      const safe = safeInfoBuilder().build()
      const safeInfo = { safe, safeAddress: safe.address.value }
      mockUseSafeInfo.mockReturnValue(safeInfo as any)
      const delayModifierAddress = faker.finance.ethereumAddress()
      const delayModifiers = [{ address: delayModifierAddress }]
      const mockTxHistory = {
        page: {
          results: [
            { type: 'DATE_LABEL' },
            {
              type: 'TRANSACTION',
              transaction: {
                txInfo: {
                  type: 'Custom',
                  to: {
                    value: delayModifierAddress,
                  },
                },
              },
            },
          ],
        },
      }
      mockUseTxHistory.mockReturnValue(mockTxHistory as any)

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
      const delayModifierAddress = faker.finance.ethereumAddress()
      const delayModifiers = [{ address: delayModifierAddress }]
      const mockTxHistory = {
        page: {
          results: [
            { type: 'DATE_LABEL' },
            {
              type: 'TRANSACTION',
              transaction: {
                txInfo: {
                  type: 'Custom',
                  to: {
                    value: delayModifierAddress,
                  },
                },
              },
            },
          ],
        },
      }
      mockUseTxHistory.mockReturnValue(mockTxHistory as any)

      const { result } = renderHook(() => useRecoveryState(delayModifiers as any))

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
      const delayModifierAddress = faker.finance.ethereumAddress()
      const delayModifiers = [{ address: delayModifierAddress }]
      const mockTxHistory = {
        page: {
          results: [
            { type: 'DATE_LABEL' },
            {
              type: 'TRANSACTION',
              transaction: {
                txInfo: {
                  type: 'Custom',
                  to: {
                    value: delayModifierAddress,
                  },
                },
              },
            },
          ],
        },
      }
      mockUseTxHistory.mockReturnValue(mockTxHistory as any)

      renderHook(() => useRecoveryState(delayModifiers as any))

      await waitFor(() => {
        expect(mockGetRecoveryState).toHaveBeenCalledTimes(1)
      })
    })
  })
})
