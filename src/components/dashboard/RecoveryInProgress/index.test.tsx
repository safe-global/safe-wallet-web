import { render } from '@testing-library/react'
import { BigNumber } from 'ethers'

import { _RecoveryInProgress } from '.'
import type { RecoveryQueueItem, RecoveryState } from '@/store/recoverySlice'

describe('RecoveryInProgress', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return null if the chain does not support recovery', () => {
    const result = render(
      <_RecoveryInProgress
        supportsRecovery={false}
        blockTimestamp={0}
        recovery={[{ queue: [{ timestamp: 0 } as RecoveryQueueItem] }] as RecoveryState}
      />,
    )

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return a loader if there is no block timestamp', () => {
    const result = render(
      <_RecoveryInProgress
        supportsRecovery={false}
        blockTimestamp={undefined}
        recovery={[{ queue: [{ timestamp: 0 } as RecoveryQueueItem] }] as RecoveryState}
      />,
    )

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return null if there are no delayed transactions', () => {
    const result = render(
      <_RecoveryInProgress
        supportsRecovery={true}
        blockTimestamp={69420}
        recovery={[{ queue: [] as Array<RecoveryQueueItem> }] as RecoveryState}
      />,
    )

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return null if all the delayed transactions are expired and invalid', () => {
    const result = render(
      <_RecoveryInProgress
        supportsRecovery={true}
        blockTimestamp={69420}
        recovery={
          [
            {
              queue: [
                {
                  timestamp: 0,
                  validFrom: BigNumber.from(69),
                  expiresAt: BigNumber.from(420),
                } as RecoveryQueueItem,
              ],
            },
          ] as RecoveryState
        }
      />,
    )

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return the countdown of the latest non-expired/invalid transactions if none are non-expired/valid', () => {
    const mockBlockTimestamp = 69420

    const { queryByText } = render(
      <_RecoveryInProgress
        supportsRecovery={true}
        blockTimestamp={mockBlockTimestamp}
        recovery={
          [
            {
              queue: [
                {
                  timestamp: mockBlockTimestamp + 1,
                  validFrom: BigNumber.from(mockBlockTimestamp + 1), // Invalid
                  expiresAt: BigNumber.from(mockBlockTimestamp + 1), // Non-expired
                } as RecoveryQueueItem,
                {
                  // Older - should render this
                  timestamp: mockBlockTimestamp,
                  validFrom: BigNumber.from(mockBlockTimestamp * 4), // Invalid
                  expiresAt: null, // Non-expired
                } as RecoveryQueueItem,
              ],
            },
          ] as RecoveryState
        }
      />,
    )

    expect(queryByText('Account recovery in progress')).toBeInTheDocument()
    expect(
      queryByText('The recovery process has started. This Account will be ready to recover in:'),
    ).toBeInTheDocument()
    ;['day', 'hr', 'min'].forEach((unit) => {
      // May be pluralised
      expect(queryByText(unit, { exact: false })).toBeInTheDocument()
    })
    // Days
    expect(queryByText('2')).toBeInTheDocument()
    // Hours
    expect(queryByText('9')).toBeInTheDocument()
    // Mins
    expect(queryByText('51')).toBeInTheDocument()
  })

  it('should return the info of the latest non-expired/valid transactions', () => {
    const mockBlockTimestamp = 69420

    const { queryByText } = render(
      <_RecoveryInProgress
        supportsRecovery={true}
        blockTimestamp={mockBlockTimestamp}
        recovery={
          [
            {
              queue: [
                {
                  timestamp: mockBlockTimestamp - 1,
                  validFrom: BigNumber.from(mockBlockTimestamp - 1), // Invalid
                  expiresAt: BigNumber.from(mockBlockTimestamp - 1), // Non-expired
                } as RecoveryQueueItem,
                {
                  // Older - should render this
                  timestamp: mockBlockTimestamp - 2,
                  validFrom: BigNumber.from(mockBlockTimestamp - 1), // Invalid
                  expiresAt: null, // Non-expired
                } as RecoveryQueueItem,
              ],
            },
          ] as RecoveryState
        }
      />,
    )

    expect(queryByText('Account recovery possible')).toBeInTheDocument()
    expect(queryByText('The recovery process is possible. This Account can be recovered.')).toBeInTheDocument()
    ;['day', 'hr', 'min'].forEach((unit) => {
      // May be pluralised
      expect(queryByText(unit, { exact: false })).not.toBeInTheDocument()
    })
  })
})
