import { SignOrExecuteForm } from '@/components/tx/SignOrExecuteForm'
import { safeTxBuilder } from '@/tests/builders/safeTx'
import { render } from '@/tests/test-utils'

describe('SignOrExecute', () => {
  it('should display a safeTxError', () => {
    const { getByText } = render(
      <SignOrExecuteForm
        onSubmit={jest.fn()}
        safeTxError={new Error('Safe transaction error')}
        safeTx={safeTxBuilder().build()}
      />,
    )

    expect(
      getByText('This transaction will most likely fail. To save gas costs, avoid confirming the transaction.'),
    ).toBeInTheDocument()
  })
})
