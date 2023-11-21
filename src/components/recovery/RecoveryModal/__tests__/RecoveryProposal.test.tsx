import { faker } from '@faker-js/faker'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { fireEvent, render } from '@/tests/test-utils'
import { _RecoveryProposal } from '../RecoveryProposal'

describe('RecoveryProposal', () => {
  describe('modal', () => {
    it('should render correctly', () => {
      const mockClose = jest.fn()
      const mockSetTxFlow = jest.fn()

      const { queryByText } = render(
        <_RecoveryProposal
          variant="modal"
          onClose={mockClose}
          safe={{ owners: [{ value: faker.finance.ethereumAddress() }] } as SafeInfo}
          setTxFlow={mockSetTxFlow}
        />,
      )

      expect(queryByText('Recover this Account')).toBeTruthy()
      expect(
        queryByText(
          'The connect wallet was chosen as a trusted guardian. You can help the owner regain access by updating the owner list.',
        ),
      ).toBeTruthy()
      expect(queryByText('Learn more')).toBeTruthy()

      const recoveryButton = queryByText('Start recovery')
      expect(recoveryButton).toBeTruthy()

      fireEvent.click(recoveryButton!)

      expect(mockClose).toHaveBeenCalled()
      expect(mockSetTxFlow).toHaveBeenCalled()
    })
  })
  describe('widget', () => {})
  it('should render correctly', () => {
    const mockSetTxFlow = jest.fn()

    const { queryByText } = render(
      <_RecoveryProposal
        variant="widget"
        safe={{ owners: [{ value: faker.finance.ethereumAddress() }] } as SafeInfo}
        setTxFlow={mockSetTxFlow}
      />,
    )

    expect(queryByText('Recover this Account')).toBeTruthy()
    expect(
      queryByText(
        'The connect wallet was chosen as a trusted guardian. You can help the owner regain access by updating the owner list.',
      ),
    ).toBeTruthy()
    expect(queryByText('Learn more')).toBeTruthy()

    const recoveryButton = queryByText('Start recovery')
    expect(recoveryButton).toBeTruthy()

    fireEvent.click(recoveryButton!)

    expect(mockSetTxFlow).toHaveBeenCalled()
  })
})
