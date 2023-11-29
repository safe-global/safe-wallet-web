import { faker } from '@faker-js/faker'
import { BigNumber } from 'ethers'

import { _RecoveryHeader, _useIsProposalInProgress } from '.'
import { render, renderHook, waitFor } from '@/tests/test-utils'
import { RecoveryContext } from '@/components/recovery/RecoveryContext'
import { RecoveryEvent, recoveryDispatch, RecoveryEventType } from '@/services/recovery/recoveryEvents'

describe('RecoveryHeader', () => {
  it('should not render a widget if the chain does not support recovery', () => {
    const queue = [{ validFrom: BigNumber.from(0) }] as any

    const { container } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isProposalInProgress={false} isRecoverer queue={queue} supportsRecovery={false} />
      </RecoveryContext.Provider>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('should render the in-progress widget if there is a queue for recoverers', () => {
    const queue = [{ validFrom: BigNumber.from(0) }] as any

    const { queryByText } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isProposalInProgress={false} isRecoverer queue={queue} supportsRecovery />
      </RecoveryContext.Provider>,
    )

    expect(queryByText('Account recovery in progress')).toBeTruthy()
  })

  it('should render the proposal widget when there is no queue for recoverers', () => {
    const queue = [] as any

    const { queryByText } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isProposalInProgress={false} isRecoverer queue={queue} supportsRecovery />
      </RecoveryContext.Provider>,
    )

    expect(queryByText('Recover this Account')).toBeTruthy()
  })

  it('should not render the proposal widget when there is no queue for recoverers and proposal is in progress', () => {
    const queue = [] as any

    const { container } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isProposalInProgress isRecoverer queue={queue} supportsRecovery />
      </RecoveryContext.Provider>,
    )

    expect(container).toBeEmptyDOMElement()
  })
})

describe('useIsProposalInProgress', () => {
  ;[RecoveryEvent.EXECUTING, RecoveryEvent.PROCESSING].forEach((event) => {
    it('should return true if there is a proposal in progress', async () => {
      const { result } = renderHook(() => _useIsProposalInProgress())

      expect(result.current).toBe(false)

      recoveryDispatch(event, {
        moduleAddress: faker.finance.ethereumAddress(),
        recoveryTxHash: faker.string.hexadecimal(),
        eventType: faker.helpers.enumValue(RecoveryEventType),
      })

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })
  })
  ;[RecoveryEvent.REVERTED, RecoveryEvent.PROCESSED, RecoveryEvent.FAILED].forEach((event) => {
    it('should return false if there is not a proposal in progress', async () => {
      const { result } = renderHook(() => _useIsProposalInProgress())

      expect(result.current).toBe(false)

      // Trigger pending
      recoveryDispatch(RecoveryEvent.EXECUTING, {
        moduleAddress: faker.finance.ethereumAddress(),
        recoveryTxHash: faker.string.hexadecimal(),
        eventType: faker.helpers.enumValue(RecoveryEventType),
      })

      await waitFor(() => {
        expect(result.current).toBe(true)
      })

      recoveryDispatch(event, {
        moduleAddress: faker.finance.ethereumAddress(),
        recoveryTxHash: faker.string.hexadecimal(),
        eventType: faker.helpers.enumValue(RecoveryEventType),
      })

      await waitFor(() => {
        expect(result.current).toBe(false)
      })
    })
  })
})
