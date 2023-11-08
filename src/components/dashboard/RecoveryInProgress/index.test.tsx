import { useBlockTimestamp } from '@/hooks/useBlockTimestamp'
import { useAppSelector } from '@/store'
import { render } from '@testing-library/react'
import { BigNumber } from 'ethers'
import { RecoveryInProgress, _getCountdown } from '.'

describe('getCountdown', () => {
  it('should convert 0 seconds to 0 days, 0 hours, and 0 minutes', () => {
    const result = _getCountdown(0)
    expect(result).toEqual({ days: 0, hours: 0, minutes: 0 })
  })

  it('should convert 3600 seconds to 0 days, 1 hour, and 0 minutes', () => {
    const result = _getCountdown(3600)
    expect(result).toEqual({ days: 0, hours: 1, minutes: 0 })
  })

  it('should convert 86400 seconds to 1 day, 0 hours, and 0 minutes', () => {
    const result = _getCountdown(86400)
    expect(result).toEqual({ days: 1, hours: 0, minutes: 0 })
  })

  it('should convert 123456 seconds to 1 day, 10 hours, and 17 minutes', () => {
    const result = _getCountdown(123456)
    expect(result).toEqual({ days: 1, hours: 10, minutes: 17 })
  })
})

jest.mock('@/hooks/useBlockTimestamp')
jest.mock('@/store')

const mockUseBlockTimestamp = useBlockTimestamp as jest.MockedFunction<typeof useBlockTimestamp>
const mockUseAppSelector = useAppSelector as jest.MockedFunction<typeof useAppSelector>

describe('RecoveryInProgress', () => {
  it('should return null if there is no block timestamp', () => {
    mockUseBlockTimestamp.mockReturnValue(undefined)
    mockUseAppSelector.mockReturnValue([{ queue: [{ timestamp: 0 }] }])

    const result = render(<RecoveryInProgress />)

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return null if there are no delayed transactions', () => {
    mockUseBlockTimestamp.mockReturnValue(undefined)
    mockUseAppSelector.mockReturnValue([{ queue: [] }])

    const result = render(<RecoveryInProgress />)

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return null if all the delayed transactions are expired and invalid', () => {
    mockUseBlockTimestamp.mockReturnValue(69420)
    mockUseAppSelector.mockReturnValue([
      {
        queue: [
          {
            timestamp: 0,
            validFrom: BigNumber.from(69),
            expiresAt: BigNumber.from(420),
          },
        ],
      },
    ])

    const result = render(<RecoveryInProgress />)

    expect(result.container).toBeEmptyDOMElement()
  })

  it('should return the countdown of the latest non-expired/invalid transactions if none are non-expired/valid', () => {
    const mockBlockTimestamp = 69420

    mockUseBlockTimestamp.mockReturnValue(mockBlockTimestamp)
    mockUseAppSelector.mockReturnValue([
      {
        queue: [
          {
            timestamp: mockBlockTimestamp + 1,
            validFrom: BigNumber.from(mockBlockTimestamp + 1), // Invalid
            expiresAt: BigNumber.from(mockBlockTimestamp + 1), // Non-expired
          },
          {
            // Older - should render this
            timestamp: mockBlockTimestamp,
            validFrom: BigNumber.from(mockBlockTimestamp * 4), // Invalid
            expiresAt: null, // Non-expired
          },
        ],
      },
    ])

    const { queryByText } = render(<RecoveryInProgress />)

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

    mockUseBlockTimestamp.mockReturnValue(mockBlockTimestamp)
    mockUseAppSelector.mockReturnValue([
      {
        queue: [
          {
            timestamp: mockBlockTimestamp - 1,
            validFrom: BigNumber.from(mockBlockTimestamp - 1), // Invalid
            expiresAt: BigNumber.from(mockBlockTimestamp - 1), // Non-expired
          },
          {
            // Older - should render this
            timestamp: mockBlockTimestamp - 2,
            validFrom: BigNumber.from(mockBlockTimestamp - 1), // Invalid
            expiresAt: null, // Non-expired
          },
        ],
      },
    ])

    const { queryByText } = render(<RecoveryInProgress />)

    expect(queryByText('Account recovery possible')).toBeInTheDocument()
    expect(queryByText('The recovery process is possible. This Account can be recovered.')).toBeInTheDocument()
    ;['day', 'hr', 'min'].forEach((unit) => {
      // May be pluralised
      expect(queryByText(unit, { exact: false })).not.toBeInTheDocument()
    })
  })
})
