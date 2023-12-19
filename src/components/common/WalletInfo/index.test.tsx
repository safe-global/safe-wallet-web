import { render } from '@/tests/test-utils'
import { WalletInfo } from '@/components/common/WalletInfo/index'
import { type EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'
import { type NextRouter } from 'next/router'
import * as mpcModule from '@/services/mpc/SocialLoginModule'
import * as constants from '@/config/constants'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import { act } from '@testing-library/react'
import SocialWalletService from '@/services/mpc/SocialWalletService'
import type { ISocialWalletService } from '@/services/mpc/interfaces'

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

jest.mock('@/services/mpc/SocialWalletService')

describe('WalletInfo', () => {
  let socialWalletService: ISocialWalletService
  beforeEach(() => {
    jest.resetAllMocks()
    socialWalletService = new SocialWalletService({} as unknown as Web3AuthMPCCoreKit)
  })

  it('should display the wallet address', () => {
    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        socialWalletService={socialWalletService}
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
        socialWalletService={socialWalletService}
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
        socialWalletService={socialWalletService}
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

  it('should display a Delete Account button on dev for social login', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(true)
    jest.spyOn(constants, 'IS_PRODUCTION', 'get').mockImplementation(() => false)

    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        socialWalletService={socialWalletService}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
        balance={undefined}
        currentChainId="1"
      />,
    )

    expect(getByText('Delete account')).toBeInTheDocument()
  })

  it('should not display a Delete Account on prod', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(true)
    jest.spyOn(constants, 'IS_PRODUCTION', 'get').mockImplementation(() => true)

    const { queryByText } = render(
      <WalletInfo
        wallet={mockWallet}
        socialWalletService={socialWalletService}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
        balance={undefined}
        currentChainId="1"
      />,
    )

    expect(queryByText('Delete account')).not.toBeInTheDocument()
  })

  it('should not display a Delete Account if not social login', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(false)
    jest.spyOn(constants, 'IS_PRODUCTION', 'get').mockImplementation(() => false)

    const { queryByText } = render(
      <WalletInfo
        wallet={mockWallet}
        socialWalletService={socialWalletService}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
        balance={undefined}
        currentChainId="1"
      />,
    )

    expect(queryByText('Delete account')).not.toBeInTheDocument()
  })

  it('should display an enable mfa button if mfa is not enabled', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(true)

    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        socialWalletService={socialWalletService}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
        balance={undefined}
        currentChainId="1"
      />,
    )

    expect(getByText('Add multifactor authentication')).toBeInTheDocument()
  })

  it('should not display an enable mfa button if mfa is already enabled', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(true)

    // Mock that MFA is enabled
    socialWalletService.enableMFA('', '')

    const { queryByText } = render(
      <WalletInfo
        wallet={mockWallet}
        socialWalletService={socialWalletService}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
        balance={undefined}
        currentChainId="1"
      />,
    )

    expect(queryByText('Add multifactor authentication')).not.toBeInTheDocument()
  })
})
