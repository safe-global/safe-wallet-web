import { BigNumber } from 'ethers'

import { useRecoveryTxState } from '../useRecoveryTxState'
import { renderHook } from '@/tests/test-utils'
import * as store from '@/store'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

describe('useRecoveryTxState', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  describe('Next', () => {
    it('should return correct values when validFrom is in the future and expiresAt is in the future', () => {
      jest.setSystemTime(0)

      jest.spyOn(store, 'useAppSelector').mockReturnValue({
        txNonce: BigNumber.from(0),
      } as unknown as RecoveryQueueItem)

      const validFrom = BigNumber.from(1_000)
      const expiresAt = BigNumber.from(1_000)
      const recoveryQueueItem = { validFrom, expiresAt, args: { queueNonce: BigNumber.from(0) } } as RecoveryQueueItem

      const { result } = renderHook(() => useRecoveryTxState(recoveryQueueItem))

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(1)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(true)
    })

    it('should return correct values when validFrom is in the past and expiresAt is in the future', () => {
      jest.setSystemTime(1_000)

      jest.spyOn(store, 'useAppSelector').mockReturnValue({
        txNonce: BigNumber.from(0),
      } as unknown as RecoveryQueueItem)

      const validFrom = BigNumber.from(0)
      const expiresAt = BigNumber.from(2_000)
      const recoveryQueueItem = { validFrom, expiresAt, args: { queueNonce: BigNumber.from(0) } } as RecoveryQueueItem

      const { result } = renderHook(() => useRecoveryTxState(recoveryQueueItem))

      expect(result.current.isExecutable).toBe(true)
      expect(result.current.remainingSeconds).toBe(0)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(true)
    })

    it('should return correct values when validFrom is in the past and expiresAt is in the past', () => {
      jest.setSystemTime(1_000)

      jest.spyOn(store, 'useAppSelector').mockReturnValue({
        txNonce: BigNumber.from(0),
      } as unknown as RecoveryQueueItem)

      const validFrom = BigNumber.from(0)
      const expiresAt = BigNumber.from(0)
      const recoveryQueueItem = { validFrom, expiresAt, args: { queueNonce: BigNumber.from(0) } } as RecoveryQueueItem

      const { result } = renderHook(() => useRecoveryTxState(recoveryQueueItem))

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(0)
      expect(result.current.isExpired).toBe(true)
      expect(result.current.isNext).toBe(true)
    })
  })

  describe('Queue', () => {
    it('should return correct values when validFrom is in the future and expiresAt is in the future', () => {
      jest.setSystemTime(0)

      jest.spyOn(store, 'useAppSelector').mockReturnValue({
        txNonce: BigNumber.from(1),
      } as unknown as RecoveryQueueItem)

      const validFrom = BigNumber.from(1_000)
      const expiresAt = BigNumber.from(1_000)
      const recoveryQueueItem = { validFrom, expiresAt, args: { queueNonce: BigNumber.from(0) } } as RecoveryQueueItem

      const { result } = renderHook(() => useRecoveryTxState(recoveryQueueItem))

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(1)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(false)
    })

    it('should return correct values when validFrom is in the past and expiresAt is in the future', () => {
      jest.setSystemTime(1_000)

      jest.spyOn(store, 'useAppSelector').mockReturnValue({
        txNonce: BigNumber.from(1),
      } as unknown as RecoveryQueueItem)

      const validFrom = BigNumber.from(0)
      const expiresAt = BigNumber.from(2_000)
      const recoveryQueueItem = { validFrom, expiresAt, args: { queueNonce: BigNumber.from(0) } } as RecoveryQueueItem

      const { result } = renderHook(() => useRecoveryTxState(recoveryQueueItem))

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(0)
      expect(result.current.isExpired).toBe(false)
      expect(result.current.isNext).toBe(false)
    })

    it('should return correct values when validFrom is in the past and expiresAt is in the past', () => {
      jest.setSystemTime(1_000)

      jest.spyOn(store, 'useAppSelector').mockReturnValue({
        txNonce: BigNumber.from(1),
      } as unknown as RecoveryQueueItem)

      const validFrom = BigNumber.from(0)
      const expiresAt = BigNumber.from(0)
      const recoveryQueueItem = { validFrom, expiresAt, args: { queueNonce: BigNumber.from(0) } } as RecoveryQueueItem

      const { result } = renderHook(() => useRecoveryTxState(recoveryQueueItem))

      expect(result.current.isExecutable).toBe(false)
      expect(result.current.remainingSeconds).toBe(0)
      expect(result.current.isExpired).toBe(true)
      expect(result.current.isNext).toBe(false)
    })
  })
})
