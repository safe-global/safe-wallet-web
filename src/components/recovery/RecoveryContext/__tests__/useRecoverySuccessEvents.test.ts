import { faker } from '@faker-js/faker'

import { recoveryDispatch, RecoveryEvent } from '@/services/recovery/recoveryEvents'
import { PendingStatus } from '@/store/pendingTxsSlice'
import { renderHook } from '@testing-library/react'
import { useRecoverySuccessEvent } from '../useRecoverySuccessEvent'

jest.mock('@/services/recovery/recoveryEvents')

const mockRecoveryDispatch = recoveryDispatch as jest.MockedFunction<typeof recoveryDispatch>

describe('useRecoverySuccessEvent', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should dispatch SUCCESS event when pending transaction is loaded', () => {
    const recoveryTxHash = faker.string.hexadecimal()
    const pendingState = {
      [recoveryTxHash]: PendingStatus.SUBMITTING,
    }
    const recoveryState = [
      {
        address: faker.finance.ethereumAddress(),
        queue: [
          {
            transactionHash: faker.string.hexadecimal(),
            args: {
              txHash: recoveryTxHash,
            },
          },
        ],
      },
    ]

    renderHook(() => useRecoverySuccessEvent(pendingState, recoveryState as any))

    expect(mockRecoveryDispatch).toHaveBeenCalledTimes(1)
    expect(mockRecoveryDispatch).toHaveBeenNthCalledWith(1, RecoveryEvent.SUCCESS, {
      moduleAddress: recoveryState[0].address,
      txHash: recoveryState[0].queue[0].transactionHash,
      recoveryTxHash,
    })
  })

  it('should dispatch not dispatch any event when pending transaction is notloaded', () => {
    const pendingState = {
      [faker.string.hexadecimal()]: PendingStatus.SUBMITTING,
    }
    const recoveryState = [
      {
        address: faker.finance.ethereumAddress(),
        queue: [
          {
            transactionHash: faker.string.hexadecimal(),
            args: {
              txHash: faker.string.hexadecimal(),
            },
          },
        ],
      },
    ]

    renderHook(() => useRecoverySuccessEvent(pendingState, recoveryState as any))

    expect(mockRecoveryDispatch).not.toHaveBeenCalled()
  })
})
