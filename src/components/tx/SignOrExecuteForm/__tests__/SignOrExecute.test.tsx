import { SignOrExecuteForm } from '@/components/tx/SignOrExecuteForm'
import * as hooks from '@/components/tx/SignOrExecuteForm/hooks'
import { safeTxBuilder } from '@/tests/builders/safeTx'
import { render } from '@/tests/test-utils'
import { fireEvent } from '@testing-library/react'

describe('SignOrExecute', () => {
  it('should display a safeTxError', () => {
    const { getByText } = render(
      <SignOrExecuteForm
        onSubmit={jest.fn()}
        safeTxError={new Error('Safe transaction error')}
        safeTx={safeTxBuilder().build()}
        chainId="1"
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
          chainId="1"
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
          chainId="1"
        />,
      )

      expect(getByText('Would you like to execute the transaction immediately?')).toBeInTheDocument()
    })
  })

  it('should not display radio options if execution is the only option', () => {
    const { queryByText } = render(
      <SignOrExecuteForm
        safeTx={safeTxBuilder().build()}
        onSubmit={jest.fn()}
        safeTxError={undefined}
        txId={undefined}
        onlyExecute={true}
        chainId="1"
      />,
    )

    expect(queryByText('Would you like to execute the transaction immediately?')).not.toBeInTheDocument()
  })

  it('should display a sign/execute title if that option is selected', () => {
    jest.spyOn(hooks, 'useValidateNonce').mockReturnValue(true)

    const { getByTestId, getByText } = render(
      <SignOrExecuteForm
        safeTx={safeTxBuilder().build()}
        onSubmit={jest.fn()}
        safeTxError={undefined}
        txId="someid"
        isExecutable={true}
        chainId="1"
      />,
    )

    expect(getByText('Would you like to execute the transaction immediately?')).toBeInTheDocument()

    const executeCheckbox = getByTestId('execute-checkbox')
    const signCheckbox = getByTestId('sign-checkbox')

    expect(getByText("You're about to execute this transaction.")).toBeInTheDocument()

    fireEvent.click(signCheckbox)

    expect(getByText("You're about to confirm this transaction.")).toBeInTheDocument()

    fireEvent.click(executeCheckbox)

    expect(getByText("You're about to execute this transaction.")).toBeInTheDocument()
  })

  it('should not display safeTxError message for valid transactions', () => {
    const { queryByText } = render(
      <SignOrExecuteForm safeTx={safeTxBuilder().build()} onSubmit={jest.fn()} safeTxError={undefined} chainId="1" />,
    )

    expect(
      queryByText('This transaction will most likely fail. To save gas costs, avoid confirming the transaction.'),
    ).not.toBeInTheDocument()
  })
})
