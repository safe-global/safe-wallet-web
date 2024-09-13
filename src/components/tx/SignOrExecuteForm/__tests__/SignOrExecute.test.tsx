import SignOrExecute from '../index'
import { render, waitFor } from '@/tests/test-utils'
import * as hooks from '../hooks'
import { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { createSafeTx } from '@/tests/builders/safeTx'
import { act } from 'react-dom/test-utils'

let isSafeOwner = true
// mock useIsSafeOwner
jest.mock('@/hooks/useIsSafeOwner', () => ({
  __esModule: true,
  default: jest.fn(() => isSafeOwner),
}))

describe('SignOrExecute', () => {
  beforeEach(() => {
    isSafeOwner = true
    jest.clearAllMocks()
  })

  it('should display a loading component', () => {
    const { container } = render(
      <SignOrExecute onSubmit={jest.fn()} safeTxError={undefined} isExecutable={true} chainId="1" />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should display a confirmation screen', async () => {
    jest.spyOn(hooks, 'useTxDetails').mockReturnValue([{} as TransactionDetails, undefined, false])

    const { container, getByTestId } = render(
      <SafeTxContext.Provider
        value={{
          safeTx: createSafeTx(),
        }}
      >
        <SignOrExecute onSubmit={jest.fn()} isExecutable={true} />
      </SafeTxContext.Provider>,
    )

    expect(getByTestId('sign-btn')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
