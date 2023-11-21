import { getDelayModifiers } from '@/services/recovery/delay-modifier'
import { faker } from '@faker-js/faker'
import { BigNumber } from 'ethers'
import type { JsonRpcProvider } from '@ethersproject/providers'
import type { Delay, TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import useLoadRecovery from '../loadables/useLoadRecovery'
import { useCurrentChain, useHasFeature } from '../useChains'
import useSafeInfo from '../useSafeInfo'
import { useWeb3ReadOnly } from '../wallets/web3'
import { renderHook, waitFor } from '@testing-library/react'
import { getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import { _getSafeCreationReceipt } from '@/services/recovery/recovery-state'

const setupFetchStub = (data: any) => (_url: string) => {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    status: 200,
    ok: true,
  })
}

// TODO: Condense test to only check loading logic as `recovery-state.test.ts` covers most

jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/web3')
jest.mock('@/hooks/useChains')
jest.mock('@/services/recovery/delay-modifier')

const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
const mockUseCurrentChain = useCurrentChain as jest.MockedFunction<typeof useCurrentChain>
const mockUseWeb3ReadOnly = useWeb3ReadOnly as jest.MockedFunction<typeof useWeb3ReadOnly>
const mockUseHasFeature = useHasFeature as jest.MockedFunction<typeof useHasFeature>
const mockGetDelayModifiers = getDelayModifiers as jest.MockedFunction<typeof getDelayModifiers>

describe('useLoadRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // _getSafeCreationReceipt
    _getSafeCreationReceipt.cache.clear?.()

    global.fetch = jest.fn().mockImplementation(setupFetchStub({ transactionHash: `0x${faker.string.hexadecimal()}` }))
  })

  it('should return the recovery state', async () => {
    const safeAddress = faker.finance.ethereumAddress()

    // useSafeInfo
    mockUseSafeInfo.mockReturnValue({
      safeAddress,
      safe: {
        chainId: faker.string.numeric(),
        modules: [
          {
            value: faker.finance.ethereumAddress(),
          },
        ],
      },
    } as ReturnType<typeof useSafeInfo>)

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const from = faker.finance.ethereumAddress()
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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
        args: {
          to: safeAddress,
          queueNonce: BigNumber.from(1),
          data: '0x',
        },
      } as unknown,
      {
        args: {
          to: safeAddress,
          queueNonce: BigNumber.from(2),
          data: '0x',
        },
      } as unknown,
      {
        args: {
          to: faker.finance.ethereumAddress(),
          queueNonce: BigNumber.from(3),
          data: '0x',
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
      txCreatedAt: jest
        .fn()
        .mockResolvedValueOnce(BigNumber.from(69))
        .mockResolvedValueOnce(BigNumber.from(420))
        .mockResolvedValueOnce(BigNumber.from(69420)),
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
            guardians: delayModules,
            txExpiration,
            txCooldown,
            txNonce,
            queueNonce,
            queue: [
              {
                ...transactionsAdded[0],
                timestamp: BigNumber.from(69).mul(1_000),
                validFrom: BigNumber.from(69).add(txCooldown).mul(1_000),
                expiresAt: null,
                isMalicious: false,
                executor: from,
              },
              {
                ...transactionsAdded[1],
                timestamp: BigNumber.from(420).mul(1_000),
                validFrom: BigNumber.from(420).add(txCooldown).mul(1_000),
                expiresAt: null,
                isMalicious: false,
                executor: from,
              },
              {
                ...transactionsAdded[2],
                timestamp: BigNumber.from(69420).mul(1_000),
                validFrom: BigNumber.from(69420).add(txCooldown).mul(1_000),
                expiresAt: null,
                isMalicious: true,
                executor: from,
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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: () =>
        jest
          .fn()
          .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
          .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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
        args: {
          queueNonce: BigNumber.from(1),
          data: '0x',
        },
      } as unknown,
      {
        args: {
          queueNonce: BigNumber.from(2),
          data: '0x',
        },
      } as unknown,
      {
        args: {
          queueNonce: BigNumber.from(3),
          data: '0x',
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
      txCreatedAt: jest
        .fn()
        .mockResolvedValueOnce(BigNumber.from(69))
        .mockResolvedValueOnce(BigNumber.from(420))
        .mockResolvedValueOnce(BigNumber.from(69420)),
      queueNonce: () => Promise.resolve(queueNonce),
      queryFilter: () => Promise.resolve(transactionsAdded),
    } as unknown as Delay
    mockGetDelayModifiers.mockResolvedValue([delayModifier])

    const { result } = renderHook(() => useLoadRecovery())

    await waitFor(() => {
      expect(result.current[0]).toBeDefined()
    })

    const firstPoll = result.current[0]

    jest.advanceTimersByTime(5 * 60 * 1_000) // 5m

    await waitFor(() => {
      expect(result.current[0] === firstPoll).toBe(false)
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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue({
      transactionService: faker.internet.url({ appendSlash: false }),
    } as ChainInfo)

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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

  it('should not fetch the recovery state if no transaction service is available', async () => {
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

    // useCurrentChain
    mockUseCurrentChain.mockReturnValue(undefined) // No transaction service

    // useWeb3ReadOnly
    const provider = {
      getTransactionReceipt: jest
        .fn()
        .mockResolvedValueOnce({ blockHash: `0x${faker.string.hexadecimal}` })
        .mockResolvedValue({ from: faker.finance.ethereumAddress() }),
    } as unknown as JsonRpcProvider
    mockUseWeb3ReadOnly.mockReturnValue(provider)

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
      expect(result.current).toStrictEqual([undefined, undefined, false])
    })
  })
})
