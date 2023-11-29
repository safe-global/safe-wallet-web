import { RecoveryEvent, recoveryDispatch } from '@/services/recovery/recoveryEvents'
import { PendingStatus } from '@/store/pendingTxsSlice'
import { act, renderHook } from '@/tests/test-utils'
import { faker } from '@faker-js/faker'
import { useRecoveryPendingTxs } from '../useRecoveryPendingTxs'

describe('useRecoveryPendingTxs', () => {
  it('should set pending status to SUBMITTING when EXECUTING event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const recoveryTxHash = faker.string.hexadecimal()
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.EXECUTING, { moduleAddress: delayModifierAddress, recoveryTxHash })
    })

    expect(result.current).toStrictEqual({
      [recoveryTxHash]: PendingStatus.SUBMITTING,
    })
  })

  it('should set pending status to PROCESSING when PROCESSING event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const recoveryTxHash = faker.string.hexadecimal()
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.PROCESSING, { moduleAddress: delayModifierAddress, recoveryTxHash })
    })

    expect(result.current).toStrictEqual({
      [recoveryTxHash]: PendingStatus.PROCESSING,
    })
  })

  it('should set remove the pending status when REVERTED event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const recoveryTxHash = faker.string.hexadecimal()
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.EXECUTING, { moduleAddress: delayModifierAddress, recoveryTxHash })
      recoveryDispatch(RecoveryEvent.REVERTED, {
        moduleAddress: delayModifierAddress,
        recoveryTxHash,
        error: new Error(),
      })
    })

    expect(result.current).toStrictEqual({})
  })

  it('should set remove the pending status when PROCESSED event is emitted', () => {
    const delayModifierAddress = faker.finance.ethereumAddress()
    const recoveryTxHash = faker.string.hexadecimal()
    const { result } = renderHook(() => useRecoveryPendingTxs())

    expect(result.current).toStrictEqual({})

    act(() => {
      recoveryDispatch(RecoveryEvent.EXECUTING, { moduleAddress: delayModifierAddress, recoveryTxHash })
      recoveryDispatch(RecoveryEvent.PROCESSED, { moduleAddress: delayModifierAddress, recoveryTxHash })
    })

    expect(result.current).toStrictEqual({})
  })

  // No need to test RecoveryEvent.FAILED as pending status is not set before it is dispatched
})
