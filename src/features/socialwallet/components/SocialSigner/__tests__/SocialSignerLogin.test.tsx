import { render, waitFor } from '@/tests/test-utils'

import { SocialSigner, _getSupportedChains } from '@/features/socialwallet/components/SocialSigner'
import { ONBOARD_MPC_MODULE_LABEL } from '@/features/socialwallet/services/SocialLoginModule'
import { TxModalProvider } from '@/components/tx-flow'
import { connectedWalletBuilder } from '@/tests/builders/wallet'
import { chainBuilder } from '@/tests/builders/chains'
import type { SafeAuthPack, SafeAuthUserInfo } from '@safe-global/auth-kit'
import { setSafeAuthPack } from '@/features/socialwallet/hooks/useSafeAuth'
import { act } from 'react-dom/test-utils'

const mockWallet = connectedWalletBuilder().with({ chainId: '5', label: ONBOARD_MPC_MODULE_LABEL }).build()

describe('SocialSignerLogin', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    setSafeAuthPack(undefined)
  })

  it('should render continue with connected account when on gnosis chain', async () => {
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

    const result = render(
      <TxModalProvider>
        <SocialSigner
          safeAuthPack={mockSafeAuthPack}
          wallet={mockWallet}
          supportedChains={['Goerli']}
          isMPCLoginEnabled={true}
          onLogin={mockOnLogin}
        />
      </TxModalProvider>,
    )

    await waitFor(() => {
      expect(result.queryByText('Continue as Test Testermann')).not.toBeNull()
    })

    // We do not automatically invoke the callback as the user did not actively connect
    expect(mockOnLogin).not.toHaveBeenCalled()

    await act(async () => {
      const button = await result.findByRole('button')
      button.click()
    })

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    })
  })

  it('should render google login button if no wallet is connected on gnosis chain', async () => {
    const mockSafeAuthPack = {
      signIn: jest.fn(),
      isAuthenticated: false,
      init: jest.fn(),
      getProvider: jest.fn(),
      signOut: jest.fn(),
      getUserInfo: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      getSafes: jest.fn(),
      getAddress: jest.fn(),
      getChainId: jest.fn(),
    } as unknown as SafeAuthPack
    setSafeAuthPack(mockSafeAuthPack)

    const mockOnLogin = jest.fn()

    const result = render(
      <TxModalProvider>
        <SocialSigner
          safeAuthPack={mockSafeAuthPack}
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
  })

  it('should display a Continue as button and call onLogin when clicked', async () => {
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

    const result = render(
      <SocialSigner
        safeAuthPack={mockSafeAuthPack}
        wallet={mockWallet}
        supportedChains={['Goerli']}
        isMPCLoginEnabled={true}
        onLogin={mockOnLogin}
      />,
    )

    await waitFor(() => {
      expect(result.queryByText('Continue as Test Testermann')).toBeInTheDocument()
    })

    const button = result.getByRole('button')
    button.click()

    expect(mockOnLogin).toHaveBeenCalled()
  })

  it('should disable the Google Login button with a message when not on gnosis chain', async () => {
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
    const result = render(
      <SocialSigner
        safeAuthPack={mockSafeAuthPack}
        wallet={mockWallet}
        supportedChains={['Goerli']}
        isMPCLoginEnabled={false}
      />,
    )

    expect(result.getByText('Currently only supported on Goerli')).toBeInTheDocument()
    expect(await result.findByRole('button')).toBeDisabled()
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
