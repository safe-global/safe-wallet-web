import { BigNumber } from 'ethers'
import { fireEvent, waitFor } from '@testing-library/react'

import { render } from '@/tests/test-utils'
import { RecoveryInProgress } from '../RecoveryInProgress'
import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

jest.mock('@/hooks/useRecoveryTxState')

const mockUseRecoveryTxState = useRecoveryTxState as jest.MockedFunction<typeof useRecoveryTxState>

describe('RecoveryInProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('modal', () => {
    it('should render executable recovery state correctly', async () => {
      mockUseRecoveryTxState.mockReturnValue({
        isExecutable: true,
        remainingSeconds: 0,
      } as any)

      const mockClose = jest.fn()

      const { queryByText } = render(
        <RecoveryInProgress
          variant="modal"
          onClose={mockClose}
          recovery={{ validFrom: BigNumber.from(0) } as RecoveryQueueItem}
        />,
      )

      ;['days', 'hrs', 'mins'].forEach((unit) => {
        expect(queryByText(unit)).toBeFalsy()
      })

      expect(queryByText('Account recovery possible')).toBeTruthy()
      expect(queryByText('Learn more')).toBeTruthy()

      const dashboardButton = queryByText('Go to dashboard')
      expect(dashboardButton).toBeTruthy()

      fireEvent.click(dashboardButton!)

      await waitFor(() => {
        expect(mockClose).toHaveBeenCalled()
      })
    })

    it('should render non-executable recovery state correctly', async () => {
      mockUseRecoveryTxState.mockReturnValue({
        isExecutable: false,
        remainingSeconds: 420 * 69 * 1337,
      } as any)

      const mockClose = jest.fn()

      const { queryByText } = render(
        <RecoveryInProgress
          variant="modal"
          onClose={mockClose}
          recovery={{ validFrom: BigNumber.from(0) } as RecoveryQueueItem}
        />,
      )

      expect(queryByText('Account recovery in progress')).toBeTruthy()
      expect(queryByText('The recovery process has started. This Account will be ready to recover in:')).toBeTruthy()
      ;['days', 'hrs', 'mins'].forEach((unit) => {
        expect(queryByText(unit)).toBeTruthy()
      })
      expect(queryByText('Learn more')).toBeTruthy()

      const dashboardButton = queryByText('Go to dashboard')
      expect(dashboardButton).toBeTruthy()

      fireEvent.click(dashboardButton!)

      await waitFor(() => {
        expect(mockClose).toHaveBeenCalled()
      })
    })
  })
  describe('widget', () => {
    it('should render executable recovery state correctly', () => {
      mockUseRecoveryTxState.mockReturnValue({
        isExecutable: true,
        remainingSeconds: 0,
      } as any)

      const { queryByText } = render(
        <RecoveryInProgress variant="widget" recovery={{ validFrom: BigNumber.from(0) } as RecoveryQueueItem} />,
      )

      ;['days', 'hrs', 'mins'].forEach((unit) => {
        expect(queryByText(unit)).toBeFalsy()
      })
      expect(queryByText('Go to dashboard')).toBeFalsy()

      expect(queryByText('Account recovery possible')).toBeTruthy()
      expect(queryByText('Learn more')).toBeTruthy()
    })

    it('should render non-executable recovery state correctly', () => {
      mockUseRecoveryTxState.mockReturnValue({
        isExecutable: false,
        remainingSeconds: 420 * 69 * 1337,
      } as any)

      const { queryByText } = render(
        <RecoveryInProgress variant="widget" recovery={{ validFrom: BigNumber.from(0) } as RecoveryQueueItem} />,
      )

      expect(queryByText('Go to dashboard')).toBeFalsy()

      expect(queryByText('Account recovery in progress')).toBeTruthy()
      expect(queryByText('The recovery process has started. This Account will be ready to recover in:')).toBeTruthy()
      ;['days', 'hrs', 'mins'].forEach((unit) => {
        expect(queryByText(unit)).toBeTruthy()
      })
      expect(queryByText('Learn more')).toBeTruthy()
    })
  })
})
