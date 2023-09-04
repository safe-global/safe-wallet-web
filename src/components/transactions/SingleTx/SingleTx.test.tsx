import { fireEvent, render } from '@/tests/test-utils'
import SingleTx from '@/pages/transactions/tx'
import * as useSafeInfo from '@/hooks/useSafeInfo'
import type { SafeInfo, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

const MOCK_SAFE_ADDRESS = '0x0000000000000000000000000000000000005AFE'
const SAFE_ADDRESS = '0x87a57cBf742CC1Fc702D0E9BF595b1E056693e2f'

// Minimum mock to render <SingleTx />
const txDetails = {
  txId: 'multisig_0x87a57cBf742CC1Fc702D0E9BF595b1E056693e2f_0x236da79434c398bf98b204e6f3d93d',
  safeAddress: SAFE_ADDRESS,
  txInfo: {
    type: 'Custom',
    to: {
      value: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    },
  },
} as TransactionDetails

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/transactions/tx',
      query: {
        safe: `gor:${SAFE_ADDRESS}`,
        id: 'multisig_0x87a57cBf742CC1Fc702D0E9BF595b1E056693e2f_0x236da79434c398bf98b204e6f3d93d',
      },
    }
  },
}))

jest.mock('@safe-global/safe-gateway-typescript-sdk', () => ({
  ...jest.requireActual('@safe-global/safe-gateway-typescript-sdk'),
  getTransactionDetails: jest.fn(() => Promise.resolve(txDetails)),
}))

jest.spyOn(useSafeInfo, 'default').mockImplementation(() => ({
  safeAddress: SAFE_ADDRESS,
  safe: {
    chainId: '5',
  } as SafeInfo,
  safeError: undefined,
  safeLoading: false,
  safeLoaded: true,
}))

describe('SingleTx', () => {
  it('renders <SingleTx />', async () => {
    const screen = render(<SingleTx />)

    const button = screen.queryByText('Details')
    expect(button).not.toBeInTheDocument()

    expect(await screen.findByText('Contract interaction')).toBeInTheDocument()
  })

  it('shows an error when the transaction has failed to load', async () => {
    const getTransactionDetails = jest.spyOn(
      require('@safe-global/safe-gateway-typescript-sdk'),
      'getTransactionDetails',
    )
    getTransactionDetails.mockImplementation(() => Promise.reject(new Error('Server error')))

    const screen = render(<SingleTx />)

    expect(await screen.findByText('Failed to load transaction')).toBeInTheDocument()

    const button = screen.getByText('Details')
    fireEvent.click(button!)

    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('shows an error when transaction is not from the opened Safe', async () => {
    const getTransactionDetails = jest.spyOn(
      require('@safe-global/safe-gateway-typescript-sdk'),
      'getTransactionDetails',
    )
    getTransactionDetails.mockImplementation(() =>
      Promise.resolve({
        ...txDetails,
        safeAddress: MOCK_SAFE_ADDRESS,
      }),
    )

    const screen = render(<SingleTx />)

    expect(await screen.findByText('Failed to load transaction')).toBeInTheDocument()

    const button = screen.getByText('Details')
    fireEvent.click(button!)

    expect(screen.getByText('Transaction with this id was not found in this Safe Account')).toBeInTheDocument()
  })
})
