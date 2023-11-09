import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import { faker } from '@faker-js/faker'
import { BigNumber } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import type { Delay, TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'

import useLoadRecovery, {
  _getQueuedTransactionsAdded,
  _getRecoveryQueueItem,
  _getRecoveryState,
} from '../loadables/useLoadRecovery'
import { useHasFeature } from '../useChains'
import useIntervalCounter from '../useIntervalCounter'
import useSafeInfo from '../useSafeInfo'
import { useWeb3ReadOnly } from '../wallets/web3'
import { renderHook, waitFor } from '@testing-library/react'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'

describe('getQueuedTransactionsAdded', () => {
  it('should filter queued transactions with queueNonce >= current txNonce', () => {
    const transactionsAdded = [
      {
        args: {
          queueNonce: BigNumber.from(1),
        },
      } as unknown,
      {
        args: {
          queueNonce: BigNumber.from(2),
        },
      } as unknown,
      {
        args: {
          queueNonce: BigNumber.from(3),
        },
      } as unknown,
    ] as Array<TransactionAddedEvent>

    const txNonce = BigNumber.from(2)

    expect(_getQueuedTransactionsAdded(transactionsAdded, txNonce)).toStrictEqual([
      {
        args: {
          queueNonce: BigNumber.from(2),
        },
      } as unknown,
      {
        args: {
          queueNonce: BigNumber.from(3),
        },
      },
    ])
  })
})

describe('getRecoveryQueueItem', () => {
  it('should return a recovery queue item', async () => {
    const transactionAdded = {
      getBlock: () => Promise.resolve({ timestamp: 1 }),
    } as TransactionAddedEvent
    const txCooldown = BigNumber.from(1)
    const txExpiration = BigNumber.from(2)

    const item = await _getRecoveryQueueItem(transactionAdded, txCooldown, txExpiration)

    expect(item).toStrictEqual({
      ...transactionAdded,
      timestamp: 1,
      validFrom: BigNumber.from(2),
      expiresAt: BigNumber.from(4),
    })
  })

  it('should return a recovery queue item with expiresAt null if txExpiration is zero', async () => {
    const transactionAdded = {
      getBlock: () => Promise.resolve({ timestamp: 1 }),
    } as TransactionAddedEvent
    const txCooldown = BigNumber.from(1)
    const txExpiration = BigNumber.from(0)

    const item = await _getRecoveryQueueItem(transactionAdded, txCooldown, txExpiration)

    expect(item).toStrictEqual({
      ...transactionAdded,
      timestamp: 1,
      validFrom: BigNumber.from(2),
      expiresAt: null,
    })
  })
})

describe('getRecoveryState', () => {
  it('should return the recovery state', async () => {
    const modules = [faker.finance.ethereumAddress()]
    const txExpiration = BigNumber.from(0)
    const txCooldown = BigNumber.from(69420)
    const txNonce = BigNumber.from(2)
    const queueNonce = BigNumber.from(3)
    const transactionsAdded = [
      {
        getBlock: () => Promise.resolve({ timestamp: 69 }),
        args: {
          queueNonce: BigNumber.from(1),
        },
      } as unknown,
      {
        getBlock: () => Promise.resolve({ timestamp: 420 }),
        args: {
          queueNonce: BigNumber.from(2),
        },
      } as unknown,
      {
        getBlock: () => Promise.resolve({ timestamp: 69420 }),
        args: {
          queueNonce: BigNumber.from(3),
        },
      } as unknown,
    ] as Array<TransactionAddedEvent>

    const delayModifier = {
      filters: {
        TransactionAdded: () => ({}),
      },
      address: faker.finance.ethereumAddress(),
      getModulesPaginated: () => Promise.resolve([modules]),
      txExpiration: () => Promise.resolve(txExpiration),
      txCooldown: () => Promise.resolve(txCooldown),
      txNonce: () => Promise.resolve(txNonce),
      queueNonce: () => Promise.resolve(queueNonce),
      queryFilter: () => Promise.resolve(transactionsAdded),
    }

    const recoveryState = await _getRecoveryState(delayModifier as unknown as Delay)

    expect(recoveryState).toStrictEqual({
      address: delayModifier.address,
      modules,
      txExpiration,
      txCooldown,
      txNonce,
      queueNonce,
      queue: [
        {
          ...transactionsAdded[1],
          timestamp: 420,
          validFrom: BigNumber.from(420).add(txCooldown),
          expiresAt: null,
        },
        {
          ...transactionsAdded[2],
          timestamp: 69420,
          validFrom: BigNumber.from(69420).add(txCooldown),
          expiresAt: null,
        },
      ],
    })
  })
})

jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useIntervalCounter')
jest.mock('@/hooks/useChains')
jest.mock('@/services/recovery/delay-modifier')

const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseIntervalCounter = useIntervalCounter as jest.MockedFunction<typeof useIntervalCounter>
const mockUseHasFeature = useHasFeature as jest.MockedFunction<typeof useHasFeature>
const mockGetDelayModifiers = getDelayModifiers as jest.MockedFunction<typeof getDelayModifiers>

describe('useLoadRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return the recovery state', async () => {
    // useSafeInfo
    mockUseSafeInfo.mockReturnValue({
      safeAddress: faker.finance.ethereumAddress(),
      safe: {
        chainId: faker.string.numeric(),
        modules: [
          {
            value: faker.finance.ethereumAddress(),
          },
        ],
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    // getDelayModifiers
    const delayModules = [faker.finance.ethereumAddress()]
    const txExpiration = BigNumber.from(0)
    const txCooldown = BigNumber.from(69420)
    const txNonce = BigNumber.from(2)
    const queueNonce = BigNumber.from(3)
    const transactionsAdded = [
      {
        getBlock: () => Promise.resolve({ timestamp: 69 }),
        args: {
          queueNonce: BigNumber.from(1),
        },
      } as unknown,
      {
        getBlock: () => Promise.resolve({ timestamp: 420 }),
        args: {
          queueNonce: BigNumber.from(2),
        },
      } as unknown,
      {
        getBlock: () => Promise.resolve({ timestamp: 69420 }),
        args: {
          queueNonce: BigNumber.from(3),
        },
      } as unknown,
    ] as Array<TransactionAddedEvent>
    const delayModifier = {
      filters: {
        TransactionAdded: () => ({}),
      },
      address: faker.finance.ethereumAddress(),
      getModulesPaginated: () => Promise.resolve([delayModules]),
      txExpiration: () => Promise.resolve(txExpiration),
      txCooldown: () => Promise.resolve(txCooldown),
      txNonce: () => Promise.resolve(txNonce),
      queueNonce: () => Promise.resolve(queueNonce),
      queryFilter: () => Promise.resolve(transactionsAdded),
    } as unknown as Delay
    mockGetDelayModifiers.mockResolvedValue([delayModifier])

    const { result } = renderHook(() => useLoadRecovery())

    // Loading
    expect(result.current).toStrictEqual([undefined, undefined, true])

    // Loaded
    await waitFor(() => {
      expect(result.current).toStrictEqual([
        [
          {
            address: delayModifier.address,
            modules: delayModules,
            txExpiration,
            txCooldown,
            txNonce,
            queueNonce,
            queue: [
              {
                ...transactionsAdded[1],
                timestamp: 420,
                validFrom: BigNumber.from(420).add(txCooldown),
                expiresAt: null,
              },
              {
                ...transactionsAdded[2],
                timestamp: 69420,
                validFrom: BigNumber.from(69420).add(txCooldown),
                expiresAt: null,
              },
            ],
          },
        ],
        undefined,
        false,
      ])
    })
  })

  it('should fetch the recovery state again if the Safe address changes', async () => {
    // useSafeInfo
    const safeAddress1 = faker.finance.ethereumAddress()
    const chainId = faker.string.numeric()
    const modules = [
      {
        value: faker.finance.ethereumAddress(),
      },
    ]
    mockUseSafeInfo.mockReturnValue({
      safeAddress: safeAddress1,
      safe: {
        chainId,
        modules,
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    // getDelayModifiers
    mockGetDelayModifiers.mockImplementation(jest.fn())

    const { rerender } = renderHook(() => useLoadRecovery())

    expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)

    // Safe address changes
    const safeAddress2 = faker.finance.ethereumAddress()
    mockUseSafeInfo.mockReturnValue({
      safeAddress: safeAddress2,
      safe: {
        chainId,
        modules,
      },
    } as ReturnType<typeof useSafeInfo>)

    rerender()

    await waitFor(() => {
      expect(mockGetDelayModifiers).toHaveBeenCalledTimes(2)
    })
  })

  it('should fetch the recovery state again if the chain changes', async () => {
    // useSafeInfo
    const safeAddress = faker.finance.ethereumAddress()
    const chainId1 = faker.string.numeric()
    const modules = [
      {
        value: faker.finance.ethereumAddress(),
      },
    ]
    mockUseSafeInfo.mockReturnValue({
      safeAddress,
      safe: {
        chainId: chainId1,
        modules,
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    // getDelayModifiers
    mockGetDelayModifiers.mockImplementation(jest.fn())

    const { rerender } = renderHook(() => useLoadRecovery())

    expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)

    // Chain changes
    const chainId2 = faker.string.numeric({ exclude: chainId1 })
    mockUseSafeInfo.mockReturnValue({
      safeAddress,
      safe: {
        chainId: chainId2,
        modules,
      },
    } as ReturnType<typeof useSafeInfo>)

    rerender()

    await waitFor(() => {
      expect(mockGetDelayModifiers).toHaveBeenCalledTimes(2)
    })
  })

  it('should fetch the recovery state again if the enabled modules change', async () => {
    // useSafeInfo
    const safeAddress = faker.finance.ethereumAddress()
    const chainId = faker.string.numeric()
    const modules1 = [
      {
        value: faker.finance.ethereumAddress(),
      },
    ]
    mockUseSafeInfo.mockReturnValue({
      safeAddress,
      safe: {
        chainId,
        modules: modules1,
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    // getDelayModifiers
    mockGetDelayModifiers.mockImplementation(jest.fn())

    const { rerender } = renderHook(() => useLoadRecovery())

    expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)

    // Modules changes (module is added)
    const modules2 = [
      ...modules1,
      {
        value: faker.finance.ethereumAddress(),
      },
    ]
    mockUseSafeInfo.mockReturnValue({
      safeAddress,
      safe: {
        chainId,
        modules: modules2,
      },
    } as ReturnType<typeof useSafeInfo>)

    rerender()

    await waitFor(() => {
      expect(mockGetDelayModifiers).toHaveBeenCalledTimes(2)
    })
  })

  it.skip('should poll the recovery state every 5 minutes', async () => {
    jest.useFakeTimers()

    // useSafeInfo
    mockUseSafeInfo.mockReturnValue({
      safeAddress: faker.finance.ethereumAddress(),
      safe: {
        chainId: faker.string.numeric(),
        modules: [
          {
            value: faker.finance.ethereumAddress(),
          },
        ],
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockImplementation(useIntervalCounter) // TODO: Fix this

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    // getDelayModifiers
    mockGetDelayModifiers.mockImplementation(jest.fn())

    renderHook(() => useLoadRecovery())

    expect(mockGetDelayModifiers).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(5 * 60 * 1_000)

    await waitFor(() => {
      expect(mockGetDelayModifiers).toHaveBeenCalledTimes(2)
    })

    jest.useRealTimers()
  })

  it('should not return the recovery state if the chain does not support recovery', async () => {
    // useSafeInfo
    mockUseSafeInfo.mockReturnValue({
      safeAddress: faker.finance.ethereumAddress(),
      safe: {
        chainId: faker.string.numeric(),
        modules: [
          {
            value: faker.finance.ethereumAddress(),
          },
        ],
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(false) // Does not support recovery

    renderHook(() => useLoadRecovery())

    await waitFor(() => {
      expect(mockGetDelayModifiers).not.toHaveBeenCalled()
    })
  })

  it('should not return the recovery state if there is no provider', async () => {
    // useSafeInfo
    mockUseSafeInfo.mockReturnValue({
      safeAddress: faker.finance.ethereumAddress(),
      safe: {
        chainId: faker.string.numeric(),
        modules: [
          {
            value: faker.finance.ethereumAddress(),
          },
        ],
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    mockUseWeb3ReadOnly.mockReturnValue(undefined) // No provider

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    renderHook(() => useLoadRecovery())

    await waitFor(() => {
      expect(mockGetDelayModifiers).not.toHaveBeenCalled()
    })
  })

  it('should not return the recovery state if the Safe has no modules', async () => {
    // useSafeInfo
    mockUseSafeInfo.mockReturnValue({
      safeAddress: faker.finance.ethereumAddress(),
      safe: {
        chainId: faker.string.numeric(),
        modules: [], // No modules enabled
      },
    } as unknown as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    renderHook(() => useLoadRecovery())

    await waitFor(() => {
      expect(mockGetDelayModifiers).not.toHaveBeenCalled()
    })
  })

  it('should not check for delay modifiers if only the spending limit module is enabled', async () => {
    const chainId = faker.string.numeric()

    // useSafeInfo
    mockUseSafeInfo.mockReturnValue({
      safeAddress: faker.finance.ethereumAddress(),
      safe: {
        chainId,
        modules: [
          {
            value: getSpendingLimitModuleAddress(chainId),
          },
        ], // Only spending limit module enabled
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    renderHook(() => useLoadRecovery())

    await waitFor(() => {
      expect(mockGetDelayModifiers).not.toHaveBeenCalled()
    })
  })

  it('should not return the recovery state if no delay modifier is enabled', async () => {
    // useSafeInfo
    mockUseSafeInfo.mockReturnValue({
      safeAddress: faker.finance.ethereumAddress(),
      safe: {
        chainId: faker.string.numeric(),
        modules: [
          {
            value: faker.finance.ethereumAddress(),
          },
        ],
      },
    } as ReturnType<typeof useSafeInfo>)

    // useWeb3ReadOnly
    const provider = new JsonRpcProvider()
    mockUseWeb3ReadOnly.mockReturnValue(provider)

    // useIntervalCounter
    mockUseIntervalCounter.mockReturnValue([0, jest.fn()])

    // useHasFeature
    mockUseHasFeature.mockReturnValue(true)

    // getDelayModifiers
    mockGetDelayModifiers.mockResolvedValue([]) // No Delay Modifiers

    const { result } = renderHook(() => useLoadRecovery())

    // Loading
    expect(result.current).toStrictEqual([undefined, undefined, true])

    // Loaded
    await waitFor(() => {
      expect(result.current).toStrictEqual([undefined, undefined, false])
    })
  })
})
