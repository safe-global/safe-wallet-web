import { render } from '@/tests/test-utils'
import { WalletInfo } from '@/components/common/WalletInfo/index'
import { type EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'
import { type NextRouter } from 'next/router'
import { act } from '@testing-library/react'
import { setSafeAuthPack, _getSafeAuthPackInstance } from '@/features/socialwallet/hooks/useSafeAuth'
import type { SafeAuthUserInfo, SafeAuthPack } from '@safe-global/auth-kit'

const mockWallet = {
  address: '0x1234567890123456789012345678901234567890',
  chainId: '5',
  label: '',
  provider: null as unknown as EIP1193Provider,
}

const mockRouter = {
  query: {},
  pathname: '',
} as NextRouter

const mockOnboard = {
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  setChain: jest.fn(),
} as unknown as OnboardAPI

describe('WalletInfo', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    const mockSafeAuthPack = {
      signIn: jest.fn(),
      isAuthenticated: false,
      init: jest.fn(),
      getProvider: jest.fn(),
      signOut: jest.fn(),
      getUserInfo: jest.fn().mockResolvedValue({
        profileImage: 'some/url',
        email: 'test@testermann.com',
        name: 'Test Testermann',
      } as SafeAuthUserInfo),
      destroy: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getSafes: jest.fn(),
      getAddress: jest.fn(),
      getChainId: jest.fn(),
    } as unknown as SafeAuthPack
    setSafeAuthPack(mockSafeAuthPack)
    const mockOnLogin = jest.fn()
  })

  it('should display the wallet address', () => {
    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        safeAuthPack={_getSafeAuthPackInstance()}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
        balance={undefined}
        currentChainId="1"
      />,
    )

    expect(getByText('0x1234...7890')).toBeInTheDocument()
  })

  it('should display a switch wallet button', () => {
    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        safeAuthPack={_getSafeAuthPackInstance()}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
        balance={undefined}
        currentChainId="1"
      />,
    )

    expect(getByText('Switch wallet')).toBeInTheDocument()
  })

  it('should disconnect the wallet when the button is clicked', () => {
    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        safeAuthPack={_getSafeAuthPackInstance()}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
        balance={undefined}
        currentChainId="1"
      />,
    )

    const disconnectButton = getByText('Disconnect')

    expect(disconnectButton).toBeInTheDocument()

    act(() => {
      disconnectButton.click()
    })

    expect(mockOnboard.disconnectWallet).toHaveBeenCalled()
  })
})
