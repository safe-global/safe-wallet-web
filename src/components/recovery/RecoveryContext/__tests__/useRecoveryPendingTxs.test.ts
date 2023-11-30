import { faker } from '@faker-js/faker'

import { RecoveryEvent, recoveryDispatch, RecoveryEventType } from '@/services/recovery/recoveryEvents'
import { PendingStatus } from '@/store/pendingTxsSlice'
import { act, renderHook } from '@/tests/test-utils'
import { useRecoveryPendingTxs } from '../useRecoveryPendingTxs'

describe('useRecoveryPendingTxs', () => {
  it('should set pending status to SUBMITTING when EXECUTING event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const txHash = faker.string.hexadecimal()
    const recoveryTxHash = faker.string.hexadecimal()
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.EXECUTING, {
        moduleAddress: delayModifierAddress,
        txHash,
        recoveryTxHash,
        eventType: faker.helpers.enumValue(RecoveryEventType),
      })
    })

    expect(result.current).toStrictEqual({
      [recoveryTxHash]: PendingStatus.SUBMITTING,
    })
  })

  it('should set pending status to PROCESSING when PROCESSING event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const txHash = faker.string.hexadecimal()
    const recoveryTxHash = faker.string.hexadecimal()
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.PROCESSING, {
        moduleAddress: delayModifierAddress,
        txHash,
        recoveryTxHash,
        eventType: faker.helpers.enumValue(RecoveryEventType),
      })
    })

    expect(result.current).toStrictEqual({
      [recoveryTxHash]: PendingStatus.PROCESSING,
    })
  })

  it('should remove the pending status when REVERTED event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const txHash = faker.string.hexadecimal()
    const recoveryTxHash = faker.string.hexadecimal()
    const eventType = faker.helpers.enumValue(RecoveryEventType)
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.EXECUTING, {
        moduleAddress: delayModifierAddress,
        txHash,
        recoveryTxHash,
        eventType,
      })
      recoveryDispatch(RecoveryEvent.REVERTED, {
        moduleAddress: delayModifierAddress,
        txHash,
        recoveryTxHash,
        eventType,
        error: new Error(),
      })
    })

    expect(result.current).toStrictEqual({})
  })

  it('should set pending status to INDEXING when PROCESSED event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const txHash = faker.string.hexadecimal()
    const recoveryTxHash = faker.string.hexadecimal()
    const eventType = faker.helpers.enumValue(RecoveryEventType)
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.EXECUTING, {
        moduleAddress: delayModifierAddress,
        txHash,
        recoveryTxHash,
        eventType,
      })
      recoveryDispatch(RecoveryEvent.PROCESSED, {
        moduleAddress: delayModifierAddress,
        txHash,
        recoveryTxHash,
        eventType,
      })
    })

    expect(result.current).toStrictEqual({
      [recoveryTxHash]: PendingStatus.INDEXING,
    })
  })

  it('should remove the pending status to SUCCESS event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const txHash = faker.string.hexadecimal()
    const recoveryTxHash = faker.string.hexadecimal()
    const eventType = faker.helpers.enumValue(RecoveryEventType)
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.EXECUTING, {
        moduleAddress: delayModifierAddress,
        txHash,
        recoveryTxHash,
        eventType,
      })
      recoveryDispatch(RecoveryEvent.SUCCESS, {
        moduleAddress: delayModifierAddress,
        txHash,
        recoveryTxHash,
      })
    })

    expect(result.current).toStrictEqual({})
  })

  // No need to test RecoveryEvent.FAILED as pending status is not set before it is dispatched
})
