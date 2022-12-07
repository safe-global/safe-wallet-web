import { hexlify, hexZeroPad, toUtf8Bytes } from 'ethers/lib/utils'
import type { SafeInfo, SafeMessage } from '@gnosis.pm/safe-react-gateway-sdk'

import MsgModal from '@/components/safeMessages/MsgModal'
import * as useIsWrongChainHook from '@/hooks/useIsWrongChain'
import * as useIsSafeOwnerHook from '@/hooks/useIsSafeOwner'
import * as useWalletHook from '@/hooks/wallets/useWallet'
import * as useSafeInfoHook from '@/hooks/useSafeInfo'
import * as useAsyncHook from '@/hooks/useAsync'
import * as sender from '@/services/safe-messages/safeMsgSender'
import { render, act, fireEvent, waitFor } from '@/tests/test-utils'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'

jest.mock('@gnosis.pm/safe-react-gateway-sdk', () => ({
  ...jest.requireActual('@gnosis.pm/safe-react-gateway-sdk'),
  getSafeMessage: jest.fn(),
}))

describe('MsgModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(useSafeInfoHook, 'default').mockImplementation(() => ({
      safe: {
        address: {
          value: hexZeroPad('0x1', 20),
        },
        chainId: '5',
      } as SafeInfo,
      safeAddress: hexZeroPad('0x1', 20),
      safeError: undefined,
      safeLoading: false,
      safeLoaded: true,
    }))
  })

  it('renders the (decoded) message', () => {
    const { getByText } = render(
      <MsgModal
        requestId="123"
        logoUri="www.fake.com/test.png"
        name="Test App"
        message={hexlify(toUtf8Bytes('Hello world!'))}
        onClose={jest.fn}
      />,
    )

    expect(getByText('Hello world!')).toBeInTheDocument()
  })

  it('renders the message hash', () => {
    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        messageHash="0x123"
        onClose={jest.fn}
      />,
    )

    expect(getByText('0x123')).toBeInTheDocument()
  })

  it('generates the message hash if not provided', () => {
    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        requestId="123"
        onClose={jest.fn}
      />,
    )

    expect(getByText('0x73d0948ac608c5d00a6dd26dd396cce79b459307ea365f5a5bd5d3119c2d9708')).toBeInTheDocument()
  })

  it.todo('displays the SafeMessage.message')

  it('proposes a message if not already proposed', async () => {
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => true)

    jest.spyOn(useAsyncHook, 'default').mockReturnValue([undefined, new Error('SafeMessage not found'), false])

    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        requestId="123"
        onClose={jest.fn}
        safeAppId={25}
      />,
    )

    const proposalSpy = jest.spyOn(sender, 'dispatchSafeMsgProposal')

    const button = getByText('Sign')

    await act(() => {
      fireEvent.click(button)
    })

    expect(proposalSpy).toHaveBeenCalledWith(
      {
        address: {
          value: hexZeroPad('0x1', 20),
        },
        chainId: '5',
      } as SafeInfo,
      'Hello world!',
      '123',
      25,
    )
  })

  it('confirms the message if already proposed', async () => {
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => true)
    jest.spyOn(useWalletHook, 'default').mockImplementation(
      () =>
        ({
          address: hexZeroPad('0x2', 20),
        } as ConnectedWallet),
    )

    jest
      .spyOn(useAsyncHook, 'default')
      .mockReturnValue([
        { confirmations: [] as SafeMessage['confirmations'] } as SafeMessage,
        new Error('SafeMessage not found'),
        false,
      ])

    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        messageHash="0x123"
        requestId="123"
        onClose={jest.fn}
      />,
    )

    await act(async () => {
      Promise.resolve()
    })

    const confirmationSpy = jest.spyOn(sender, 'dispatchSafeMsgConfirmation')

    const button = getByText('Sign')

    await act(() => {
      fireEvent.click(button)
    })

    expect(confirmationSpy).toHaveBeenCalledWith(
      {
        address: {
          value: hexZeroPad('0x1', 20),
        },
        chainId: '5',
      } as SafeInfo,
      'Hello world!',
      '123',
    )
  })

  it('displays an error if connected to the wrong chain', () => {
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => true)

    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        requestId="123"
        onClose={jest.fn}
        safeAppId={25}
      />,
    )

    expect(getByText('Your wallet is connected to the wrong chain.')).toBeInTheDocument()

    expect(getByText('Sign')).toBeDisabled()
  })

  it('displays an error if not an owner', () => {
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => false)

    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        requestId="123"
        onClose={jest.fn}
        safeAppId={25}
      />,
    )

    expect(
      getByText("You are currently not an owner of this Safe and won't be able to confirm this message."),
    ).toBeInTheDocument()

    expect(getByText('Sign')).toBeDisabled()
  })

  it('displays an error if the message has already been signed', async () => {
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => true)
    jest.spyOn(useWalletHook, 'default').mockImplementation(
      () =>
        ({
          address: hexZeroPad('0x2', 20),
        } as ConnectedWallet),
    )

    jest.spyOn(useAsyncHook, 'default').mockReturnValue([
      {
        confirmations: [
          {
            owner: {
              value: hexZeroPad('0x2', 20),
            },
          },
        ],
      } as SafeMessage,
      new Error('SafeMessage not found'),
      false,
    ])

    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        requestId="123"
        onClose={jest.fn}
        safeAppId={25}
      />,
    )

    await waitFor(() => {
      expect(getByText('Your connected wallet has already signed this message.')).toBeInTheDocument()

      expect(getByText('Sign')).toBeDisabled()
    })
  })

  it('displays an error if the message could not be proposed', async () => {
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => true)

    jest.spyOn(useAsyncHook, 'default').mockReturnValue([undefined, new Error('SafeMessage not found'), false])

    const proposalSpy = jest
      .spyOn(sender, 'dispatchSafeMsgProposal')
      .mockImplementation(() => Promise.reject(new Error('Test error')))

    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        requestId="123"
        onClose={jest.fn}
        safeAppId={25}
      />,
    )

    const button = getByText('Sign')

    await act(() => {
      fireEvent.click(button)
    })

    expect(proposalSpy).toHaveBeenCalled()

    await waitFor(() => {
      expect(getByText('Error confirming the message. Please try again.')).toBeInTheDocument()
    })
  })

  it('displays an error if the message could not be confirmed', async () => {
    jest.spyOn(useIsWrongChainHook, 'default').mockImplementation(() => false)
    jest.spyOn(useIsSafeOwnerHook, 'default').mockImplementation(() => true)

    jest
      .spyOn(useAsyncHook, 'default')
      .mockReturnValue([
        { confirmations: [] as SafeMessage['confirmations'] } as SafeMessage,
        new Error('SafeMessage not found'),
        false,
      ])

    const confirmationSpy = jest
      .spyOn(sender, 'dispatchSafeMsgConfirmation')
      .mockImplementation(() => Promise.reject(new Error('Test error')))

    const { getByText } = render(
      <MsgModal
        logoUri="www.fake.com/test.png"
        name="Test App"
        message="Hello world!"
        requestId="123"
        onClose={jest.fn}
        safeAppId={25}
      />,
    )

    const button = getByText('Sign')

    await act(() => {
      fireEvent.click(button)
    })

    expect(confirmationSpy).toHaveBeenCalled()

    await waitFor(() => {
      expect(getByText('Error confirming the message. Please try again.')).toBeInTheDocument()
    })
  })
})
