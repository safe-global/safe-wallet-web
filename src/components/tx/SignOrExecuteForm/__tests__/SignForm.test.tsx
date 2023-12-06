import * as hooks from '@/components/tx/SignOrExecuteForm/hooks'
import { SignForm } from '@/components/tx/SignOrExecuteForm/SignForm'
import { render } from '@/tests/test-utils'

describe('SignForm', () => {
  it('displays a warning if connected wallet already signed the tx', () => {
    jest.spyOn(hooks, 'useAlreadySigned').mockReturnValue(true)

    const { getByText } = render(<SignForm onSubmit={jest.fn()} isOwner={true} />)

    expect(getByText('You have already signed this transaction.')).toBeInTheDocument()
  })

  it('does not display a warning if connected wallet has not signed the tx yet', () => {
    jest.spyOn(hooks, 'useAlreadySigned').mockReturnValue(false)

    const { queryByText } = render(<SignForm onSubmit={jest.fn()} isOwner={true} />)

    expect(queryByText('You have already signed this transaction.')).not.toBeInTheDocument()
  })

  it('shows a non-owner error', () => {
    jest.spyOn(hooks, 'useAlreadySigned').mockReturnValue(false)

    const { queryByText } = render(<SignForm onSubmit={jest.fn()} isOwner={false} />)

    expect(
      queryByText(
        'You are currently not an owner of this Safe Account and won&apos;t be able to submit this transaction.',
      ),
    ).not.toBeInTheDocument()
  })
})
