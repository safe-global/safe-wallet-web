import { fireEvent, render } from '@/tests/test-utils'
import { PasswordRecovery } from '@/components/common/SocialSigner/PasswordRecovery'
import { act, waitFor } from '@testing-library/react'

describe('PasswordRecovery', () => {
  it('displays an error if password is wrong', async () => {
    const mockRecoverWithPassword = jest.fn(() => Promise.reject())
    const mockOnSuccess = jest.fn()

    const { getByText, getByLabelText } = render(
      <PasswordRecovery recoverFactorWithPassword={mockRecoverWithPassword} onSuccess={mockOnSuccess} />,
    )

    const passwordField = getByLabelText('Recovery password')
    const submitButton = getByText('Submit')

    act(() => {
      fireEvent.change(passwordField, { target: { value: 'somethingwrong' } })
      submitButton.click()
    })

    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(getByText('Incorrect password')).toBeInTheDocument()
    })
  })

  it('calls onSuccess if password is correct', async () => {
    const mockRecoverWithPassword = jest.fn(() => Promise.resolve())
    const mockOnSuccess = jest.fn()

    const { getByText, getByLabelText } = render(
      <PasswordRecovery recoverFactorWithPassword={mockRecoverWithPassword} onSuccess={mockOnSuccess} />,
    )

    const passwordField = getByLabelText('Recovery password')
    const submitButton = getByText('Submit')

    act(() => {
      fireEvent.change(passwordField, { target: { value: 'somethingCorrect' } })
      submitButton.click()
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })
})
