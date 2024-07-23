import { SignOrExecuteForm } from '@/components/tx/SignOrExecuteForm'
import * as hooks from '@/components/tx/SignOrExecuteForm/hooks'
import * as execThroughRoleHooks from '@/components/tx/SignOrExecuteForm/ExecuteThroughRoleForm/hooks'
import { safeTxBuilder } from '@/tests/builders/safeTx'
import { render } from '@/tests/test-utils'
import { fireEvent } from '@testing-library/react'
import { encodeBytes32String } from 'ethers'
import { Status } from 'zodiac-roles-deployments'

let isSafeOwner = true
// mock useIsSafeOwner
jest.mock('@/hooks/useIsSafeOwner', () => ({
  __esModule: true,
  default: jest.fn(() => isSafeOwner),
}))

describe('SignOrExecute', () => {
  beforeEach(() => {
    isSafeOwner = true
  })

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

    it('should offer to execute through a role if the user is a role member and the transaction is executable through the role', () => {
      jest.spyOn(execThroughRoleHooks, 'useRoles').mockReturnValue([TEST_ROLE_OK])
      jest.spyOn(hooks, 'useValidateNonce').mockReturnValue(true)
      jest.spyOn(hooks, 'useImmediatelyExecutable').mockReturnValue(false)

      const { queryByTestId } = render(
        <SignOrExecuteForm
          safeTx={safeTxBuilder().build()}
          onSubmit={jest.fn()}
          safeTxError={undefined}
          txId={undefined}
          onlyExecute={true}
          isExecutable={false}
          chainId="1"
        />,
      )

      expect(queryByTestId('execute-through-role-form-btn')).toBeInTheDocument()
    })

    it('should not offer to execute through a role if the user is a safe owner and role member but the role lacks permissions', () => {
      jest.spyOn(execThroughRoleHooks, 'useRoles').mockReturnValue([TEST_ROLE_TARGET_NOT_ALLOWED])
      jest.spyOn(hooks, 'useValidateNonce').mockReturnValue(true)
      jest.spyOn(hooks, 'useImmediatelyExecutable').mockReturnValue(false)
      isSafeOwner = true

      const { queryByTestId } = render(
        <SignOrExecuteForm
          safeTx={safeTxBuilder().build()}
          onSubmit={jest.fn()}
          safeTxError={undefined}
          txId={undefined}
          onlyExecute={true}
          isExecutable={false}
          chainId="1"
        />,
      )

      expect(queryByTestId('execute-through-role-form-btn')).not.toBeInTheDocument()
    })

    it('should offer to execute through a role if the user is a role member but not a safe owner, even if the role lacks permissions', () => {
      jest.spyOn(execThroughRoleHooks, 'useRoles').mockReturnValue([TEST_ROLE_TARGET_NOT_ALLOWED])
      jest.spyOn(hooks, 'useValidateNonce').mockReturnValue(true)
      jest.spyOn(hooks, 'useImmediatelyExecutable').mockReturnValue(false)
      isSafeOwner = false

      const { queryByTestId } = render(
        <SignOrExecuteForm
          safeTx={safeTxBuilder().build()}
          onSubmit={jest.fn()}
          safeTxError={undefined}
          txId={undefined}
          onlyExecute={true}
          isExecutable={false}
          chainId="1"
        />,
      )

      expect(queryByTestId('execute-through-role-form-btn')).toBeInTheDocument()
    })

    it('should not offer to execute through a role if the transaction can also be directly executed without going through the role', () => {
      jest.spyOn(execThroughRoleHooks, 'useRoles').mockReturnValue([TEST_ROLE_OK])
      jest.spyOn(hooks, 'useValidateNonce').mockReturnValue(true)

      const { queryByTestId } = render(
        <SignOrExecuteForm
          safeTx={safeTxBuilder().build()}
          onSubmit={jest.fn()}
          safeTxError={undefined}
          txId={undefined}
          onlyExecute={true}
          isExecutable={true}
          chainId="1"
        />,
      )

      expect(queryByTestId('execute-through-role-form-btn')).not.toBeInTheDocument()
    })
  })

  it('should not display radio options if execution is the only option', () => {
    jest.spyOn(execThroughRoleHooks, 'useRoles').mockReturnValue([])

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

const ROLES_MOD_ADDRESS = '0x1234567890000000000000000000000000000000'
const ROLE_KEY = encodeBytes32String('eth_wrapping')

const TEST_ROLE_OK: execThroughRoleHooks.Role = {
  modAddress: ROLES_MOD_ADDRESS,
  roleKey: ROLE_KEY as `0x${string}`,
  multiSend: '0x9641d764fc13c8b624c04430c7356c1c7c8102e2',
  status: Status.Ok,
}

const TEST_ROLE_TARGET_NOT_ALLOWED: execThroughRoleHooks.Role = {
  modAddress: ROLES_MOD_ADDRESS,
  roleKey: ROLE_KEY as `0x${string}`,
  multiSend: '0x9641d764fc13c8b624c04430c7356c1c7c8102e2',
  status: Status.TargetAddressNotAllowed,
}
