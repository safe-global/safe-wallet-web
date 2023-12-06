import { TokenTransferType } from '@/components/tx-flow/flows/TokenTransfer'
import { CreateTokenTransfer } from '@/components/tx-flow/flows/TokenTransfer/CreateTokenTransfer'
import { render } from '@/tests/test-utils'
import { faker } from '@faker-js/faker'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { fireEvent, waitFor } from '@testing-library/react'

describe('CreateTokenTransfer', () => {
  const mockParams = {
    recipient: '',
    tokenAddress: ZERO_ADDRESS,
    amount: '',
    type: TokenTransferType.multiSig,
  }

  it('should display a token amount input', () => {
    const { getByText } = render(
      <CreateTokenTransfer params={mockParams} onSubmit={jest.fn()} addressBook={{}} isSafeTokenPaused={true} />,
    )

    expect(getByText('Amount')).toBeInTheDocument()
  })

  it('should display a read-only field if recipient is in address book', () => {
    const mockAddress = faker.finance.ethereumAddress()
    const mockAddressBook = { [mockAddress]: 'Test address' }

    const { getAllByText } = render(
      <CreateTokenTransfer
        params={{ ...mockParams, recipient: mockAddress }}
        onSubmit={jest.fn()}
        addressBook={mockAddressBook}
        isSafeTokenPaused={true}
      />,
    )

    expect(getAllByText('Sending to')[0]).toBeInTheDocument()
  })

  it('should display an input field if the read-only field was clicked', () => {
    const mockAddress = faker.finance.ethereumAddress()
    const mockAddressBook = { [mockAddress]: 'Test address' }

    const { getByTestId, getAllByText } = render(
      <CreateTokenTransfer
        params={{ ...mockParams, recipient: mockAddress }}
        onSubmit={jest.fn()}
        addressBook={mockAddressBook}
        isSafeTokenPaused={true}
      />,
    )

    expect(getAllByText('Sending to')[0]).toBeInTheDocument()

    fireEvent.click(getByTestId('address-book-recipient'))

    expect(getAllByText('Recipient address or ENS')[0]).toBeInTheDocument()
  })

  it('should disable the submit button and display a warning if $SAFE token is selected and not transferable', () => {
    const { getByText } = render(
      <CreateTokenTransfer
        params={{ ...mockParams, tokenAddress: '0x2' }}
        onSubmit={jest.fn()}
        addressBook={{}}
        safeTokenAddress="0x2"
        isSafeTokenPaused={true}
      />,
    )

    const button = getByText('Next')

    expect(getByText('$SAFE is currently non-transferable.')).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it.todo('should display a type selection if a spending limit token is selected')
  it.todo('should not display a type selection if there is a txNonce')
})
