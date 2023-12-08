import { SignOrExecuteForm } from '@/components/tx/SignOrExecuteForm'
import * as hooks from '@/components/tx/SignOrExecuteForm/hooks'
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

  describe('Existing transaction', () => {
    it('should display radio options to sign or execute if both are possible', () => {
      jest.spyOn(hooks, 'useValidateNonce').mockReturnValue(true)

      const { getByText } = render(
        <SignOrExecuteForm
          safeTx={safeTxBuilder().build()}
          onSubmit={jest.fn()}
          safeTxError={undefined}
          isExecutable={true}
        />,
      )

      expect(getByText('Would you like to execute the transaction immediately?')).toBeInTheDocument()
    })
  })

  describe('New transaction', () => {
    it('should display radio options to sign or execute if both are possible', () => {
      jest.spyOn(hooks, 'useValidateNonce').mockReturnValue(true)
      jest.spyOn(hooks, 'useImmediatelyExecutable').mockReturnValue(true)

      const { getByText } = render(
        <SignOrExecuteForm
          safeTx={safeTxBuilder().build()}
          onSubmit={jest.fn()}
          safeTxError={undefined}
          txId={undefined}
          isExecutable={true}
        />,
      )

      expect(getByText('Would you like to execute the transaction immediately?')).toBeInTheDocument()
    })
  })

  it.todo('should not display radio options if execution is the only option')
  it.todo('should display an execution title if that option is selected')
  it.todo('should display a sign title if that option is selected')
})
