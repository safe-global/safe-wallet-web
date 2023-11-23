import { BigNumber } from 'ethers'
import { faker } from '@faker-js/faker'

import { useRecoveryTxState } from '../useRecoveryTxState'
import { renderHook } from '@/tests/test-utils'
import { RecoveryContext } from '@/components/recovery/RecoveryContext'

describe('useRecoveryTxState', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  describe('Next', () => {
    it('should handle multiple Delay Modifiers', () => {
      jest.setSystemTime(0)

      const delayModifierAddress1 = faker.finance.ethereumAddress()
      const nextTxHash1 = faker.string.hexadecimal()

      const delayModifierAddress2 = faker.finance.ethereumAddress()
      const nextTxHash2 = faker.string.hexadecimal()

      const validFrom = BigNumber.from(1_000)
      const expiresAt = BigNumber.from(1_000)

      const data = [
        {
          address: delayModifierAddress1,
          txNonce: BigNumber.from(0),
          queue: [{ address: delayModifierAddress1, transactionHash: nextTxHash1 }],
        },
        {
          address: delayModifierAddress2,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress2,
              transactionHash: nextTxHash2,
              validFrom,
              expiresAt,
              args: { queueNonce: BigNumber.from(0) },
            },
          ],
        },
      ]

      const { result } = renderHook(() => useRecoveryTxState(data[1].queue[0] as any), {
        wrapper: ({ children }) => (
          <RecoveryContext.Provider value={{ state: [data] } as any}> {children}</RecoveryContext.Provider>
        ),
      })

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(1)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(true)
    })

    it('should return correct values when validFrom is in the future and expiresAt is in the future', () => {
      jest.setSystemTime(0)

      const delayModifierAddress = faker.finance.ethereumAddress()
      const nextTxHash = faker.string.hexadecimal()

      const validFrom = BigNumber.from(1_000)
      const expiresAt = BigNumber.from(1_000)

      const data = [
        {
          address: delayModifierAddress,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress,
              transactionHash: nextTxHash,
              validFrom,
              expiresAt,
              args: { queueNonce: BigNumber.from(0) },
            },
          ],
        },
      ]

      const { result } = renderHook(() => useRecoveryTxState(data[0].queue[0] as any), {
        wrapper: ({ children }) => (
          <RecoveryContext.Provider value={{ state: [data] } as any}> {children}</RecoveryContext.Provider>
        ),
      })

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(1)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(true)
    })

    it('should return correct values when validFrom is in the past and expiresAt is in the future', () => {
      jest.setSystemTime(1_000)

      const delayModifierAddress = faker.finance.ethereumAddress()
      const nextTxHash = faker.string.hexadecimal()

      const validFrom = BigNumber.from(0)
      const expiresAt = BigNumber.from(2_000)

      const data = [
        {
          address: delayModifierAddress,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress,
              transactionHash: nextTxHash,
              validFrom,
              expiresAt,
              args: { queueNonce: BigNumber.from(0) },
            },
          ],
        },
      ]

      const { result } = renderHook(() => useRecoveryTxState(data[0].queue[0] as any), {
        wrapper: ({ children }) => (
          <RecoveryContext.Provider value={{ state: [data] } as any}> {children}</RecoveryContext.Provider>
        ),
      })

      expect(result.current.isExecutable).toBe(true)
      expect(result.current.remainingSeconds).toBe(0)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(true)
    })

    it('should return correct values when validFrom is in the past and expiresAt is in the past', () => {
      jest.setSystemTime(1_000)

      const delayModifierAddress = faker.finance.ethereumAddress()
      const nextTxHash = faker.string.hexadecimal()

      const validFrom = BigNumber.from(0)
      const expiresAt = BigNumber.from(0)

      const data = [
        {
          address: delayModifierAddress,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress,
              transactionHash: nextTxHash,
              validFrom,
              expiresAt,
              args: { queueNonce: BigNumber.from(0) },
            },
          ],
        },
      ]

      const { result } = renderHook(() => useRecoveryTxState(data[0].queue[0] as any), {
        wrapper: ({ children }) => (
          <RecoveryContext.Provider value={{ state: [data] } as any}> {children}</RecoveryContext.Provider>
        ),
      })

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(0)
      expect(result.current.isExpired).toBe(true)
      expect(result.current.isNext).toBe(true)
    })
  })

  describe('Queue', () => {
    it('should handle multiple Delay Modifiers', () => {
      jest.setSystemTime(0)

      const delayModifierAddress1 = faker.finance.ethereumAddress()

      const nextTxHash1 = faker.string.hexadecimal()
      const queueTxHash1 = faker.string.hexadecimal()

      const delayModifierAddress2 = faker.finance.ethereumAddress()

      const nextTxHash2 = faker.string.hexadecimal()
      const queueTxHash2 = faker.string.hexadecimal()

      const validFrom = BigNumber.from(1_000)
      const expiresAt = BigNumber.from(1_000)

      const data = [
        {
          address: delayModifierAddress1,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress1,
              transactionHash: nextTxHash1,
            },
            {
              address: delayModifierAddress1,
              transactionHash: queueTxHash1,
            },
          ],
        },
        {
          address: delayModifierAddress2,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress2,
              transactionHash: nextTxHash2,
            },
            {
              address: delayModifierAddress2,
              transactionHash: queueTxHash2,
              validFrom,
              expiresAt,
              args: { queueNonce: BigNumber.from(1) },
            },
          ],
        },
      ]

      const { result } = renderHook(() => useRecoveryTxState(data[1].queue[1] as any), {
        wrapper: ({ children }) => (
          <RecoveryContext.Provider value={{ state: [data] } as any}> {children}</RecoveryContext.Provider>
        ),
      })

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(1)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(false)
    })

    it('should return correct values when validFrom is in the future and expiresAt is in the future', () => {
      jest.setSystemTime(0)

      const delayModifierAddress = faker.finance.ethereumAddress()

      const nextTxHash = faker.string.hexadecimal()
      const queueTxHash = faker.string.hexadecimal()

      const validFrom = BigNumber.from(1_000)
      const expiresAt = BigNumber.from(1_000)

      const data = [
        {
          address: delayModifierAddress,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress,
              transactionHash: nextTxHash,
            },
            {
              address: delayModifierAddress,
              transactionHash: queueTxHash,
              validFrom,
              expiresAt,
              args: { queueNonce: BigNumber.from(1) },
            },
          ],
        },
      ]

      const { result } = renderHook(() => useRecoveryTxState(data[0].queue[1] as any), {
        wrapper: ({ children }) => (
          <RecoveryContext.Provider value={{ state: [data] } as any}> {children}</RecoveryContext.Provider>
        ),
      })

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(1)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(false)
    })

    it('should return correct values when validFrom is in the past and expiresAt is in the future', () => {
      jest.setSystemTime(1_000)

      const delayModifierAddress = faker.finance.ethereumAddress()

      const nextTxHash = faker.string.hexadecimal()
      const queueTxHash = faker.string.hexadecimal()

      const validFrom = BigNumber.from(0)
      const expiresAt = BigNumber.from(2_000)

      const data = [
        {
          address: delayModifierAddress,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress,
              transactionHash: nextTxHash,
            },
            {
              address: delayModifierAddress,
              transactionHash: queueTxHash,
              validFrom,
              expiresAt,
              args: { queueNonce: BigNumber.from(1) },
            },
          ],
        },
      ]

      const { result } = renderHook(() => useRecoveryTxState(data[0].queue[1] as any), {
        wrapper: ({ children }) => (
          <RecoveryContext.Provider value={{ state: [data] } as any}> {children}</RecoveryContext.Provider>
        ),
      })

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(0)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(false)
    })

    it('should return correct values when validFrom is in the past and expiresAt is in the past', () => {
      jest.setSystemTime(1_000)

      const delayModifierAddress = faker.finance.ethereumAddress()

      const nextTxHash = faker.string.hexadecimal()
      const queueTxHash = faker.string.hexadecimal()

      const validFrom = BigNumber.from(0)
      const expiresAt = BigNumber.from(0)

      const data = [
        {
          address: delayModifierAddress,
          txNonce: BigNumber.from(0),
          queue: [
            {
              address: delayModifierAddress,
              transactionHash: nextTxHash,
            },
            {
              address: delayModifierAddress,
              transactionHash: queueTxHash,
              validFrom,
              expiresAt,
              args: { queueNonce: BigNumber.from(1) },
            },
          ],
        },
      ] as const

      const { result } = renderHook(() => useRecoveryTxState(data[0].queue[1] as any), {
        wrapper: ({ children }) => (
          <RecoveryContext.Provider value={{ state: [data] } as any}> {children}</RecoveryContext.Provider>
        ),
      })

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(0)
      expect(result.current.isExpired).toBe(true)
      expect(result.current.isNext).toBe(false)
    })
  })
})
