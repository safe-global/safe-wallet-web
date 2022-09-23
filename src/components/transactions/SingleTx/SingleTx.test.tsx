import { act, render } from '@/tests/test-utils'
import SingleTx from '@/pages/transactions/tx'
import * as useSafeInfo from '@/hooks/useSafeInfo'
import { SafeInfo, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'

const SAFE_ADDRESS = 'rin:0x87a57cBf742CC1Fc702D0E9BF595b1E056693e2f'

jest.mock('next/router', () => ({
  useRouter() {
    return {
      query: {
        id: 'multisig_0x87a57cBf742CC1Fc702D0E9BF595b1E056693e2f_0x236da79434c398bf98b204e6f3d93d',
      },
    }
  },
}))

jest.mock('@gnosis.pm/safe-react-gateway-sdk', () => ({
  ...jest.requireActual('@gnosis.pm/safe-react-gateway-sdk'),
  getTransactionDetails: jest.fn(() => Promise.resolve(txDetails)),
}))

jest.spyOn(useSafeInfo, 'default').mockImplementation(() => ({
  safeAddress: SAFE_ADDRESS,
  safe: {} as SafeInfo,
  safeError: undefined,
  safeLoading: false,
  safeLoaded: true,
}))

// Minimum mock to render <SingleTx />
const txDetails = {
  safeAddress: SAFE_ADDRESS,
  txInfo: {
    type: 'Custom',
    to: {
      value: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    },
  },
} as TransactionDetails

describe('SingleTx', () => {
  it('renders <SingleTx />', async () => {
    const { getByTestId } = render(<SingleTx />)

    await act(() => Promise.resolve())

    expect(getByTestId('single-tx')).toBeInTheDocument()
  })
})
