import { act, render, waitFor } from '@/tests/test-utils'

import { SocialSigner, _getSupportedChains } from '@/components/common/SocialSigner'
import { hexZeroPad } from '@ethersproject/bytes'
import { type EIP1193Provider } from '@web3-onboard/common'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { COREKIT_STATUS, type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import SocialWalletService from '@/services/mpc/SocialWalletService'
import { TxModalProvider } from '@/components/tx-flow'
import { fireEvent } from '@testing-library/react'
import { type ISocialWalletService } from '@/services/mpc/interfaces'

jest.mock('@/services/mpc/SocialWalletService')

const mockWallet = {
  address: hexZeroPad('0x1', 20),
  chainId: '5',
  label: ONBOARD_MPC_MODULE_LABEL,
  provider: {} as unknown as EIP1193Provider,
}

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
        <SocialSigner
          socialWalletService={mockSocialWalletService}
          wallet={mockWallet}
          supportedChains={['Goerli']}
          isMPCLoginEnabled={true}
          onLogin={mockOnLogin}
        />
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

  it('should render google login button and invoke the callback on connection if no wallet is connected on gnosis chain', async () => {
    const mockOnLogin = jest.fn()

    const result = render(
      <TxModalProvider>
        <SocialSigner
          socialWalletService={mockSocialWalletService}
          wallet={null}
          supportedChains={['Goerli']}
          isMPCLoginEnabled={true}
          onLogin={mockOnLogin}
        />
      </TxModalProvider>,
    )

    await waitFor(async () => {
      expect(result.findByText('Continue with Google')).resolves.toBeDefined()
      expect(await result.findByRole('button')).toBeEnabled()
    })

    // We do not automatically invoke the callback as the user did not actively connect
    expect(mockOnLogin).not.toHaveBeenCalled()

    const button = await result.findByRole('button')
    act(() => {
      button.click()
    })

    await waitFor(async () => {
      expect(mockOnLogin).toHaveBeenCalled()
    })
  })

  it('should disable the Google Login button with a message when not on gnosis chain', async () => {
    const result = render(
      <SocialSigner
        socialWalletService={mockSocialWalletService}
        wallet={mockWallet}
        supportedChains={['Goerli']}
        isMPCLoginEnabled={false}
      />,
    )

    expect(result.getByText('Currently only supported on Goerli')).toBeInTheDocument()
    expect(await result.findByRole('button')).toBeDisabled()
  })

  it('should display Password Recovery form and call onLogin if password recovery succeeds', async () => {
    const mockOnLogin = jest.fn()
    mockSocialWalletService.loginAndCreate = jest.fn(() => Promise.resolve(COREKIT_STATUS.REQUIRED_SHARE))
    mockSocialWalletService.getUserInfo = jest.fn(undefined)

    const result = render(
      <TxModalProvider>
        <SocialSigner
          socialWalletService={mockSocialWalletService}
          wallet={mockWallet}
          supportedChains={['Goerli']}
          isMPCLoginEnabled={true}
          onLogin={mockOnLogin}
        />
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

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    })
  })

  describe('getSupportedChains', () => {
    it('returns chain names where social login is enabled', () => {
      const mockEthereumChain = { chainId: '1', chainName: 'Ethereum', disabledWallets: ['socialLogin'] } as ChainInfo
      const mockGnosisChain = { chainId: '100', chainName: 'Gnosis Chain', disabledWallets: ['Coinbase'] } as ChainInfo
      const mockGoerliChain = { chainId: '5', chainName: 'Goerli', disabledWallets: [] } as unknown as ChainInfo

      const mockChains = [mockEthereumChain, mockGnosisChain, mockGoerliChain]
      const result = _getSupportedChains(mockChains)

      expect(result).toEqual(['Gnosis Chain', 'Goerli'])
    })

    it('returns an empty array if social login is not enabled on any chain', () => {
      const mockEthereumChain = { chainId: '1', chainName: 'Ethereum', disabledWallets: ['socialLogin'] } as ChainInfo
      const mockGoerliChain = { chainId: '5', chainName: 'Goerli', disabledWallets: ['socialLogin'] } as ChainInfo

      const mockChains = [mockEthereumChain, mockGoerliChain]
      const result = _getSupportedChains(mockChains)

      expect(result).toEqual([])
    })
  })
})
