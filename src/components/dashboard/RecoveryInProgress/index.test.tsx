import { render } from '@testing-library/react'
import { BigNumber } from 'ethers'

import { _RecoveryInProgress } from '.'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

jest.mock('@/hooks/useRecoveryTxState')

const mockUseRecoveryTxState = useRecoveryTxState as jest.MockedFunction<typeof useRecoveryTxState>

describe('RecoveryInProgress', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return null if the chain does not support recovery', () => {
    mockUseRecoveryTxState.mockReturnValue({} as any)

    const result = render(
      <_RecoveryInProgress
        supportsRecovery={false}
        timestamp={0}
        queuedTxs={[{ timestamp: BigNumber.from(0) } as RecoveryQueueItem]}
      />,
    )

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return null if there are no delayed transactions', () => {
    mockUseRecoveryTxState.mockReturnValue({} as any)

    const result = render(<_RecoveryInProgress supportsRecovery={true} timestamp={69420} queuedTxs={[]} />)

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return null if all the delayed transactions are expired and invalid', () => {
    mockUseRecoveryTxState.mockReturnValue({} as any)

    const result = render(
      <_RecoveryInProgress
        supportsRecovery={true}
        timestamp={69420}
        queuedTxs={[
          {
            timestamp: BigNumber.from(0),
            validFrom: BigNumber.from(69),
            expiresAt: BigNumber.from(420),
          } as RecoveryQueueItem,
        ]}
      />,
    )

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return the countdown of the next non-expired/invalid transactions if none are non-expired/valid', () => {
    mockUseRecoveryTxState.mockReturnValue({
      remainingSeconds: 69 * 420 * 1337,
      isExecutable: false,
      isNext: true,
    } as any)

    const mockBlockTimestamp = BigNumber.from(69420)

    const { queryByText } = render(
      <_RecoveryInProgress
        supportsRecovery={true}
        timestamp={mockBlockTimestamp.toNumber()}
        queuedTxs={[
          {
            timestamp: mockBlockTimestamp.add(1),
            validFrom: mockBlockTimestamp.add(1), // Invalid
            expiresAt: mockBlockTimestamp.add(1), // Non-expired
          } as RecoveryQueueItem,
          {
            // Older - should render this
            timestamp: mockBlockTimestamp,
            validFrom: mockBlockTimestamp.mul(4), // Invalid
            expiresAt: null, // Non-expired
          } as RecoveryQueueItem,
        ]}
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
    expect(queryByText('448')).toBeInTheDocument()
    // Hours
    expect(queryByText('10')).toBeInTheDocument()
    // Mins
    expect(queryByText('51')).toBeInTheDocument()
  })

  it('should return the info of the next non-expired/valid transaction', () => {
    mockUseRecoveryTxState.mockReturnValue({ isExecutable: true, remainingSeconds: 0 } as any)

    const mockBlockTimestamp = BigNumber.from(69420)

    const { queryByText } = render(
      <_RecoveryInProgress
        supportsRecovery={true}
        timestamp={mockBlockTimestamp.toNumber()}
        queuedTxs={[
          {
            timestamp: mockBlockTimestamp.sub(1),
            validFrom: mockBlockTimestamp.sub(1), // Invalid
            expiresAt: mockBlockTimestamp.sub(1), // Non-expired
          } as RecoveryQueueItem,
          {
            // Older - should render this
            timestamp: mockBlockTimestamp.sub(2),
            validFrom: mockBlockTimestamp.sub(1), // Invalid
            expiresAt: null, // Non-expired
          } as RecoveryQueueItem,
        ]}
      />,
    )

    expect(queryByText('Account recovery possible')).toBeInTheDocument()
    expect(queryByText('The recovery process is possible. This Account can be recovered.')).toBeInTheDocument()
    ;['day', 'hr', 'min'].forEach((unit) => {
      // May be pluralised
      expect(queryByText(unit, { exact: false })).not.toBeInTheDocument()
    })
  })

  it('should return the intemediary info for of the queued, non-expired/valid transactions', () => {
    mockUseRecoveryTxState.mockReturnValue({
      isExecutable: false,
      isNext: false,
      remainingSeconds: 69 * 420 * 1337,
    } as any)

    const mockBlockTimestamp = BigNumber.from(69420)

    const { queryByText } = render(
      <_RecoveryInProgress
        supportsRecovery={true}
        timestamp={mockBlockTimestamp.toNumber()}
        queuedTxs={[
          {
            timestamp: mockBlockTimestamp.sub(1),
            validFrom: mockBlockTimestamp.sub(1), // Invalid
            expiresAt: mockBlockTimestamp.sub(1), // Non-expired
          } as RecoveryQueueItem,
          {
            // Older - should render this
            timestamp: mockBlockTimestamp.sub(2),
            validFrom: mockBlockTimestamp.sub(1), // Invalid
            expiresAt: null, // Non-expired
          } as RecoveryQueueItem,
        ]}
      />,
    )

    expect(queryByText('Account recovery in progress')).toBeInTheDocument()
    expect(
      queryByText(
        'The recovery process has started. This Account can be recovered after previous attempts are executed or skipped and the delay period has passed:',
      ),
    )
    ;['day', 'hr', 'min'].forEach((unit) => {
      // May be pluralised
      expect(queryByText(unit, { exact: false })).toBeInTheDocument()
    })
    // Days
    expect(queryByText('448')).toBeInTheDocument()
    // Hours
    expect(queryByText('10')).toBeInTheDocument()
    // Mins
  })
})
