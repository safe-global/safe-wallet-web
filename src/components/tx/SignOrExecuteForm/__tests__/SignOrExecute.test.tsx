import SignOrExecute from '../index'
import { render } from '@/tests/test-utils'
import * as hooks from '../hooks'
import { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

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

  it('should display a confirmation screen', () => {
    jest.spyOn(hooks, 'useTxDetails').mockReturnValue([{} as TransactionDetails, undefined, false])

    const { container, getByTestId } = render(
      <SignOrExecute onSubmit={jest.fn()} safeTxError={undefined} isExecutable={true} chainId="1" />,
    )

    expect(getByTestId('sign-btn')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
