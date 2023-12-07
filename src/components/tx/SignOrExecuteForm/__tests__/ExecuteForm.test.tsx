import { ExecuteForm } from '@/components/tx/SignOrExecuteForm/ExecuteForm'
import * as useWalletCanRelay from '@/hooks/useWalletCanRelay'
import * as relayUtils from '@/utils/relaying'
import { render } from '@/tests/test-utils'

describe('ExecuteForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows estimated fees', () => {
    const { getByText } = render(
      <ExecuteForm
        onSubmit={jest.fn()}
        isOwner={true}
        isExecutionLoop={false}
        relays={[undefined, undefined, false]}
      />,
    )

    expect(getByText('Estimated fee')).toBeInTheDocument()
  })

  it('shows a non-owner error if the transaction still needs signatures and its not an owner', () => {
    const { getByText } = render(
      <ExecuteForm
        onSubmit={jest.fn()}
        isOwner={false}
        isExecutionLoop={false}
        onlyExecute={false}
        relays={[undefined, undefined, false]}
      />,
    )

    expect(
      getByText("You are currently not an owner of this Safe Account and won't be able to submit this transaction."),
    ).toBeInTheDocument()
  })

  it('does not show a non-owner error if the transaction is fully signed and its not an owner', () => {
    const { queryByText } = render(
      <ExecuteForm
        onSubmit={jest.fn()}
        isOwner={false}
        isExecutionLoop={false}
        onlyExecute={true}
        relays={[undefined, undefined, false]}
      />,
    )

    expect(
      queryByText("You are currently not an owner of this Safe Account and won't be able to submit this transaction."),
    ).not.toBeInTheDocument()
  })

  it('shows an error if the same safe tries to execute', () => {
    const { getByText } = render(
      <ExecuteForm onSubmit={jest.fn()} isOwner={true} isExecutionLoop={true} relays={[undefined, undefined, false]} />,
    )

    expect(
      getByText('Cannot execute a transaction from the Safe Account itself, please connect a different account.'),
    ).toBeInTheDocument()
  })

  it('shows a relaying option if relaying is enabled', () => {
    jest.spyOn(useWalletCanRelay, 'default').mockReturnValue([true, undefined, false])
    jest.spyOn(relayUtils, 'hasRemainingRelays').mockReturnValue(true)

    const { getByText } = render(
      <ExecuteForm onSubmit={jest.fn()} isOwner={true} isExecutionLoop={true} relays={[undefined, undefined, false]} />,
    )

    expect(getByText('Choose execution method:')).toBeInTheDocument()
  })
})
