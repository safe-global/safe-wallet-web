import { act, render, waitFor } from '@/tests/test-utils'

import { SocialSigner, _getSupportedChains } from '@/components/common/SocialSigner'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { COREKIT_STATUS, type UserInfo, type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import SocialWalletService from '@/services/mpc/SocialWalletService'
import { TxModalProvider } from '@/components/tx-flow'
import { fireEvent } from '@testing-library/react'
import { type ISocialWalletService } from '@/services/mpc/interfaces'
import { connectedWalletBuilder } from '@/tests/builders/wallet'
import { chainBuilder } from '@/tests/builders/chains'
import PasswordRecoveryModal from '@/services/mpc/PasswordRecoveryModal'

jest.mock('@/services/mpc/SocialWalletService')

const mockWallet = connectedWalletBuilder().with({ chainId: '5', label: ONBOARD_MPC_MODULE_LABEL }).build()

describe('SocialSignerLogin', () => {
  let mockSocialWalletService: ISocialWalletService

  beforeEach(() => {
    jest.resetAllMocks()

    mockSocialWalletService = new SocialWalletService({} as unknown as Web3AuthMPCCoreKit)
  })

  it('should render continue with connected account when on gnosis chain', async () => {
    const mockOnLogin = jest.fn()

    const result = render(
      <TxModalProvider>
        <SocialSigner socialWalletService={mockSocialWalletService} wallet={mockWallet} onLogin={mockOnLogin} />
        <PasswordRecoveryModal />
      </TxModalProvider>,
    )

    await waitFor(() => {
      expect(result.findByText('Continue as Test Testermann')).resolves.toBeDefined()
    })

    // We do not automatically invoke the callback as the user did not actively connect
    expect(mockOnLogin).not.toHaveBeenCalled()

    const button = await result.findByRole('button')
    button.click()

    expect(mockOnLogin).toHaveBeenCalled()
  })

  it('should render google login button if no wallet is connected on gnosis chain', async () => {
    const mockOnLogin = jest.fn()

    const result = render(
      <TxModalProvider>
        <SocialSigner socialWalletService={mockSocialWalletService} wallet={null} onLogin={mockOnLogin} />
        <PasswordRecoveryModal />
      </TxModalProvider>,
    )

    await waitFor(async () => {
      expect(result.findByText('Continue with Google')).resolves.toBeDefined()
      expect(await result.findByRole('button')).toBeEnabled()
    })
  })

  it('should display a Continue as button and call onLogin when clicked', () => {
    const mockOnLogin = jest.fn()
    mockSocialWalletService.loginAndCreate = jest.fn(() => Promise.resolve(COREKIT_STATUS.LOGGED_IN))

    const result = render(
      <TxModalProvider>
        <SocialSigner socialWalletService={mockSocialWalletService} wallet={mockWallet} onLogin={mockOnLogin} />
        <PasswordRecoveryModal />
      </TxModalProvider>,
    )

    expect(result.getByText('Continue as Test Testermann')).toBeInTheDocument()

    const button = result.getByRole('button')
    button.click()

    expect(mockOnLogin).toHaveBeenCalled()
  })

  it('should display Password Recovery form and display a Continue as button when login succeeds', async () => {
    const mockOnLogin = jest.fn()
    mockSocialWalletService.loginAndCreate = jest.fn(() => Promise.resolve(COREKIT_STATUS.REQUIRED_SHARE))
    mockSocialWalletService.getUserInfo = jest.fn().mockReturnValue(undefined)
    mockSocialWalletService.recoverAccountWithPassword = jest.fn(() => Promise.resolve(true))

    const result = render(
      <TxModalProvider>
        <SocialSigner socialWalletService={mockSocialWalletService} wallet={mockWallet} onLogin={mockOnLogin} />
        <PasswordRecoveryModal />
      </TxModalProvider>,
    )

    await waitFor(() => {
      expect(result.findByText('Continue with Google')).resolves.toBeDefined()
    })

    // We do not automatically invoke the callback as the user did not actively connect
    expect(mockOnLogin).not.toHaveBeenCalled()

    const button = await result.findByRole('button')

    act(() => {
      button.click()
    })

    await waitFor(() => {
      expect(result.findByText('Enter security password')).resolves.toBeDefined()
    })

    const passwordField = await result.findByLabelText('Recovery password')
    const submitButton = await result.findByText('Submit')

    act(() => {
      fireEvent.change(passwordField, { target: { value: 'Test1234!' } })
      submitButton.click()
    })

    mockSocialWalletService.getUserInfo = jest.fn().mockReturnValue({
      email: 'test@testermann.com',
      name: 'Test Testermann',
      profileImage: 'test.testermann.local/profile.png',
    } as unknown as UserInfo)

    result.rerender(
      <TxModalProvider>
        <SocialSigner socialWalletService={mockSocialWalletService} wallet={mockWallet} onLogin={mockOnLogin} />
        <PasswordRecoveryModal />
      </TxModalProvider>,
    )

    await waitFor(() => {
      expect(result.getByText('Continue as Test Testermann')).toBeInTheDocument()
    })
  })

  describe('getSupportedChains', () => {
    const mockEthereumChain = chainBuilder()
      .with({
        chainId: '1',
        chainName: 'Ethereum',
        disabledWallets: ['socialSigner'],
      })
      .build()
    const mockGnosisChain = chainBuilder()
      .with({ chainId: '100', chainName: 'Gnosis Chain', disabledWallets: ['Coinbase'] })
      .build()
    it('returns chain names where social login is enabled', () => {
      const mockGoerliChain = chainBuilder().with({ chainId: '5', chainName: 'Goerli', disabledWallets: [] }).build()

      const mockChains = [mockEthereumChain, mockGnosisChain, mockGoerliChain]
      const result = _getSupportedChains(mockChains)

      expect(result).toEqual(['Gnosis Chain', 'Goerli'])
    })

    it('returns an empty array if social login is not enabled on any chain', () => {
      const mockGoerliChain = chainBuilder()
        .with({ chainId: '5', chainName: 'Goerli', disabledWallets: ['socialSigner'] })
        .build()

      const mockChains = [mockEthereumChain, mockGoerliChain]
      const result = _getSupportedChains(mockChains)

      expect(result).toEqual([])
    })
  })
})
