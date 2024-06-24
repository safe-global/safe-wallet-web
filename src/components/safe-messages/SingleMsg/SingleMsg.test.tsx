import { extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { fireEvent, render, waitFor } from '@/tests/test-utils'
import * as useSafeInfo from '@/hooks/useSafeInfo'
import * as syncSafeMessageSigner from '@/hooks/messages/useSyncSafeMessageSigner'

import { SafeMessageListItemType, SafeMessageStatus, type SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import SingleMsg from '.'

const SAFE_ADDRESS = '0x87a57cBf742CC1Fc702D0E9BF595b1E056693e2f'
const SAFE_MESSAGE_HASH = '0x32d898a35478c1c2063f76841cd99388e28ddac217e17bf787e2307ba8bf860b'

// Minimum mock to render <SingleMsg />
const msgDetails = {
  type: SafeMessageListItemType.MESSAGE,
  messageHash: '0x123',
  status: SafeMessageStatus.NEEDS_CONFIRMATION,
  logoUri: null,
  name: null,
  message: '',
  creationTimestamp: 1663779409409,
  modifiedTimestamp: 1663779409409,
  confirmationsSubmitted: 1,
  confirmationsRequired: 2,
  proposedBy: { value: SAFE_ADDRESS },
  confirmations: [
    {
      owner: { value: SAFE_ADDRESS },
      signature: '',
    },
  ],
} as SafeMessage

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/transactions/msg',
      query: {
        safe: `sep:${SAFE_ADDRESS}`,
        messageHash: SAFE_MESSAGE_HASH,
      },
    }
  },
}))

const extendedSafeInfo = extendedSafeInfoBuilder().build()

jest.spyOn(useSafeInfo, 'default').mockImplementation(() => ({
  safeAddress: SAFE_ADDRESS,
  safe: {
    ...extendedSafeInfo,
    chainId: '5',
  },
  safeError: undefined,
  safeLoading: false,
  safeLoaded: true,
}))

describe('SingleMsg', () => {
  beforeAll(() => {
    jest.clearAllMocks()
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders <SingleMsg />', async () => {
    jest.spyOn(syncSafeMessageSigner, 'fetchSafeMessage').mockImplementation(() => Promise.resolve(msgDetails))
    const screen = render(<SingleMsg />)
    expect(await screen.findByText('Signature')).toBeInTheDocument()
  })

  it('shows an error when the transaction has failed to load', async () => {
    jest
      .spyOn(syncSafeMessageSigner, 'fetchSafeMessage')
      .mockImplementation(() => Promise.reject(new Error('Server error')))

    const screen = render(<SingleMsg />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load message')).toBeInTheDocument()
    })

    await waitFor(() => {
      fireEvent.click(screen.getByText('Details'))
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })
})
